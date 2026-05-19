FROM node:24-alpine AS builder

WORKDIR /app

COPY . .
RUN npm install -w @dqc/data
RUN npm install -w @dqc/site
RUN npm run build:site

FROM node:24-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY --from=builder /app ./

EXPOSE 3000

HEALTHCHECK \
    --interval=60s \
    --timeout=30s \
    --start-period=120s \
    --retries=3 \
    CMD [ "sh", "-c", "curl -fsS http://localhost:3000/api/health || exit 1" ]

CMD ["npm", "run", "start:site"]
