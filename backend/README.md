```sh
$ yarn install
```

```sh
$ yarn run test
```

You can start [mailhog](https://github.com/mailhog/MailHog):

```sh
$ docker-compose up -d
```

Access to mailhog1: http://127.0.0.1:8025/
Access to mailhog2: http://127.0.0.1:8026/

```sh
$ export SMTP_USERNAME=user
$ export SMTP_PASSWORD=password
$ export SMTP_HOST=127.0.0.1
$ export SMTP_PORT=1025
```

```sh
$ yarn run watch
```

Access to Swagger docs: http://127.0.0.1:5000/docs/

If you want to try second smtp server:

```sh
$ export SMTP2_USERNAME=user
$ export SMTP2_PASSWORD=password
$ export SMTP2_HOST=127.0.0.1
$ export SMTP2_PORT=1026
```
