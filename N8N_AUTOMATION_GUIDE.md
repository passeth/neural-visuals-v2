# n8n 자동화 가이드 - Neural Visuals

Git + n8n + Docker로 음악이 생성되면 자동으로 영상을 만들어 YouTube에 올리는 완전 자동화 시스템

## 📋 시스템 아키텍처

```
┌─────────────────┐
│  ElevenLabs API │ → 음악 생성 (MP3)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Google Drive  │ → 음악 파일 저장
│   or Dropbox    │
└────────┬────────┘
         │
         ↓ (Webhook/Poll)
┌─────────────────┐
│      n8n        │ → 워크플로우 트리거
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Docker Server  │ → 영상 생성 (Node.js + FFmpeg + Puppeteer)
│  (AWS/Railway)  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Airtable DB   │ → 메타데이터 저장
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  YouTube API    │ → 자동 업로드 & 예약
└─────────────────┘
```

## 🐳 1단계: Docker 컨테이너 준비

### Dockerfile 생성

```dockerfile
FROM node:20-slim

# Install FFmpeg, Chromium, Python
RUN apt-get update && apt-get install -y \
    ffmpeg \
    chromium \
    chromium-driver \
    python3 \
    python3-pip \
    wget \
    xvfb \
    x11vnc \
    fluxbox \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Copy application
COPY . .

# Build Vite app
RUN npm run build

# Environment variables
ENV NODE_ENV=production
ENV DISPLAY=:99
ENV PORT=3000

# Create directories
RUN mkdir -p /app/output /app/audio /app/temp

# Expose ports
EXPOSE 3000 5900

# Start script
COPY docker-start.sh /app/docker-start.sh
RUN chmod +x /app/docker-start.sh

CMD ["/app/docker-start.sh"]
```

### docker-start.sh

```bash
#!/bin/bash

# Start virtual display
Xvfb :99 -screen 0 1920x1080x24 &
export DISPLAY=:99

# Optional: VNC for debugging
x11vnc -display :99 -forever -nopw -quiet &

# Start Vite preview server
npm run preview &
VITE_PID=$!

# Wait for server
sleep 10

# Start video generation API
node /app/server.js &
SERVER_PID=$!

# Keep container running
wait $VITE_PID $SERVER_PID
```

### server.js - API 서버

```javascript
/**
 * Express API for video generation
 * n8n에서 호출할 REST API
 */

const express = require('express');
const multer = require('multer');
const { generateVideo } = require('./generate_video');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: '/app/audio/' });

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'neural-visuals-generator' });
});

// Generate video endpoint
app.post('/api/generate', upload.single('audio'), async (req, res) => {
  try {
    const {
      trackId,
      theme = 'mentalfocus',
      colorPreset = 'electric',
      duration = 3600,
    } = req.body;

    // Validate
    if (!trackId || !req.file) {
      return res.status(400).json({ error: 'Missing trackId or audio file' });
    }

    console.log(`📥 Received request: ${trackId}, ${theme}, ${colorPreset}`);

    // Move uploaded file
    const audioPath = path.join('/app/audio', `${trackId}.mp3`);
    fs.renameSync(req.file.path, audioPath);

    // Generate video
    const videoPath = await generateVideo({
      trackId,
      audioPath,
      theme,
      colorPreset,
      duration: parseInt(duration),
    });

    console.log(`✅ Video generated: ${videoPath}`);

    // Return video file
    res.download(videoPath, `${trackId}_final.mp4`, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Clean up files
      try {
        fs.unlinkSync(audioPath);
        fs.unlinkSync(videoPath);
      } catch (e) {
        console.error('Cleanup error:', e);
      }
    });
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Batch generate endpoint
app.post('/api/batch', async (req, res) => {
  try {
    const { tracks } = req.body; // Array of track configs

    if (!Array.isArray(tracks) || tracks.length === 0) {
      return res.status(400).json({ error: 'Invalid tracks array' });
    }

    const results = [];

    for (const track of tracks) {
      try {
        // Download audio from URL
        const audioPath = path.join('/app/audio', `${track.trackId}.mp3`);
        await downloadFile(track.audioUrl, audioPath);

        // Generate video
        const videoPath = await generateVideo({
          trackId: track.trackId,
          audioPath,
          theme: track.theme,
          colorPreset: track.colorPreset,
          duration: track.duration || 3600,
        });

        results.push({
          trackId: track.trackId,
          status: 'success',
          videoPath,
        });

        // Clean up audio
        fs.unlinkSync(audioPath);
      } catch (error) {
        results.push({
          trackId: track.trackId,
          status: 'error',
          error: error.message,
        });
      }
    }

    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper: Download file
async function downloadFile(url, dest) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(buffer));
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Video generation API running on port ${PORT}`);
});
```

## 🔧 2단계: 서버 배포

### Railway (추천 - 간단함)

```bash
# 1. Git 저장소 생성
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/neural-visuals-v2.git
git push -u origin main

