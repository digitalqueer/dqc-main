FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install

COPY . .

RUN npm run build

FROM node:24-alpine

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000

HEALTHCHECK \
    --interval=60s \
    --timeout=30s \
    --start-period=120s \
    --retries=3 \
    CMD [ "curl -fsS http://localhost:3000/api/health || exit 1" ]

CMD ["npm", "start"]
