FROM node:22.3.0-alpine3.19

RUN mkdir -p /src/

COPY frontend/ /src/frontend/
WORKDIR /src/frontend/

RUN corepack enable \
    && corepack prepare pnpm@9.4.0 --activate \
    && pnpm install \
    && pnpm run build

FROM node:22.3.0-alpine3.19

RUN mkdir -p /src/
WORKDIR /src/

COPY --from=0 /src/frontend/dist/ /src/frontend/dist/
COPY backend/package.json /src/
COPY backend/yarn.lock /src/

RUN yarn install

COPY backend/src/ /src/src/

ENV PORT=5000
ENV NODE_OPTIONS=--openssl-legacy-provider
EXPOSE 5000

ENV TEMPLATES_PATH=/templates/
ENV STATIC_PATH=/src/frontend/dist/

CMD node ./src/cli.js
