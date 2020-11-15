FROM node:latest as ts-build

WORKDIR /app
COPY . .
RUN apt-get update && apt-get install -y \
    python \
    libsodium-dev \
    nodejs

RUN npm install typescript -g && npm install --production && tsc
RUN mkdir ./temp && mv ./build ./temp/build && \
    cp -a ./src/data/. ./temp/build/data &&     \
    mv ./node_modules ./temp/node_modules

FROM node:alpine as run

COPY --from=ts-build /app/temp /app
WORKDIR /app/build
RUN apk add --no-cache nodejs ffmpeg
ENV NODE_ENV production
CMD ["node", "./kmq.js"]
