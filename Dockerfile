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
