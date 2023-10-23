import { checkEmailFormat, createToken } from '../src/app';
import { checkToken } from '../src/app';
import { createUser } from '../src/app';
import { checkWords } from '../src/app';
import { justifyText } from '../src/app';
import { data } from '../src/app';
const request = require('supertest');
import { app } from '../src/app';


describe('test app file', () => {

    beforeEach(() => {
        let expiration = new Date();
        expiration.setTime(expiration.getTime() + 86400000);
        data.push({ email: 'foo@bar.com', token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZvb0BiYXIuY29tIiwiaWF0IjoxNjk3OTI3MDMwLCJleHAiOjE2OTgwMTM0MzB9.nhjAR55fCnzno2oaoqlaOsp6pEpsxRigSBDeyxosvxE', wordCount: 0, expirationDate: expiration });
        data.push({ email: 'rchuat@bar.com', token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJvbWFpbkBiYXIuY29tIiwiaWF0IjoxNjk3OTc3OTA3LCJleHAiOjE2OTgwNjQzMDd9.GBeZ8eoC3iidbvlvKAy0cRespbPiEPVR6oiQXPX-83M', wordCount: 0, expirationDate: expiration });
    });

    afterEach(() => {
        data.splice(0, data.length);
    });

    /**
     * Test checkToken
     */

    test('test checkToken existing token', () => {
        expect(checkToken(data[0].token)).toBe(true);
    });
    test('test checkToken unexisting token', () => {
        expect(checkToken('my_token')).toBe(false);
    });
    test('test checkToken empty token', () => {
        expect(checkToken('')).toBe(false);
    });

    /**
     * Test function createToken
     */

    test('test createToken empty email', () => {
        return expect(createToken('', '123456')).toBe('');
    });
    test('test createToken empty key', () => {
        return expect(createToken('foobar@gmail.com', '')).toBe('');
    });
    test('test createToken correct email correct token', () => {
        return expect(createToken('mon.email@gmail.com', '123456')).not.toBeNull();
    });

    /**
     * Test function checkEmailFormat
     */

    test('test checkEmailFormat correct email', () => {
        expect(checkEmailFormat('foo@bar.com')).toBe(true);
    });
    test('test checkEmailFormat empty email', () => {
        expect(checkEmailFormat('')).toBe(false);
    });
    test('test checkEmailFormat incorrect format', () => {
        expect(checkEmailFormat('mon.emailgmail.com')).toBe(false);
    });
    test('test checkEmailFormat incorrect format 2', () => {
        expect(checkEmailFormat('mon.email@gmailcom')).toBe(false);
    });

    /**
     * Test createUser
     */

    test('test createUser correct email', () => {
        createUser('', '');
        console.log(data);
        expect(data.length).toBe(2);
    });
    test('test createUser empty email', () => {
        createUser('', 'token_2');
        expect(data.length).toBe(2);
    });
    test('test createUser empty token', () => {
        createUser('foo2@bar.com', '');
        expect(data.length).toBe(2);
    });
    test('test createUser existing email', () => {
        createUser('foo@bar.com', 'my_token1');
        expect(data.length).toBe(2);
        expect(data[0].token).toBe('my_token1');
        expect(data[0].email).toBe('foo@bar.com');
    });
    test('test createUser unexisting email', () => {
        createUser('foo1@bar.com', 'my_token1');
        expect(data.length).toBe(3);
        expect(data[2].token).toBe('my_token1');
        expect(data[2].email).toBe('foo1@bar.com');
    });

    /**
     * Test checkWords
     */

    test('test checkWords correct token', () => {
        let text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
        let remainingWords = checkWords(data[0].token, text);
        expect(remainingWords).toBe(80000 - text.split(' ').length + 1);
        expect(data[0].wordCount).toBe(text.split(' ').length - 1);
    });
    test('test checkWords incorrect token', () => {
        expect(checkWords('my_token', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.')).toBe(0);
    });
    test('test checkWords empty token', () => {
        expect(checkWords('', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.')).toBe(-1);
    });
    test('test checkWords empty text', () => {
        expect(checkWords(data[0].token, '')).toBe(80000);
    });
    test('test checkWords correct token but too many words', () => {
        data[0].wordCount = 79990;
        let text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
        expect(checkWords(data[0].token, text)).toBe(0);
        expect(data[0].wordCount).toBe(79990);
    });
    test('test checkWords correct token but too many words', () => {
        data[0].wordCount = 0;
        let text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
        while (text.split(' ').length < 80000) {
            text += ' Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
        }
        expect(data[0].wordCount).toBe(0);
    });
    test('test checkWords day after', () => {
        data[0].expirationDate.setTime(data[0].expirationDate.getTime() - 1086400000);
        data[0].wordCount = 79990;
        let text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
        expect(checkWords(data[0].token, text)).toBe(80000 - text.split(' ').length + 1);
    });

    /**
     * Test function justifyText
     */

    test('test justifyText correct token', () => {
        let text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
        let words = text.split(' ').length - 1;
        let justified = justifyText(text, 80, 0);
        let lines = justified.split('\n');
        console.log(lines);
        for (let i = 2; i < lines.length; i++) {
            if (i != lines.length - 1) {
                expect(lines[i].length).toBe(80);
            }
        }
    });
});

/**
 * Test API
 */

describe('test api', () => {
    /**
     * Test api/token
     */
    test('test api createToken valid email', async () => {
        const email = 'foo@bar.com';
        const response = await request(app).post('/api/token').send({ email });
        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
    });
    test('test api createToken unvalid email', async () => {
        const email = 'foo@barcom';
        const response = await request(app).post('/api/token').send({ email });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('invalid email');
    });
    test('test api createToken unvalid email2', async () => {
        const email = 'foobar.com';
        const response = await request(app).post('/api/token').send({ email });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('invalid email');
    });
    test('test api createToken empty email', async () => {
        const email = '';
        const response = await request(app).post('/api/token').send({ email });
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('veuillez fournir un email');
    });
    /**
    * Test api/justify
    */
    test('test api justifyText no file', async () => {
        const email = 'foo@bar.com'
        const request_token = await request(app).post('/api/token').send({ email });
        const token = request_token.body.token;
        const justify_text = await request(app)
                                    .post('/api/justify')
                                    .send({ token })
                                    .set('Authorization', `Bearer ${token}`);
        expect(justify_text.status).toBe(400);
    });
    test('test api justifyText empty file', async () => {
        const email = 'foo@bar.com'
        const request_token = await request(app).post('/api/token').send({ email });
        const token = request_token.body.token;
        const justify_text = await request(app)
                                    .post('/api/justify')
                                    .set('Authorization', `Bearer ${token}`)
                                    .attach('fichier', 'tests/empty_test.txt');
        expect(justify_text.status).toBe(400);
        expect(justify_text.body.message).toBe('text is required');

    }); 
    test('test api justifyText file and token', async () => {
        const email = 'foo@bar.com'
        const request_token = await request(app).post('/api/token').send({ email });
        const token = request_token.body.token;
        const justify_text = await request(app)
                                    .post('/api/justify')
                                    .set('Authorization', `Bearer ${token}`)
                                    .attach('fichier', 'tests/test.txt');
        expect(justify_text.status).toBe(200);
    });
    test('test api justifyText no token', async () => {
        const justify_text = await request(app)
                                    .post('/api/justify')
                                    .set('Authorization', `Bearer `)
                                    .attach('fichier', 'tests/test.txt');
        expect(justify_text.status).toBe(400);
        expect(justify_text.body.message).toBe('Le token est requis');
    });
    test('test api justifyText invalid token', async () => {
        const justify_text = await request(app)
                                    .post('/api/justify')
                                    .set('Authorization', `Bearer my_token`)
                                    .attach('fichier', 'tests/test.txt');
        expect(justify_text.status).toBe(400);
        expect(justify_text.body.message).toBe('invalid token');
    });
    test('test api justifyText no remaining words', async () => {
        data[0].wordCount = 79999;
        const justify_text = await request(app)
                                    .post('/api/justify')
                                    .set('Authorization', `Bearer ${data[0].token}`)
                                    .attach('fichier', 'tests/test.txt');
        expect(justify_text.status).toBe(402);
        expect(justify_text.body.message).toBe('Payment Required');
    });
});