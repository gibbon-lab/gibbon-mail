const path = require('path');

const request = require('supertest');

const config = require('../src/config');
const createApp = require('../src/app');

config.set('port', 5001);
config.set('template_path', path.join(__dirname, 'fixtures'));

const app = createApp();

const server = app.listen(app.context.port);

afterEach(() => {
    server.close();
});

describe('Route /v1/', () => {
    it('return 200', async () => {
        return request(server)
            .get('/v1/')
            .expect(200);
    });
});

describe('Route /v1/swagger.yaml', () => {
    it('return 200', async () => {
        return request(server)
            .get('/v1/swagger.yaml')
            .expect(200)
            .expect('Content-Type', /yaml/);
    });
});


describe('Route /v1/templates/', () => {
    it('return template list', async () => {
        return request(server)
            .get('/v1/templates/')
            .expect(200)
            .expect('Content-Type', /json/)
            .then(response => {
                expect(response.body).toStrictEqual([
                    'confirm_email',
                    'invalid-json',
                    'json-missing'
                ]);
            });
    });
});

describe('Route /v1/templates/:name', () => {
    it('return error when schema.json file is invalid', async () => {
        return request(server)
            .get('/v1/templates/invalid-json')
            .expect(500);
    });
    it('return error when schema.json file missing', async () => {
        return request(server)
            .get('/v1/templates/json-missing')
            .expect(404);
    });
    it('return schema.json', async () => {
        return request(server)
            .get('/v1/templates/confirm_email')
            .expect(200)
            .expect('Content-Type', /json/)
            .then(response => {
                expect(response.body.json_schema.type).toBe('object');
            });
    });
});

describe('Route /v1/templates/:name/preview', () => {
    it('return error if template file missing', async () => {
        return request(server)
            .post('/v1/templates/invalid-json/preview')
            .send({
                from: 'no-reply@example.com',
                to: 'user@example.com'
            })
            .expect(404);
    });
    it('return html content', async () => {
        return request(server)
            .post('/v1/templates/confirm_email/preview')
            .send({
                from: 'no-reply@example.com',
                to: 'user@example.com',
                application_name: 'My app',
                username: 'john-doe',
                confirm_email: 'john-doe@example.com',
                url: 'http://example.com',
                is_new_user: true
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(response => {
                expect(response.body.subject).toContain(
                    '[My app] Confirm Email'
                );
                expect(response.body.html).toContain(
                    'Hi john-doe!'
                );
                expect(response.body.txt).toContain(
                    'Hi john-doe!'
                );
            });
    });
});

describe('Route /v1/templates/:name/send', () => {
    it('return error if template file missing', async () => {
        return request(server)
            .post('/v1/templates/invalid-json/send')
            .send({
                from: 'no-reply@example.com',
                to: 'user@example.com'
            })
            .expect(404);
    });
    it('return html content', async () => {
        return request(server)
            .post('/v1/templates/confirm_email/send')
            .send({
                from: 'no-reply@example.com',
                to: 'user@example.com',
                application_name: 'My app',
                username: 'john-doe',
                confirm_email: 'john-doe@example.com',
                url: 'http://example.com',
                is_new_user: true
            })
            .expect('Content-Type', /json/)
            .expect(200);
    });
});