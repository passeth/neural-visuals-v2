# Neural Music Video Automation Workflow

## 목표
100개의 바이노럴 비트 음악을 자동으로 생성하고, 각각에 맞는 비주얼 영상을 생성하여 YouTube에 자동 업로드하는 완전 자동화 시스템

---

## 워크플로우 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│  Phase 1: Content Generation                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ 1. Prompt    │ -> │ 2. Music     │ -> │ 3. Video     │  │
│  │ Generation   │    │ Generation   │    │ Generation   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Phase 2: Storage & Management                              │
│  ┌──────────────┐    ┌──────────────┐                      │
│  │ 4. Airtable  │ -> │ 5. YouTube   │                      │
│  │ Storage      │    │ Scheduler    │                      │
│  └──────────────┘    └──────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 1단계: 프롬프트 생성 (100개)

### n8n 워크플로우: Prompt Generator

```json
{
  "name": "Neural Music Prompt Generator",
  "nodes": [
    {
      "name": "Start",
      "type": "n8n-nodes-base.manualTrigger"
    },
    {
      "name": "Generate Prompts",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const categories = {\n  focus: [\n    'Deep Work Focus',\n    'Zen Meditation',\n    'Creative Flow',\n    'Brain Boost',\n    'Mental Clarity'\n  ],\n  relaxation: [\n    'Ocean Waves',\n    'Forest Rain',\n    'Mountain Wind',\n    'Desert Night',\n    'River Flow'\n  ],\n  energy: [\n    'Morning Motivation',\n    'Workout Energy',\n    'Power Hour',\n    'Dynamic Movement',\n    'Peak Performance'\n  ],\n  sleep: [\n    'Deep Sleep',\n    'Lucid Dreams',\n    'Night Rest',\n    'Peaceful Slumber',\n    'Delta Waves'\n  ]\n};\n\nconst frequencies = [\n  { name: '40Hz Gamma', benefit: 'Peak Focus & Cognition' },\n  { name: '14Hz Beta', benefit: 'Active Concentration' },\n  { name: '10Hz Alpha', benefit: 'Relaxed Awareness' },\n  { name: '6Hz Theta', benefit: 'Deep Meditation' },\n  { name: '3Hz Delta', benefit: 'Deep Sleep' }\n];\n\nconst themes = [\n  'mentalfocus', 'zenfocus', 'brainboost', \n  'creativeflow', 'moonlight', 'ocean'\n];\n\nconst colorPresets = ['electric', 'softPink', 'softGreen', 'softYellow'];\n\nconst prompts = [];\nlet id = 1;\n\n// Generate 100 prompts\nfor (const [category, moods] of Object.entries(categories)) {\n  for (const mood of moods) {\n    for (const freq of frequencies) {\n      if (id > 100) break;\n      \n      const theme = themes[Math.floor(Math.random() * themes.length)];\n      const color = colorPresets[Math.floor(Math.random() * colorPresets.length)];\n      \n      prompts.push({\n        id: `NM${String(id).padStart(3, '0')}`,\n        category,\n        mood,\n        frequency: freq.name,\n        benefit: freq.benefit,\n        theme,\n        colorPreset: color,\n        title: `${mood} - ${freq.name} ${freq.benefit}`,\n        description: `Experience ${mood.toLowerCase()} with ${freq.name} binaural beats. Optimized for ${freq.benefit.toLowerCase()}. Perfect for ${category} sessions.`,\n        tags: [category, mood.toLowerCase().replace(' ', '-'), freq.name.split(' ')[0], 'binaural-beats', 'neural-music'],\n        duration: 3600, // 1 hour in seconds\n        musicPrompt: `Create a ${mood.toLowerCase()} binaural beat track at ${freq.name} frequency. Style: ambient, atmospheric, calming. Mood: ${mood}. Purpose: ${freq.benefit}.`\n      });\n      \n      id++;\n    }\n  }\n}\n\nreturn prompts.map(p => ({ json: p }));"
      }
    },
    {
      "name": "Save to Airtable",
      "type": "n8n-nodes-base.airtable",
      "parameters": {
        "operation": "create",
        "application": "YOUR_AIRTABLE_BASE_ID",
        "table": "Music_Production",
        "fields": {
          "ID": "={{ $json.id }}",
          "Title": "={{ $json.title }}",
          "Category": "={{ $json.category }}",
          "Mood": "={{ $json.mood }}",
          "Frequency": "={{ $json.frequency }}",
          "Theme": "={{ $json.theme }}",
          "ColorPreset": "={{ $json.colorPreset }}",
          "Description": "={{ $json.description }}",
          "MusicPrompt": "={{ $json.musicPrompt }}",
          "Tags": "={{ $json.tags.join(', ') }}",
          "Status": "Pending",
          "CreatedAt": "={{ $now.toISO() }}"
        }
      }
    }
  ]
}
```

