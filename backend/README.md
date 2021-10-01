# Gibbon-mail - Backend

Send mails with mjml Template  and JSON Schema.

- Project status: [POC](https://en.wikipedia.org/wiki/Proof_of_concept)
- Screencast: https://youtu.be/9oih7cZTjk4
- Docker Image: https://hub.docker.com/r/stephaneklein/gibbon-mail (Automated Builds configured on `master` branch)

To generate PDF instead send mails, see this project: [gibbon-pdf](https://github.com/stephane-klein/gibbon-pdf)

## Quick start

You can use gibbon-mail as a standalone app:

```sh
$ npm install -g @spacefill/gibbon-mail
$ gibbon-mail
```

or as library:

```js
const { createApp } = require('@spacefill/gibbon-mail')

const app = createApp()

const server = app.listen(
  5000,
  '0.0.0.0',
  () => {
    console.log(`Server listening on port: 5000`);
  }
);
```

## Configuration

`gibbon-mail` must be setup to be used, you can find configuration in
[./src/config.js](./src/config.js).

## Hack

Install dependencies first:

```sh
$ yarn install
```

You can start [mailhog](https://github.com/mailhog/MailHog):

```sh
$ docker-compose up -d
```

```sh
$ yarn run test
```

Access to mailhog1: http://127.0.0.1:8025/
Access to mailhog2: http://127.0.0.1:8026/

```sh
$ direnv allow
```

```sh
$ yarn run watch
```

Access to Swagger docs: http://127.0.0.1:5000/docs/

If you want to try second smtp server, uncomment [these lines](../.envrc#9-12)

```sh
$ direnv allow
```
