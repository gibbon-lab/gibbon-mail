FROM node:12.18.4-alpine

RUN mkdir -p /src/

COPY frontend/ /src/frontend/
WORKDIR /src/frontend/

RUN yarn install
RUN yarn run build

FROM node:12.18.4-alpine

RUN mkdir -p /src/
WORKDIR /src/

COPY --from=0 /src/frontend/build/ /src/frontend/build/
COPY backend/package.json /src/
COPY backend/yarn.lock /src/

RUN yarn install

COPY backend/src/ /src/src/
COPY backend/filters/ /src/filters/

ENV PORT=5000
EXPOSE 5000

ENV TEMPLATES_PATH=/templates/
ENV STATIC_PATH=/src/frontend/build/

CMD yarn run start