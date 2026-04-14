FROM node:22-alpine 

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

ARG SERVICE
RUN npx nest build ${SERVICE}

ENV SERVICE=${SERVICE}
CMD node dist/apps/${SERVICE}/main.js


