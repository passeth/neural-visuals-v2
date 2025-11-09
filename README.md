# Neural Visuals v2 🌊

바이노럴 비트 시각화 시스템 - 브라우저에서 음악과 함께 3D 비주얼을 실시간 재생하고 영상으로 녹화하는 웹 앱

**Live Demo**: [https://neural-visuals-v2.vercel.app](https://neural-visuals-v2.vercel.app) (배포 후 업데이트 예정)

## 🎯 주요 기능

### 웹 앱 기능 (브라우저)
- **6가지 3D 테마**: Mental Focus, Brain Boost, Zen Focus, Creative Flow, Moonlight, Ocean Waves
- **컬러 프리셋**: 각 테마별 4-5가지 색상 조합
- **오디오 반응형**: 실시간 음악 분석으로 비주얼 변화
- **오디오 플레이어**: 프리셋 음악 또는 사용자 업로드
- **영상 녹화**:
  - 자동 생성: 음악 전체 길이 자동 녹화
  - 수동 녹화: 원하는 구간만 녹화
  - WebM 포맷 (VP9 코덱) 다운로드

### 자동화 시스템 (선택)
- **100개 트랙**: 완성된 CSV 데이터베이스
- **n8n 자동화**: 음악 → 영상 → YouTube 완전 자동 파이프라인

## 🚀 빠른 시작

### 로컬 개발

```bash
npm install
npm run dev
```

http://localhost:5173 에서 확인

### Vercel 배포 (웹 앱)

GitHub 저장소: [https://github.com/passeth/neural-visuals-v2](https://github.com/passeth/neural-visuals-v2)

1. [Vercel](https://vercel.com) 접속 후 로그인
2. "Add New" → "Project" 클릭
3. GitHub 저장소 `passeth/neural-visuals-v2` 선택
4. 빌드 설정 확인:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. "Deploy" 클릭
6. 배포 완료 후 제공되는 URL 확인 (예: `https://neural-visuals-v2.vercel.app`)

**중요**: `public/audio/` 폴더에 MP3 파일이 포함되어야 프리셋 음악이 작동합니다.

### Railway 배포 (영상 생성 서버 - 선택)

자동 배치 영상 생성을 원한다면 Docker 서버를 배포할 수 있습니다:

1. [Railway.app](https://railway.app) 가입
2. "New Project" → "Deploy from GitHub"
3. 이 저장소 선택
4. 자동으로 Dockerfile 감지하고 배포

**참고**: 웹 앱만 사용한다면 Railway 배포는 필요 없습니다. 브라우저에서 직접 녹화 가능합니다.

## 📁 프로젝트 구조

```
10-neural-visuals-v2/
├── src/
│   ├── themes/               # 6가지 3D 비주얼 테마
│   │   ├── MentalFocus.tsx   # ⚡ Mental Focus
│   │   ├── BrainBoost.tsx    # 🚀 Brain Boost
│   │   ├── ZenFocus.tsx      # 🧘 Zen Focus
│   │   ├── CreativeFlow.tsx  # 🎨 Creative Flow
│   │   ├── MoonlightParticles.tsx  # 🌙 Moonlight
│   │   └── OceanWaves.tsx    # 🌊 Ocean Waves
│   ├── components/
│   │   └── ControlPanel.tsx  # 오디오/비디오 컨트롤
│   ├── hooks/
│   │   ├── useAudioSystem.ts      # Web Audio API 관리
│   │   └── useVideoRecorder.ts    # MediaRecorder API
│   ├── types.ts              # TypeScript 타입 정의
│   ├── App.tsx               # 메인 앱
│   └── index.css             # 스타일
├── public/
│   └── audio/               # 프리셋 MP3 파일들
├── generate_video.js        # 영상 생성 스크립트 (서버용)
├── server.js                # REST API 서버 (서버용)
├── Dockerfile               # Docker 컨테이너 (서버용)
└── neural-music-100-tracks-complete.csv  # 트랙 데이터
```

## 📚 문서

- [AUTOMATION_WORKFLOW.md](AUTOMATION_WORKFLOW.md) - 전체 자동화 워크플로우
- [N8N_AUTOMATION_GUIDE.md](N8N_AUTOMATION_GUIDE.md) - n8n 설정 가이드
- [VIDEO_GENERATION_GUIDE.md](VIDEO_GENERATION_GUIDE.md) - 영상 생성 방법

## 🎨 테마

### Mental Focus ⚡
날카로운 집중력을 위한 강렬한 파티클 움직임

### Brain Boost 🚀
폭발적인 에너지와 역동적인 움직임

### Zen Focus 🧘
차분하고 우아한 흐름

### Creative Flow 🎨
유기적이고 상상력 넘치는 패턴

### Moonlight 🌙
달빛이 물결치는 3D 파티클 메시

### Ocean Waves 🌊
평온한 바다 표면과 윤슬

## 🔄 자동화 파이프라인

```
1. ElevenLabs → 음악 생성 (MP3)
2. n8n → 워크플로우 트리거
3. Railway → 영상 생성 (Puppeteer + FFmpeg)
4. Airtable → 메타데이터 저장
5. YouTube → 자동 업로드 & 예약
```

## 🛠️ 기술 스택

### 웹 앱 (브라우저)
- **Frontend**: React 18 + TypeScript + Vite
- **3D Graphics**: Three.js + React Three Fiber + @react-three/drei
- **Audio**: Web Audio API (AnalyserNode, AudioContext)
- **Video Recording**: MediaRecorder API (WebM/VP9)
- **Deployment**: Vercel

### 자동화 시스템 (선택)
- **Video Generation**: Puppeteer + FFmpeg (Node.js)
- **Automation**: n8n
- **Backend**: Express.js REST API
- **Deployment**: Railway (Docker)

## 📊 API

### 영상 생성

```bash
POST https://your-server.railway.app/api/generate
Content-Type: multipart/form-data

{
  "trackId": "NM001",
  "theme": "ocean",
  "colorPreset": "midnight",
  "duration": 3600,
  "audio": <file>
}
```

### 배치 생성

```bash
POST https://your-server.railway.app/api/batch
Content-Type: application/json

{
  "tracks": [
    {
      "trackId": "NM001",
      "audioUrl": "https://...",
      "theme": "ocean",
      "colorPreset": "midnight"
    }
  ]
}
```

## 🎵 100개 트랙

CSV 파일에 완성된 100개 트랙 데이터:
- 트랙 ID, 제목, 음악 프롬프트
- YouTube 제목 & 캡션 (한국어/영어)
- 테마 & 컬러 프리셋

## 📝 라이선스

MIT

## 👤 제작자

seulkiji

---

**Neural Visuals v2** - 음악과 함께 흐르는 시각적 명상 ✨