# 2. Railway 배포
# https://railway.app 에서 New Project → Deploy from GitHub
# 자동으로 Dockerfile을 감지하고 배포됨
```

### AWS EC2 (고급 - 성능 좋음)

```bash
# 1. EC2 인스턴스 생성 (t3.large 이상 권장)

# 2. Docker 설치
sudo yum update -y
sudo yum install docker -y
sudo service docker start

# 3. 코드 clone
git clone https://github.com/your-username/neural-visuals-v2.git
cd neural-visuals-v2

# 4. Docker 빌드 & 실행
sudo docker build -t neural-visuals .
sudo docker run -d -p 3000:3000 --name neural-visuals neural-visuals

# 5. nginx로 리버스 프록시 설정
sudo yum install nginx -y
# /etc/nginx/nginx.conf 설정
```

## 📊 3단계: n8n 워크플로우 설정

### 워크플로우 1: 음악 생성 → 영상 생성

```json
{
  "name": "Neural Visuals - Auto Video Generation",
  "nodes": [
    {
      "name": "Webhook - New Track",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "parameters": {
        "path": "new-track",
        "responseMode": "responseNode",
        "options": {}
      }
    },
    {
      "name": "Download Audio from ElevenLabs",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [450, 300],
      "parameters": {
        "method": "GET",
        "url": "={{ $json.audioUrl }}",
        "options": {
          "response": {
            "response": {
              "responseFormat": "file"
            }
          }
        }
      }
    },
    {
      "name": "Generate Video",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [650, 300],
      "parameters": {
        "method": "POST",
        "url": "https://your-server.railway.app/api/generate",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "trackId",
              "value": "={{ $json.trackId }}"
            },
            {
              "name": "theme",
              "value": "={{ $json.theme }}"
            },
            {
              "name": "colorPreset",
              "value": "={{ $json.colorPreset }}"
            },
            {
              "name": "duration",
              "value": "3600"
            }
          ]
        },
        "options": {
          "bodyContentType": "multipart-form-data",
          "response": {
            "response": {
              "responseFormat": "file"
            }
          }
        },
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "audio",
              "value": "={{ $binary.data }}"
            }
          ]
        }
      }
    },
    {
      "name": "Upload to Airtable",
      "type": "n8n-nodes-base.airtable",
      "typeVersion": 1,
      "position": [850, 300],
      "parameters": {
        "operation": "create",
        "application": "appXXXXXXXXXXXXXX",
        "table": "Videos",
        "fields": {
          "Track_ID": "={{ $json.trackId }}",
          "Theme": "={{ $json.theme }}",
          "Color": "={{ $json.colorPreset }}",
          "Video_Status": "Generated",
          "Video_URL": "={{ $json.videoUrl }}"
        }
      }
    },
    {
      "name": "Upload to YouTube",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [1050, 300],
      "parameters": {
        "method": "POST",
        "url": "https://www.googleapis.com/upload/youtube/v3/videos",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "part",
              "value": "snippet,status"
            },
            {
              "name": "uploadType",
              "value": "multipart"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "snippet",
              "value": {
                "title": "={{ $json.videoTitle }}",
                "description": "={{ $json.captionKR }}",
                "tags": ["binaural beats", "sleep music"]
              }
            },
            {
              "name": "status",
              "value": {
                "privacyStatus": "private",
                "publishAt": "={{ $json.publishDate }}"
              }
            }
          ]
        },
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Bearer {{ $credentials.youtubeOAuth2Api.accessToken }}"
            }
          ]
        }
      }
    },
    {
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1250, 300],
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { \"status\": \"success\", \"trackId\": $json.trackId, \"youtubeId\": $json.id } }}"
      }
    }
  ]
}
```

### 워크플로우 2: CSV 배치 처리

```json
{
  "name": "Neural Visuals - Batch Generator",
  "nodes": [
    {
      "name": "Manual Trigger",
      "type": "n8n-nodes-base.manualTrigger",
      "position": [250, 300]
    },
    {
      "name": "Read CSV from Airtable",
      "type": "n8n-nodes-base.airtable",
      "position": [450, 300],
      "parameters": {
        "operation": "list",
        "application": "appXXXXXXXXXXXXXX",
        "table": "Tracks",
        "filterByFormula": "AND({Music_Status}='Generated', {Video_Status}='Pending')"
      }
    },
    {
      "name": "Split In Batches",
      "type": "n8n-nodes-base.splitInBatches",
      "position": [650, 300],
      "parameters": {
        "batchSize": 1,
        "options": {}
      }
    },
    {
      "name": "Wait 5 Minutes",
      "type": "n8n-nodes-base.wait",
      "position": [850, 300],
      "parameters": {
        "unit": "minutes",
        "amount": 5
      }
    },
    {
      "name": "Call Video Generation Webhook",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1050, 300],
      "parameters": {
        "method": "POST",
        "url": "https://your-n8n.app/webhook/new-track",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "trackId",
              "value": "={{ $json.ID }}"
            },
            {
              "name": "audioUrl",
              "value": "={{ $json.Music_URL }}"
            },
            {
              "name": "theme",
              "value": "={{ $json.Theme }}"
            },
            {
              "name": "colorPreset",
              "value": "={{ $json.ColorPreset }}"
            },
            {
              "name": "videoTitle",
              "value": "={{ $json.Video_Title }}"
            },
            {
              "name": "captionKR",
              "value": "={{ $json.Video_Caption_KR }}"
            }
          ]
        }
      }
    }
  ]
}
```

## 🚀 4단계: 전체 자동화 플로우

### 일일 자동 생성 스케줄

```
1. 매일 오전 9시: ElevenLabs로 음악 3개 생성
2. 음악 생성 완료 → Webhook 트리거
3. n8n이 영상 생성 API 호출
4. Docker 서버에서 영상 생성 (1시간 소요)
5. 완성된 영상을 Airtable에 저장
6. YouTube에 예약 업로드 (다음날 저녁 9시)
7. 다음 음악으로 반복
```

### n8n Cron 설정

```json
{
  "name": "Daily Music Generation",
  "nodes": [
    {
      "name": "Schedule Every Day 9AM",
      "type": "n8n-nodes-base.cron",
      "position": [250, 300],
      "parameters": {
        "triggerTimes": {
          "item": [
            {
              "hour": 9,
              "minute": 0
            }
          ]
        }
      }
    },
    {
      "name": "Get Next 3 Tracks",
      "type": "n8n-nodes-base.airtable",
      "position": [450, 300],
      "parameters": {
        "operation": "list",
        "table": "Tracks",
        "filterByFormula": "{Status}='Pending'",
        "sort": {
          "property": [
            {
              "field": "ID",
              "direction": "asc"
            }
          ]
        },
        "limit": 3
      }
    },
    {
      "name": "Loop Through Tracks",
      "type": "n8n-nodes-base.splitInBatches",
      "position": [650, 300]
    },
    {
      "name": "Generate Music (ElevenLabs)",
      "type": "n8n-nodes-base.httpRequest",
      "position": [850, 300]
    },
    {
      "name": "Trigger Video Generation",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1050, 300]
    }
  ]
}
```

## 📦 5단계: Git 저장소 구조

```
neural-visuals-v2/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Auto-deploy on push
├── src/                        # React app
├── generate_video.js           # Video generator
├── server.js                   # API server
├── Dockerfile                  # Container config
├── docker-start.sh             # Startup script
├── package.json
├── neural-music-100-tracks-complete.csv
├── .dockerignore
├── .gitignore
└── README.md
```

### .github/workflows/deploy.yml (자동 배포)

```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up --service neural-visuals
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 💡 핵심 포인트

1. **음악 저장**: Google Drive/Dropbox에 음악 저장
2. **Webhook 트리거**: 음악 업로드 시 n8n Webhook 호출
3. **Docker API**: 서버에서 영상 생성 API 제공
4. **비동기 처리**: 영상 생성은 시간이 걸리므로 큐 시스템 사용
5. **자동 업로드**: 생성 완료 시 YouTube API로 자동 업로드

이제 음악만 만들면 자동으로 영상이 만들어지고 YouTube에 올라가요! 🎉
