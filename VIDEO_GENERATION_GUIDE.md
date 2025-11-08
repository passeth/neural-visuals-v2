# 영상 생성 가이드

Neural Visuals v2로 음악과 함께 자동으로 영상을 생성하는 방법을 설명합니다.

## 📋 사전 준비

### 1. FFmpeg 설치

**Windows:**
```bash
# Chocolatey로 설치 (권장)
choco install ffmpeg

# 또는 수동 설치
# 1. https://ffmpeg.org/download.html 에서 다운로드
# 2. PATH 환경변수에 추가
```

**macOS:**
```bash
brew install ffmpeg
```

### 2. Node 패키지 설치

```bash
npm install
```

### 3. 폴더 구조 준비

```
10-neural-visuals-v2/
├── audio/              # 음악 파일들 (MP3)
│   ├── NM001.mp3
│   ├── NM002.mp3
│   └── ...
├── output/             # 생성된 영상 (자동 생성됨)
│   ├── NM001_final.mp4
│   ├── NM002_final.mp4
│   └── ...
└── neural-music-100-tracks-complete.csv
```

## 🎬 영상 생성 방법

### 방법 1: 단일 영상 생성

```bash
# 1. Vite 개발 서버 실행 (터미널 1)
npm run dev

# 2. 영상 생성 (터미널 2)
node generate_video.js \
  --track NM001 \
  --audio ./audio/NM001.mp3 \
  --theme mentalfocus \
  --color electric
```

**파라미터 설명:**
- `--track`: 트랙 ID (예: NM001)
- `--audio`: 음악 파일 경로
- `--theme`: 비주얼 테마
  - `mentalfocus`, `brainboost`, `zenfocus`, `creativeflow`, `moonlight`, `ocean`
- `--color`: 색상 프리셋
  - Mental Focus/Brain Boost: `electric`, `softPink`, `softGreen`, `softYellow`
  - Ocean: `midnight`, `tropical`, `sunset`, `arctic`, `emerald`

### 방법 2: CSV에서 배치 생성 (100개 자동)

```bash
# 1. Vite 개발 서버 실행
npm run dev

# 2. 배치 생성 (다른 터미널에서)
node generate_video.js --batch ./neural-music-100-tracks-complete.csv
```

이 방법은 CSV 파일의 모든 트랙을 자동으로 처리합니다:
- CSV에서 테마와 색상을 자동으로 읽음
- `./audio/` 폴더에서 음악 파일 자동 매칭
- 순차적으로 100개 영상 생성

## ⚙️ 설정 커스터마이징

[generate_video.js](generate_video.js) 파일의 CONFIG 섹션을 수정:

```javascript
const CONFIG = {
  width: 1920,        // 영상 가로 크기
  height: 1080,       // 영상 세로 크기
  fps: 60,           // 프레임레이트
  duration: 3600,    // 길이 (초) - 기본 1시간
  outputDir: './output',  // 출력 폴더
};
```

## 🎯 워크플로우 예시

### 완전 자동화 워크플로우

```bash
# Step 1: 음악 생성 (ElevenLabs API)
# - n8n 워크플로우로 100개 음악 생성
# - ./audio/ 폴더에 저장

# Step 2: 개발 서버 실행
npm run dev

# Step 3: 영상 배치 생성 (새 터미널)
node generate_video.js --batch ./neural-music-100-tracks-complete.csv

# 예상 소요시간:
# - 1시간 영상 x 100개 = ~100시간 (4일)
# - 병렬 처리 시 시간 단축 가능
```

### 테스트용 짧은 영상

빠른 테스트를 위해 30초 샘플 생성:

```javascript
// generate_video.js 수정
const CONFIG = {
  // ...
  duration: 30,  // 30초로 변경
};
```

```bash
node generate_video.js --track NM001 --audio ./audio/NM001.mp3 --theme ocean --color midnight
```

## 🔧 트러블슈팅

### "FFmpeg not found" 오류
```bash
# Windows
where ffmpeg

# macOS/Linux
which ffmpeg

# 없으면 설치 필요
```

### "Audio file not found" 오류
- `./audio/` 폴더에 음악 파일이 있는지 확인
- 파일명이 트랙 ID와 일치하는지 확인 (예: `NM001.mp3`)

### 화면 녹화가 잘못된 영역을 캡처
- 브라우저 창이 화면 좌상단(0,0)에 위치하는지 확인
- 또는 `generate_video.js`의 `offset_x`, `offset_y` 값 조정

### 영상이 너무 느리거나 빠름
- [ControlPanel.tsx](src/components/ControlPanel.tsx)에서 Speed 파라미터 조정
- 또는 스크립트에서 자동 조정 추가:

```javascript
await page.evaluate(() => {
  const speedSlider = document.querySelector('input[type="range"]');
  if (speedSlider) {
    speedSlider.value = '0.5';  // 원하는 속도
    speedSlider.dispatchEvent(new Event('input', { bubbles: true }));
  }
});
```

## 📊 성능 최적화

### 병렬 처리

여러 인스턴스를 동시에 실행:

```bash
# 터미널 1
node generate_video.js --batch ./tracks_01-25.csv

# 터미널 2
node generate_video.js --batch ./tracks_26-50.csv

# 터미널 3
node generate_video.js --batch ./tracks_51-75.csv

# 터미널 4
node generate_video.js --batch ./tracks_76-100.csv
```

CSV를 분할하려면:
```bash
python split_csv.py neural-music-100-tracks-complete.csv 4
```

### GPU 가속 활성화

FFmpeg에서 NVENC(NVIDIA) 또는 Quick Sync(Intel) 사용:

```javascript
// generate_video.js에서 변경
const recordProcess = spawn('ffmpeg', [
  // ...
  '-c:v', 'h264_nvenc',  // NVIDIA GPU
  // 또는
  '-c:v', 'h264_qsv',    // Intel Quick Sync
  // ...
]);
```

## 🚀 다음 단계

영상 생성 후:

1. **Airtable 업로드**: [AUTOMATION_WORKFLOW.md](AUTOMATION_WORKFLOW.md) 참고
2. **YouTube 업로드**: 자동화 스크립트로 일정 게시
3. **썸네일 생성**: 각 테마별 썸네일 템플릿 제작

## 🎨 방법 2: 수동 녹화 (간단함)

자동화가 어려운 경우 수동으로:

1. `npm run dev`로 앱 실행
2. 테마와 색상 선택
3. 음악 업로드
4. OBS Studio로 화면 녹화
   - 화면 캡처 소스 추가
   - 음악은 앱에서 재생
   - 1시간 녹화
5. MP4로 export

**장점**: 설정이 간단함
**단점**: 100개 수동 작업 필요

---

**질문이나 문제가 있으면 이슈 등록해주세요!**
