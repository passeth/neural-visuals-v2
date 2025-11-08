#!/bin/bash

echo "🚀 Starting Neural Visuals Server..."

# Start virtual display
echo "📺 Starting virtual display..."
Xvfb :99 -screen 0 1920x1080x24 &
export DISPLAY=:99

# Optional: VNC for debugging (port 5900)
echo "🔍 Starting VNC server (for debugging)..."
x11vnc -display :99 -forever -nopw -quiet &

# Start Vite preview server
echo "⚡ Starting Vite preview server..."
npm run preview &
VITE_PID=$!

# Wait for Vite to be ready
echo "⏳ Waiting for Vite server..."
sleep 15

# Test if Vite is running
curl -f http://localhost:4173 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Vite server is ready!"
else
    echo "❌ Vite server failed to start"
    exit 1
fi

# Start video generation API
echo "🎥 Starting video generation API..."
node /app/server.js &
SERVER_PID=$!

echo "🎉 All services started!"
echo "   - Vite: http://localhost:4173"
echo "   - API: http://localhost:3000"
echo "   - VNC: vnc://localhost:5900 (for debugging)"

# Keep container running
wait $VITE_PID $SERVER_PID
