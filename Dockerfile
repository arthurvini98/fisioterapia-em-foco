FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production DATA_DIR=/data
COPY package.json ./
COPY dist ./dist
COPY worker ./worker
COPY server ./server
COPY drizzle ./drizzle
EXPOSE 3000
CMD ["node", "server/index.mjs"]
