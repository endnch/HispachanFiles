'use strict';

const mongoose = require('mongoose');
const app = require('../app');
const supertest = require('supertest');
const api = supertest(app);

const Thread = require('../models/thread');

describe('GET /ui-search?q=a', () => {
    test('es retornado como json', async () => {
        await api
            .get('/ui-search?q=Lorem+Ipsum')
            .expect(200)
            .expect('Content-Type', /application\/json/);
    });
});

describe('GET /ui-search?q=Lorem+Ipsum', () => {
    test('buscar un resultado sin imágen', async () => {
        await Thread.deleteMany({});

        await new Thread({
            postId: 0,
            date: new Date(),
            message: '',
            board: 'm',
            subject: 'Lorem Ipsum',
            replyCount: 0,
            lastUpdate: new Date(),
        }).save();

        const response = await api
            .get('/ui-search?q=Lorem+Ipsum')
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toHaveProperty('results');
        expect(response.body.results.length).toEqual(1);
        expect(response.body.results[0]).toHaveProperty('description');
        expect(response.body.results[0]).toHaveProperty('title');
        expect(response.body.results[0]).toHaveProperty('url');
    });

    test('buscar un resultado con imágen', async () => {
        await Thread.deleteMany({});

        await new Thread({
            postId: 0,
            date: new Date(),
            message: '',
            board: 'm',
            subject: 'Lorem Ipsum',
            replyCount: 0,
            file: {
                url: 'data/m/0/src/0.jpg',
                size: '0.0KB',
                resolution: '0x0',
                name: 'test.jgp',
                thumb: 'data/m/0/thumb/0.jpg',
                md5: '',
            },
            lastUpdate: new Date(),
        }).save();

        const response = await api
            .get('/ui-search?q=Lorem+Ipsum')
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toHaveProperty('results');
        expect(response.body.results.length).toEqual(1);
        expect(response.body.results[0]).toHaveProperty('description');
        expect(response.body.results[0]).toHaveProperty('image');
        expect(response.body.results[0]).toHaveProperty('title');
        expect(response.body.results[0]).toHaveProperty('url');
    });

    test('buscar varios resultados sin imágenes', async () => {
        await Thread.deleteMany({});

        const thread = {
            postId: 0,
            date: new Date(),
            message: '',
            board: 'm',
            subject: 'Lorem Ipsum',
            replyCount: 0,
            lastUpdate: new Date(),
        };

        for (let i = 0; i < 5; i++) {
            await new Thread(thread).save();
        }

        const response = await api
            .get('/ui-search?q=Lorem+Ipsum')
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toEqual({
            action: {
                text: 'Ver todos los resultados (5)',
                url: '/search?q=Lorem%20Ipsum',
            },
            results: [{
                description: '',
                title: 'Lorem Ipsum',
                url: '/m/res/0.html',
            },
            {
                description: '',
                title: 'Lorem Ipsum',
                url: '/m/res/0.html',
            },
            {
                description: '',
                title: 'Lorem Ipsum',
                url: '/m/res/0.html',
            },
            {
                description: '',
                title: 'Lorem Ipsum',
                url: '/m/res/0.html',
            }],
        });
    });

    test('buscar varios resultados con imágenes', async () => {
        await Thread.deleteMany({});

        const thread = {
            postId: 0,
            date: new Date(),
            message: '',
            board: 'm',
            subject: 'Lorem Ipsum',
            replyCount: 0,
            file: {
                url: 'data/m/0/src/0.jpg',
                size: '0.0KB',
                resolution: '0x0',
                name: 'test.jgp',
                thumb: 'data/m/0/thumb/0.jpg',
                md5: '',
            },
            lastUpdate: new Date(),
        };

        for (let i = 0; i < 5; i++) {
            await new Thread(thread).save();
        }

        const response = await api
            .get('/ui-search?q=Lorem+Ipsum')
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toEqual({
            action: {
                text: 'Ver todos los resultados (5)',
                url: '/search?q=Lorem%20Ipsum',
            },
            results: [{
                description: '',
                image: '/data/m/0/thumb/0.jpg',
                title: 'Lorem Ipsum',
                url: '/m/res/0.html',
            },
            {
                description: '',
                image: '/data/m/0/thumb/0.jpg',
                title: 'Lorem Ipsum',
                url: '/m/res/0.html',
            },
            {
                description: '',
                image: '/data/m/0/thumb/0.jpg',
                title: 'Lorem Ipsum',
                url: '/m/res/0.html',
            },
            {
                description: '',
                image: '/data/m/0/thumb/0.jpg',
                title: 'Lorem Ipsum',
                url: '/m/res/0.html',
            }],
        });
    });

    test('búsqueda sin query', async () => {
        const response = await api
            .get('/ui-search')
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toEqual({ results: [] });
    });

    test('búsqueda sin resultados', async () => {
        const response = await api
            .get('/ui-search?q=Zeta')
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body).toEqual({ results: [] });
    });
});

afterAll(() => {
    mongoose.connection.close();
});