---

## 2단계: AI 음악 생성

### 옵션 A: Suno AI API (추천)

```javascript
// n8n Code Node
const sunoApiKey = 'YOUR_SUNO_API_KEY';
const prompt = $input.item.json.musicPrompt;
const duration = $input.item.json.duration;

const response = await $http.request({
  method: 'POST',
  url: 'https://api.suno.ai/v1/generate',
  headers: {
    'Authorization': `Bearer ${sunoApiKey}`,
    'Content-Type': 'application/json'
  },
  body: {
    prompt: prompt,
    duration: duration,
    style: 'ambient-binaural',
    instrumental: true,
    make_instrumental: true
  }
});

return {
  json: {
    ...response.data,
    originalId: $input.item.json.id
  }
};
```

### 옵션 B: Udio API

```javascript
// n8n Code Node
const udioApiKey = 'YOUR_UDIO_API_KEY';

const response = await $http.request({
  method: 'POST',
  url: 'https://api.udio.com/v1/generate',
  headers: {
    'Authorization': `Bearer ${udioApiKey}`,
    'Content-Type': 'application/json'
  },
  body: {
    prompt: $input.item.json.musicPrompt,
    duration: $input.item.json.duration,
    genre: 'ambient',
    instrumental: true
  }
});

return { json: response.data };
```

---

## 3단계: 영상 자동 생성

### 방법 A: Headless Browser (Puppeteer) - 추천

```javascript
// n8n Code Node: Video Generator with Puppeteer
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generateVideo() {
  const audioUrl = $input.item.json.audioUrl;
  const theme = $input.item.json.theme;
  const colorPreset = $input.item.json.colorPreset;
  const duration = $input.item.json.duration;
  const outputId = $input.item.json.id;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Set viewport to 1920x1080 (Full HD)
  await page.setViewport({ width: 1920, height: 1080 });

  // Navigate to your visualization app
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Set theme and color preset
  await page.evaluate((theme, colorPreset) => {
    // Simulate selecting theme
    const themeSelect = document.querySelector('select[value*="theme"]');
    themeSelect.value = theme;
    themeSelect.dispatchEvent(new Event('change', { bubbles: true }));

    // Simulate selecting color preset
    const colorSelect = document.querySelector('select[value*="colorPreset"]');
    if (colorSelect) {
      colorSelect.value = colorPreset;
      colorSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, theme, colorPreset);

  // Upload audio file
  await page.evaluate(async (audioUrl) => {
    const response = await fetch(audioUrl);
    const blob = await response.blob();
    const file = new File([blob], 'audio.mp3', { type: 'audio/mpeg' });

    const input = document.querySelector('input[type="file"]');
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    input.files = dataTransfer.files;

    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, audioUrl);

  // Wait for audio to load
  await page.waitForTimeout(2000);

  // Click play button
  await page.evaluate(() => {
    const playButton = document.querySelector('button[class*="audio-play"]');
    playButton.click();
  });

  // Start screen recording
  const outputPath = `/tmp/video_${outputId}.webm`;

  await page.evaluate(() => {
    return new Promise((resolve) => {
      // Record for duration
      setTimeout(resolve, duration * 1000);
    });
  });

  await browser.close();

  return {
    videoPath: outputPath,
    id: outputId
  };
}

const result = await generateVideo();
return { json: result };
```

