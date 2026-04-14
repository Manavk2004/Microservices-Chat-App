# Stage 1:

FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

ARG SERVICE
RUN npx nest build ${SERVICE}


# Stage 2:

FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

ARG SERVICE
COPY --from=builder /app/dist ./dist

ENV SERVICE=${SERVICE}
CMD node dist/apps/${SERVICE}/main.js