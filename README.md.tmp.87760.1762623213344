# Neural Visuals v2 🌊

바이노럴 비트 시각화 시스템 - 음악과 함께 자동으로 영상을 생성하는 완전 자동화 플랫폼

## 🎯 주요 기능

- **6가지 테마**: Mental Focus, Brain Boost, Zen Focus, Creative Flow, Moonlight, Ocean Waves
- **컬러 프리셋**: 각 테마별 4-5가지 색상 조합
- **오디오 반응형**: 실시간 음악 분석으로 비주얼 변화
- **100개 트랙**: 완성된 CSV 데이터베이스
- **n8n 자동화**: 음악 → 영상 → YouTube 완전 자동 파이프라인

## 🚀 빠른 시작

### 로컬 개발

```bash
npm install
npm run dev
```

http://localhost:5173 에서 확인

### Vercel 배포 (프론트엔드)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/neural-visuals-v2)

1. GitHub에서 "New repository" 생성
2. 이 코드 푸시
3. Vercel에서 "Import Project" → GitHub 연결
4. 자동 빌드 & 배포

### Railway 배포 (영상 생성 서버)

영상 자동 생성을 위해서는 Docker 서버가 필요합니다:

1. [Railway.app](https://railway.app) 가입
2. "New Project" → "Deploy from GitHub"
3. 이 저장소 선택
4. 자동으로 Dockerfile 감지하고 배포

## 📁 프로젝트 구조

```
10-neural-visuals-v2/
├── src/                    # React + Three.js 앱
│   ├── themes/            # 6가지 비주얼 테마
│   ├── components/        # UI 컴포넌트
│   └── hooks/            # 오디오 시스템
├── generate_video.js      # 영상 생성 스크립트
├── server.js              # REST API 서버
├── Dockerfile            # Docker 컨테이너
├── neural-music-100-tracks-complete.csv  # 트랙 데이터
└── 가이드 문서들
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

- **Frontend**: React + TypeScript + Vite
- **3D Graphics**: Three.js + React Three Fiber
- **Audio**: Web Audio API
- **Video Generation**: Puppeteer + FFmpeg
- **Automation**: n8n
- **Deployment**: Vercel (frontend) + Railway (backend)

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
