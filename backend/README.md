# gibbon-mail backend

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
