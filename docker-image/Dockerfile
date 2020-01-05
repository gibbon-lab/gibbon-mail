FROM node:11.14.0-alpine

RUN mkdir -p /src/

COPY frontend/ /src/frontend/
WORKDIR /src/frontend/

RUN npm install
RUN npm run build

FROM node:11.14.0-alpine

RUN mkdir -p /src/
WORKDIR /src/

COPY --from=0 /src/frontend/build/ /src/frontend/build/
COPY backend/package.json /src/
COPY backend/package-lock.json /src/

RUN npm install

COPY backend/src/ /src/src/

ENV PORT=5000
EXPOSE 5000

ENV TEMPLATES_PATH=/templates/
ENV STATIC_PATH=/src/frontend/build/

CMD npm run start