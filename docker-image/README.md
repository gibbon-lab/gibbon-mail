Test application with Docker:

```sh
$ docker-compose up -d
```

Go to http://127.0.0.1:5000

Access to mailhog: http://127.0.0.1:8025/

Access to Swagger docs: http://127.0.0.1:5000/docs/


Curl example:

```sh
$ curl -d '{"from": "no-reply@example.com", "to": "john.doe@example.com", "application_name": "My Application", "username": "john-doe", "confirm_email": "john.doe@example.com", "url": "http://example.com", "is_new_user": true}' -H "Content-Type: application/json" -X POST http://localhost:5000/v1/templates/confirm_email/send
```

See result in mailhog.

Build Docker image:

```sh
$ ./build.sh
```
