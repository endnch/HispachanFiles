'use strict';

const mongoose = require('mongoose');
const app = require('../app');
const supertest = require('supertest');
const api = supertest(app);

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
        await api
            .get('/api/hispachan/catalog/m')
            .expect(200)
            .expect('Content-Type', /application\/json/);
    });

    test('el array tiene un length mayor a 0', async () => {
        const response = await api.get('/api/hispachan/catalog/m');

        expect(response.body.length).toBeGreaterThan(0);
    });

    test('cada elemento tiene las propiedades correspondientes', async () => {
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

afterAll(() => {
    mongoose.connection.close();
});