### 방법 B: FFmpeg 기반 자동화 (더 간단)

```javascript
// n8n Execute Command Node
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const audioFile = $input.item.json.audioFilePath;
const theme = $input.item.json.theme;
const outputId = $input.item.json.id;

// Take screenshots of the visualization
const screenshotCmd = `
  node scripts/capture-visualization.js \
    --theme=${theme} \
    --color=${$input.item.json.colorPreset} \
    --output=/tmp/frames_${outputId}
`;

await execPromise(screenshotCmd);

// Create video from screenshots + audio
const ffmpegCmd = `
  ffmpeg -framerate 60 -pattern_type glob -i '/tmp/frames_${outputId}/*.png' \
    -i ${audioFile} \
    -c:v libx264 -pix_fmt yuv420p -preset slow -crf 18 \
    -c:a aac -b:a 192k \
    -shortest \
    /tmp/video_${outputId}.mp4
`;

await execPromise(ffmpegCmd);

return {
  json: {
    videoPath: `/tmp/video_${outputId}.mp4`,
    id: outputId
  }
};
```

---

## 4단계: Airtable 저장

### n8n Airtable Node 설정

```json
{
  "name": "Update Airtable with Assets",
  "type": "n8n-nodes-base.airtable",
  "parameters": {
    "operation": "update",
    "application": "YOUR_AIRTABLE_BASE_ID",
    "table": "Music_Production",
    "id": "={{ $json.airtableRecordId }}",
    "fields": {
      "AudioFile": [
        {
          "url": "={{ $json.audioUrl }}"
        }
      ],
      "VideoFile": [
        {
          "url": "={{ $json.videoUrl }}"
        }
      ],
      "Status": "Ready for Upload",
      "ProcessedAt": "={{ $now.toISO() }}",
      "FileSize_MB": "={{ $json.videoSizeMB }}",
      "Duration_Sec": "={{ $json.duration }}"
    }
  }
}
```

---

## 5단계: YouTube 자동 업로드 (스케줄링)

### n8n 워크플로우: YouTube Upload Scheduler

```json
{
  "name": "YouTube Upload Scheduler",
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.cron",
      "parameters": {
        "triggerTimes": {
          "item": [
            {
              "mode": "everyDay",
              "hour": 10,
              "minute": 0
            }
          ]
        }
      }
    },
    {
      "name": "Get Next Video from Airtable",
      "type": "n8n-nodes-base.airtable",
      "parameters": {
        "operation": "list",
        "application": "YOUR_AIRTABLE_BASE_ID",
        "table": "Music_Production",
        "filterByFormula": "AND({Status} = 'Ready for Upload', {ScheduledDate} <= TODAY())",
        "limit": 1,
        "sort": [
          {
            "field": "ScheduledDate",
            "direction": "asc"
          }
        ]
      }
    },
    {
      "name": "Upload to YouTube",
      "type": "n8n-nodes-base.youTube",
      "parameters": {
        "resource": "video",
        "operation": "upload",
        "title": "={{ $json.Title }}",
        "description": "={{ $json.Description }}\n\n🎵 Binaural Beats: {{ $json.Frequency }}\n✨ Theme: {{ $json.Theme }}\n🎯 Purpose: {{ $json.Benefit }}\n\n#BinauralBeats #{{ $json.Category }} #{{ $json.Frequency.replace(' ', '') }}",
        "tags": "={{ $json.Tags }}",
        "categoryId": "10",
        "privacyStatus": "public",
        "videoFileUrl": "={{ $json.VideoFile[0].url }}"
      }
    },
    {
      "name": "Update Airtable Status",
      "type": "n8n-nodes-base.airtable",
      "parameters": {
        "operation": "update",
        "application": "YOUR_AIRTABLE_BASE_ID",
        "table": "Music_Production",
        "id": "={{ $json.id }}",
        "fields": {
          "Status": "Published",
          "YouTubeVideoId": "={{ $json.videoId }}",
          "YouTubeUrl": "https://youtube.com/watch?v={{ $json.videoId }}",
          "PublishedAt": "={{ $now.toISO() }}"
        }
      }
    }
  ]
}
```

