```
$ yarn install
```

```
$ yarn run test
```

You can start [mailhog](https://github.com/mailhog/MailHog):

```
$ docker-compose up -d
```

Access to mailhog1: http://127.0.0.1:8025/
Access to mailhog2: http://127.0.0.1:8026/

```
$ export SMTP_USERNAME=user
$ export SMTP_PASSWORD=password
$ export SMTP_HOST=127.0.0.1
$ export SMTP_PORT=1025
```

```
$ yarn run watch
```

Access to Swagger docs: http://127.0.0.1:5000/docs/

If you want to try second smtp server:

```
$ export SMTP2_USERNAME=user
$ export SMTP2_PASSWORD=password
$ export SMTP2_HOST=127.0.0.1
$ export SMTP2_PORT=1026
```