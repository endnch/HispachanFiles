'use strict';

const express = require('express');
const router = express.Router();
const request = require('request');
const cheerio = require('cheerio');
const parseThread = require('../components/parsers/parseThread.js');
const parseBoard = require('../components/parsers/parseBoard.js');
const publicSettings = require('../settings');
const Feed = require('feed').Feed;
const async = require('async');

// Responder con XML o JSONP dependiendo de la solicitud
function parseResponse(req, res, data) {
    if ((typeof req.query.xml === 'undefined' && typeof req.body.xml === 'undefined')) {
        res.jsonp(data);
    } else {
        res.end('No soportado aún.');
    }
}

router.get('/', (req, res) => {
    // CloudFlare server push
    res.set('Link', '</dist/app.min.js>; rel=preload, </semantic/semantic.min.css>; rel=prefetch, </stylesheets/css/nprogress.css>; rel=prefetch, </semantic/semantic.js>; rel=prefetch');
    res.render('api', {
        title: `Api - ${publicSettings.site.title}`,
        settings: publicSettings,
    });
});

router.get('/hispachan/:board/res/:th', (req, res) => {
    let data = {};
    const thId = req.params.th.split('.')[0];
    const board = req.params.board;

    // Enviar la solicitud a Hispachan
    request(`https://www.hispachan.org/${board}/res/${thId}.html`, (err, resp, body) => {
        if (resp.statusCode === 404) {
            // El hilo está en 404.
            parseResponse(req, res, { status: 404 });
            return;
        }
        if (err) {
            // Otro error
            parseResponse(req, res, { status: 500 });
            return;
        }
        // Cargar HTML y parsear con Cheerio
        const $ = cheerio.load(body);
        const th = $('[id^="thread"]');

        data = (th.length > 0) ? parseThread(th.first(), $) : { status: 404 };
        parseResponse(req, res, data, 'thread');
    });
});

router.get('/hispachan/catalog/:board', (req, res) => {
    const data = [];
    const board = req.params.board;

    request(`https://www.hispachan.org/${board}/`, (err, resp) => {
        if (resp.statusCode === 404) {
            parseResponse(req, res, { status: 404 });
            return;
        }
        if (err) {
            parseResponse(req, res, { status: 500 });
            return;
        }

        async.each([0, 1, 2, 3, 4, 5, 6, 7], (page, cb) => {
            // eslint-disable-next-line eqeqeq
            request(`https://www.hispachan.org/${board}/` + (page === 0 ? '' : `${page}.html`), (err, resp, body) => {
                if (err || resp.statusCode === 404) {
                    cb();
                    return;
                }

                const $ = cheerio.load(body);
                const board = $('body');

                data.push(parseBoard(board, $, page));
                cb();
            });
        }, (err) => {
            if (err) {
                parseResponse(req, res, { status: 500 });
                return;
            }
            parseResponse(req, res, data.sort((a, b) => a.page - b.page));
        });
    });
});

router.get('/hispachan/:board/:page?', (req, res) => {
    let data = {};
    const page = req.params.page || 0;
    const board = req.params.board;

    // Enviar la solicitud a Hispachan
    request(`https://www.hispachan.org/${board}/` + (page > 0 ? page + '.html' : ''), (err, resp, body) => {
        if (resp.statusCode === 404) {
            parseResponse(req, res, { status: 404 });
            return;
        }
        if (err) {
            parseResponse(req, res, { status: 500 });
            return;
        }

        // Cargar HTML y parsear con Cheerio
        const $ = cheerio.load(body);
        const board = $('body');

        data = (board.find('input[name="board"]').length > 0) ? parseBoard(board, $, page) :  { status: 404 };
        parseResponse(req, res, data, 'board-page');
    });
});

router.get('/hispachan/', (req, res) => {
    const data = {};
    request('https://www.hispachan.org/m/', (err, resp, body) => {
        if (resp.statusCode === 404 || err) {
            return parseResponse(req, res, { status: 500 });
        }

        const $ = cheerio.load(body);
        const board = $('body');

        if (board.find('input[name="board"]').length === 0) {
            return parseResponse(req, res, { status: 404 });
        }

        // Obtener un listado completo de tablones
        const boardLinks = $('.barra').first().find('a.navbar-board');
        data.boards = [];
        boardLinks.each((i, el) => {
            data.boards.push({
                board: $(el).attr('data-board-short-name'),
                path: $(el).attr('href'),
                title: $(el).attr('title'),
            });
        });

        parseResponse(req, res, data, 'hispachan');
    });
});

router.get('/rss/:board/res/:th', (req, res) => {
    let data = {};
    const thId = req.params.th.split('.')[0];
    const board = req.params.board;

    // Enviar la solicitud a Hispachan
    request(`https://www.hispachan.org/${board}/res/${thId}.html`, (err, resp, body) => {
        if (err) {
            // Otro error
            parseResponse(req, res, { status: 500 });
            return;
        }
        if (resp.statusCode === 404) {
            // El hilo está en 404.
            parseResponse(req, res, { status: 404 });
            return;
        }
        // Cargar HTML y parsear con Cheerio
        const $ = cheerio.load(body);
        const th = $('[id^="thread"]');

        data = (th.length > 0) ? parseThread(th.first(), $) : { status: 404 };

        const feed = new Feed({
            title: `/${data.board}/ - ${data.subject || data.message.substr(0, 40)}`,
            id: data.postId,
            link: `https://www.hispachan.org/${board}/res/${thId}.html`,
            description: data.message,
            image: data.file ? data.file.thumb : undefined,
            favicon: 'https://www.hispachan.org//favicon.ico',
        });

        data.replies.reverse().forEach(post => {
            feed.addItem({
                title: post.anonId || 'Anónimo',
                id: post.postId,
                link: `https://www.hispachan.org/${board}/res/${thId}.html#${post.postId}`,
                description: post.message,
                content: post.message,
                date: post.date,
                image: post.file ? post.file.thumb : undefined,
            });
        });

        const post = data;
        feed.addItem({
            title: post.anonId || 'Anónimo',
            id: post.postId,
            link: `https://www.hispachan.org/${board}/res/${thId}.html`,
            description: post.message,
            content: post.message,
            date: post.date,
            image: post.file.thumb,
        });

        res.type('application/xml');
        res.send(feed.rss2());
    });
});

module.exports = router;