---

## Airtable 데이터베이스 스키마

### Table: Music_Production

| Field Name | Type | Description |
|------------|------|-------------|
| ID | Single line text | NM001-NM100 |
| Title | Single line text | Video title |
| Category | Single select | focus, relaxation, energy, sleep |
| Mood | Single line text | Deep Work Focus, etc. |
| Frequency | Single line text | 40Hz Gamma, etc. |
| Benefit | Single line text | Peak Focus & Cognition |
| Theme | Single select | mentalfocus, zenfocus, etc. |
| ColorPreset | Single select | electric, softPink, etc. |
| Description | Long text | Full description |
| MusicPrompt | Long text | AI music generation prompt |
| Tags | Multiple select | Hashtags |
| Status | Single select | Pending, Processing, Ready, Published |
| AudioFile | Attachment | MP3/WAV file |
| VideoFile | Attachment | MP4/WebM file |
| YouTubeVideoId | Single line text | YouTube video ID |
| YouTubeUrl | URL | Full YouTube URL |
| ScheduledDate | Date | Planned publish date |
| CreatedAt | Date | Record creation time |
| ProcessedAt | Date | Processing completion time |
| PublishedAt | Date | YouTube publish time |
| Views | Number | YouTube view count (sync daily) |
| Duration_Sec | Number | Video duration in seconds |
| FileSize_MB | Number | Video file size |

---

## 예상 비용 및 시간

### 비용 (100개 영상 기준)
- **Suno AI**: $30-50/월 (Pro plan)
- **n8n**: Self-hosted (무료) 또는 Cloud ($20-50/월)
- **Airtable**: Free tier (충분함)
- **YouTube API**: 무료 (할당량 내)
- **서버/컴퓨팅**: AWS EC2 t3.large ($50-100/월)

**총 예상 비용**: $100-200/월

### 처리 시간 (100개 영상)
1. 프롬프트 생성: 5분
2. 음악 생성: 100개 × 5분 = 500분 (8.3시간) - 병렬 처리 시 2-3시간
3. 영상 생성: 100개 × 10분 = 1000분 (16.6시간) - 병렬 처리 시 4-6시간
4. Airtable 저장: 10분
5. YouTube 업로드: 100개 × 2분 = 200분 (3.3시간) - 스케줄링으로 분산

**총 처리 시간**: 병렬 처리 시 약 12-15시간

---

## 다음 단계

1. ✅ 프롬프트 생성 워크플로우 구축
2. ✅ Airtable 베이스 생성 및 스키마 설정
3. ⬜ Suno/Udio API 키 발급
4. ⬜ 영상 생성 자동화 스크립트 개발
5. ⬜ YouTube API 설정 및 OAuth 인증
6. ⬜ n8n 워크플로우 통합 테스트
7. ⬜ 스케줄링 및 자동화 실행

---

## 주의사항

### YouTube 할당량
- 일일 할당량: 10,000 units
- 업로드 1회: 1,600 units
- **하루 최대 6개 영상 업로드 가능**
- 100개 영상 = 약 17일 소요

### 추천 스케줄
- 주 5일 × 2개 = 주 10개 영상
- 100개 완료 = 10주 (2.5개월)

---

**작성일**: 2025-11-09
**버전**: 1.0
**상태**: Draft - Ready for Implementation
