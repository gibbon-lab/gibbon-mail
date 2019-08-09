FROM node:11.14.0-alpine

RUN mkdir -p /src/
WORKDIR /src/

COPY frontend/build/ /src/frontend/
COPY backend/package.json /src/
COPY backend/package-lock.json /src/

RUN npm install

COPY backend/src/ /src/src/

ENV PORT=5000
EXPOSE 5000

ENV TEMPLATES_PATH=/templates/
ENV STATIC_PATH=/src/frontend/

CMD npm run start