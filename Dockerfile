# ---- build the frontend (on the build machine's own platform: the output is the same for every CPU) ----
FROM --platform=$BUILDPLATFORM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY web ./web
RUN npm run build

# ---- runtime -------------------------------------------------------------
FROM node:24-bookworm-slim
LABEL org.opencontainers.image.source="https://github.com/JawshTheDark/ourtube" \
      org.opencontainers.image.description="OurTube: a self-hosted YouTube for your videos, Shorts and live streams"
ENV NODE_ENV=production \
    DATA_DIR=/data \
    PORT=3000 \
    TRUST_PROXY=1
WORKDIR /app
COPY package.json package-lock.json ./
# Production deps only. ffmpeg-static downloads its binary in a postinstall script.
RUN npm ci --omit=dev && npm cache clean --force \
    && node_modules/ffmpeg-static/ffmpeg -version >/dev/null
# ffprobe-static has no Linux ARM builds (a Raspberry Pi, an Ampere or Graviton server, Docker on Apple silicon):
# there, ffprobe comes from Debian's FFmpeg, and the app uses the one on PATH.
RUN "$(node -p "require('ffprobe-static').path")" -version >/dev/null 2>&1 \
    || (apt-get update && apt-get install -y --no-install-recommends ffmpeg && rm -rf /var/lib/apt/lists/* \
        && ffprobe -version >/dev/null)
# yt-dlp, for importing from YouTube (server/ytdlp.js; admins turn it on): the standalone build for this CPU, owned
# by the app's user so it can keep itself up to date (`yt-dlp -U`, at most daily).
ARG TARGETARCH
RUN mkdir -p /opt/yt-dlp \
    && node -e "const f=process.argv[1]==='arm64'?'yt-dlp_linux_aarch64':'yt-dlp_linux';fetch('https://github.com/yt-dlp/yt-dlp/releases/latest/download/'+f).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.arrayBuffer()}).then(b=>require('fs').writeFileSync('/opt/yt-dlp/yt-dlp',Buffer.from(b),{mode:0o755}))" "$TARGETARCH" \
    && /opt/yt-dlp/yt-dlp --version \
    && chown -R node:node /opt/yt-dlp
RUN mkdir -p /data && chown node:node /data
COPY server ./server
COPY --from=build /app/web/dist ./web/dist
VOLUME /data
EXPOSE 3000
USER node
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "fetch('http://127.0.0.1:3000/api/site').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server/index.js"]
