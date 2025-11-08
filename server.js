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
  res.json({
    status: 'ok',
    service: 'neural-visuals-generator',
    timestamp: new Date().toISOString()
  });
});

// Generate video endpoint (single track)
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
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Batch generate endpoint (multiple tracks)
app.post('/api/batch', async (req, res) => {
  try {
    const { tracks } = req.body; // Array of track configs

    if (!Array.isArray(tracks) || tracks.length === 0) {
      return res.status(400).json({ error: 'Invalid tracks array' });
    }

    console.log(`📦 Batch request: ${tracks.length} tracks`);

    // Start batch processing
    res.json({
      status: 'processing',
      message: `Processing ${tracks.length} tracks`,
      trackIds: tracks.map(t => t.trackId)
    });

    // Process in background
    processBatch(tracks).catch(err => {
      console.error('Batch processing error:', err);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Background batch processor
async function processBatch(tracks) {
  const results = [];

  for (const track of tracks) {
    try {
      console.log(`\n🎬 Processing: ${track.trackId}`);

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

      console.log(`✅ ${track.trackId} complete`);

      // Clean up audio
      fs.unlinkSync(audioPath);
    } catch (error) {
      console.error(`❌ ${track.trackId} failed:`, error);
      results.push({
        trackId: track.trackId,
        status: 'error',
        error: error.message,
      });
    }
  }

  console.log(`\n🎉 Batch complete: ${results.filter(r => r.status === 'success').length}/${tracks.length} succeeded`);
  return results;
}

// Helper: Download file from URL
async function downloadFile(url, dest) {
  console.log(`📥 Downloading: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(buffer));
  console.log(`✅ Downloaded: ${dest}`);
}

// Test endpoint (generates 10-second sample)
app.post('/api/test', upload.single('audio'), async (req, res) => {
  try {
    const { theme = 'ocean', colorPreset = 'midnight' } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Missing audio file' });
    }

    console.log(`🧪 Test request: ${theme}, ${colorPreset}`);

    const audioPath = path.join('/app/audio', 'test.mp3');
    fs.renameSync(req.file.path, audioPath);

    // Generate 10-second test video
    const videoPath = await generateVideo({
      trackId: 'test',
      audioPath,
      theme,
      colorPreset,
      duration: 10,
    });

    res.download(videoPath, 'test.mp4', (err) => {
      try {
        fs.unlinkSync(audioPath);
        fs.unlinkSync(videoPath);
      } catch (e) {}
    });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Video generation API running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Generate: POST http://localhost:${PORT}/api/generate`);
  console.log(`   Batch: POST http://localhost:${PORT}/api/batch`);
  console.log(`   Test: POST http://localhost:${PORT}/api/test\n`);
});
