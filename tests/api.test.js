'use strict';

const mongoose = require('mongoose');
const app = require('../app');
const supertest = require('supertest');
const api = supertest(app);
const xml2js = require('xml2js');

describe('GET /api/hispachan', () => {
    test('es retornado como json', async () => {
        await api
            .get('/api/hispachan')
            .expect(200)
            .expect('Content-Type', /application\/json/);
    });

    test('la propiedad boards existe', async () => {
        const response = await api.get('/api/hispachan');

        expect(response.body).toHaveProperty('boards');
    });

    test('boards tiene un length mayor a 0', async () => {
        const response = await api.get('/api/hispachan');

        expect(response.body.boards.length).toBeGreaterThan(0);
    });

    test('cada board tiene las propiedades: board, path y title', async () => {
        const response = await api.get('/api/hispachan');

        for (const board of response.body.boards) {
            expect(board).toHaveProperty('board');
            expect(board).toHaveProperty('path');
            expect(board).toHaveProperty('title');
        }
    });
});

describe('GET /api/hispachan/m', () => {
    test('es retornado como json', async () => {
        await api
            .get('/api/hispachan/m')
            .expect(200)
            .expect('Content-Type', /application\/json/);
    });

    test('las propiedades: board, page y threads existen', async () => {
        const response = await api.get('/api/hispachan/m');

        expect(response.body).toHaveProperty('board');
        expect(response.body).toHaveProperty('page');
        expect(response.body).toHaveProperty('threads');
    });

    test('threads tiene un length mayor a 0', async () => {
        const response = await api.get('/api/hispachan/m');

        expect(response.body.threads.length).toBeGreaterThan(0);
    });

    test('cada thread tiene las propiedades correspondientes', async () => {
        const response = await api.get('/api/hispachan/m');

        for (const thread of response.body.threads) {
            expect(thread).toHaveProperty('postId');
            expect(thread).toHaveProperty('posterName');
            expect(thread).toHaveProperty('date');
            expect(thread).toHaveProperty('message');
            expect(thread).toHaveProperty('board');
            expect(thread).toHaveProperty('subject');
            expect(thread).toHaveProperty('replyCount');
            expect(thread).toHaveProperty('replies');
        }
    });
});

describe('GET /api/hispachan/catalog/m', () => {
    test('es retornado como json', async () => {
        jest.setTimeout(30000);

        await api
            .get('/api/hispachan/catalog/m')
            .expect(200)
            .expect('Content-Type', /application\/json/);
    });

    test('el array tiene un length mayor a 0', async () => {
        jest.setTimeout(30000);

        const response = await api.get('/api/hispachan/catalog/m');

        expect(response.body.length).toBeGreaterThan(0);
    });

    test('cada elemento tiene las propiedades correspondientes', async () => {
        jest.setTimeout(30000);

        const response = await api.get('/api/hispachan/catalog/m');

        for (const page of response.body) {
            expect(page).toHaveProperty('board');
            expect(page).toHaveProperty('page');
            expect(page).toHaveProperty('threads');

            expect(page.threads.length).toBeGreaterThan(0);

            for (const thread of page.threads) {
                expect(thread).toHaveProperty('postId');
                expect(thread).toHaveProperty('posterName');
                expect(thread).toHaveProperty('date');
                expect(thread).toHaveProperty('message');
                expect(thread).toHaveProperty('board');
                expect(thread).toHaveProperty('subject');
                expect(thread).toHaveProperty('replyCount');
                expect(thread).toHaveProperty('replies');
            }
        }
    });
});

describe('GET /api/hispachan/:board/rss/:th', () => {
    test('es retornado como xml', async () => {
        const response = await api.get('/api/hispachan/m');
        const th = response.body.threads[0].postId;

        await api
            .get(`/api/hispachan/m/rss/${th}.html`)
            .expect(200)
            .expect('Content-Type', /application\/xml/);
    });

    test('el xml es valido', async () => {
        const response = await api.get('/api/hispachan/m');
        const th = response.body.threads[0].postId;
        const xml = await api.get(`/api/hispachan/m/rss/${th}.html`);
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xml.text);

        expect(result).toHaveProperty('rss');
        expect(result.rss).toHaveProperty('$');
        expect(result.rss).toHaveProperty('channel');
        expect(result.rss.channel.length).toBeGreaterThan(0);
        expect(result.rss.channel[0]).toHaveProperty('description');
        expect(result.rss.channel[0]).toHaveProperty('docs');
        expect(result.rss.channel[0]).toHaveProperty('generator');
        expect(result.rss.channel[0]).toHaveProperty('item');
        expect(result.rss.channel[0]).toHaveProperty('lastBuildDate');
        expect(result.rss.channel[0]).toHaveProperty('link');
        expect(result.rss.channel[0]).toHaveProperty('title');
        expect(result.rss.channel[0].item.length).toBeGreaterThan(0);

        for (const item of result.rss.channel[0].item) {
            expect(item).toHaveProperty('content:encoded');
            expect(item).toHaveProperty('description');
            expect(item).toHaveProperty('guid');
            expect(item).toHaveProperty('link');
            expect(item).toHaveProperty('pubDate');
            expect(item).toHaveProperty('title');
        }
    });
});

describe('GET /api/hispachan/x', () => {
    test('soportar tablones que no existen', async () => {
        const response = await api
            .get('/api/hispachan/x')
            .expect(404)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toEqual({ status: 404 });
    });
});

describe('GET /api/hispachan/m/res/0.html', () => {
    test('soportar hilos que no existen', async () => {
        const response = await api
            .get('/api/hispachan/m/res/0.html')
            .expect(404)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toEqual({ status: 404 });
    });
});

describe('GET /api/hispachan/catalog/x', () => {
    test('soportar catalogo de tablones que no existen', async () => {
        const response = await api
            .get('/api/hispachan/catalog/x')
            .expect(404)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toEqual({ status: 404 });
    });
});

afterAll(() => {
    mongoose.connection.close();
});