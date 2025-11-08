/**
 * Neural Visuals - Automated Video Generator
 *
 * 음악 파일과 설정을 받아서 자동으로 영상을 생성합니다.
 * Puppeteer로 브라우저를 제어하고 FFmpeg로 음악과 합성합니다.
 */

const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 설정
const CONFIG = {
  width: 1920,
  height: 1080,
  fps: 60,
  duration: 3600, // 1 hour in seconds
  outputDir: './output',
};

/**
 * 영상 생성 메인 함수
 * @param {Object} options - 영상 생성 옵션
 * @param {string} options.trackId - 트랙 ID (예: NM001)
 * @param {string} options.audioPath - 음악 파일 경로
 * @param {string} options.theme - 테마 (mentalfocus, brainboost, ocean 등)
 * @param {string} options.colorPreset - 색상 프리셋 (electric, softPink 등)
 * @param {number} options.duration - 영상 길이 (초)
 */
async function generateVideo(options) {
  const {
    trackId,
    audioPath,
    theme = 'mentalfocus',
    colorPreset = 'electric',
    duration = CONFIG.duration,
  } = options;

  console.log(`\n🎬 Starting video generation for ${trackId}`);
  console.log(`   Theme: ${theme}`);
  console.log(`   Color: ${colorPreset}`);
  console.log(`   Duration: ${duration}s`);

  // 1. 브라우저 실행
  console.log('\n🌐 Launching browser...');
  const browser = await puppeteer.launch({
    headless: false, // 디버그용 false, 실제 사용시 true
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      `--window-size=${CONFIG.width},${CONFIG.height}`,
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: CONFIG.width,
    height: CONFIG.height,
  });

  // 2. 앱 로드
  console.log('📱 Loading Neural Visuals app...');
  const appUrl = 'http://localhost:5173'; // Vite dev server
  await page.goto(appUrl, { waitUntil: 'networkidle0' });

  // 3. 테마 및 설정 적용
  console.log('🎨 Applying theme and settings...');
  await page.evaluate((theme, colorPreset) => {
    // 테마 선택
    const themeSelect = document.querySelector('select');
    if (themeSelect) {
      themeSelect.value = theme;
      themeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // 색상 프리셋 선택 (1초 대기 후 - DOM 업데이트 기다림)
    setTimeout(() => {
      const colorSelect = Array.from(document.querySelectorAll('select'))
        .find(s => s.previousElementSibling?.textContent?.includes('Color'));
      if (colorSelect) {
        colorSelect.value = colorPreset;
        colorSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, 1000);

    // 컨트롤 패널 숨기기
    setTimeout(() => {
      const controlPanel = document.querySelector('.control-panel');
      if (controlPanel) {
        controlPanel.style.display = 'none';
      }
      const dedication = document.querySelector('.dedication');
      if (dedication) {
        dedication.style.display = 'none';
      }
    }, 2000);
  }, theme, colorPreset);

  // 4. 화면 안정화 대기
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 5. 화면 녹화 시작
  console.log('🎥 Starting screen recording...');
  const videoPath = path.join(CONFIG.outputDir, `${trackId}_visual.mp4`);
  const finalPath = path.join(CONFIG.outputDir, `${trackId}_final.mp4`);

  // ffmpeg로 화면 녹화 (Windows)
  const recordProcess = spawn('ffmpeg', [
    '-f', 'gdigrab',
    '-framerate', CONFIG.fps.toString(),
    '-offset_x', '0',
    '-offset_y', '0',
    '-video_size', `${CONFIG.width}x${CONFIG.height}`,
    '-i', 'desktop',
    '-t', duration.toString(),
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-pix_fmt', 'yuv420p',
    videoPath,
  ]);

  recordProcess.stderr.on('data', (data) => {
    process.stdout.write('.');
  });

  await new Promise((resolve, reject) => {
    recordProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Visual recording complete');
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
  });

  // 6. 브라우저 종료
  await browser.close();

  // 7. 음악과 합성
  console.log('\n🎵 Merging audio and visual...');
  const mergeProcess = spawn('ffmpeg', [
    '-i', videoPath,
    '-i', audioPath,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    finalPath,
  ]);

  await new Promise((resolve, reject) => {
    mergeProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Final video complete');
        // 임시 비디오 파일 삭제
        fs.unlinkSync(videoPath);
        resolve();
      } else {
        reject(new Error(`FFmpeg merge failed with code ${code}`));
      }
    });
  });

  console.log(`\n🎉 Video generated successfully: ${finalPath}\n`);
  return finalPath;
}

/**
 * CSV 파일에서 배치 생성
 */
async function generateBatch(csvPath) {
  const csv = require('csv-parser');
  const tracks = [];

  // CSV 읽기
  await new Promise((resolve) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => tracks.push(row))
      .on('end', resolve);
  });

  console.log(`📋 Found ${tracks.length} tracks to process`);

  // output 디렉토리 생성
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  // 각 트랙 처리
  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    const audioPath = path.join('./audio', `${track.ID}.mp3`);

    // 음악 파일이 있는지 확인
    if (!fs.existsSync(audioPath)) {
      console.log(`⚠️  Skipping ${track.ID}: Audio file not found`);
      continue;
    }

    try {
      await generateVideo({
        trackId: track.ID,
        audioPath,
        theme: track.Theme,
        colorPreset: track.ColorPreset,
        duration: CONFIG.duration,
      });

      console.log(`✅ Progress: ${i + 1}/${tracks.length} completed`);
    } catch (error) {
      console.error(`❌ Error processing ${track.ID}:`, error.message);
    }

    // 다음 영상 전 대기 (시스템 안정화)
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log('\n🎊 All videos generated successfully!');
}

// CLI 실행
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Usage:
  Single video:
    node generate_video.js --track NM001 --audio ./audio/NM001.mp3 --theme mentalfocus --color electric

  Batch from CSV:
    node generate_video.js --batch ./neural-music-100-tracks-complete.csv
    `);
    process.exit(1);
  }

  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    options[key] = value;
  }

  if (options.batch) {
    generateBatch(options.batch).catch(console.error);
  } else {
    generateVideo({
      trackId: options.track,
      audioPath: options.audio,
      theme: options.theme,
      colorPreset: options.color,
    }).catch(console.error);
  }
}

module.exports = { generateVideo, generateBatch };
