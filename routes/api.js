'use strict';

const express = require('express');
const router = express.Router();
const request = require('request');
const cheerio = require('cheerio');
const parseThread = require('../components/parsers/parseThread.js');
const parseBoard = require('../components/parsers/parseBoard.js');
const publicSettings = require('../settings');
const Feed = require('feed').Feed;

// Responder con XML o JSONP dependiendo de la solicitud
function parseResponse(req, res, data, root) {
    if ((typeof req.query.xml == 'undefined' && typeof req.body.xml == 'undefined')) {
        res.jsonp(data);
    }
    else {
        res.end('No soportado aún.');
    }
}

router.get('/', (req, res, next) => {
    // CloudFlare server push
    res.set('Link', '</dist/app.min.js>; rel=preload, </semantic/semantic.min.css>; rel=prefetch, </stylesheets/css/nprogress.css>; rel=prefetch, </semantic/semantic.js>; rel=prefetch');
    res.render('api', {
        title: `Api - ${publicSettings.site.title}`,
        settings: publicSettings,
    });
});

router.get('/hispachan/:board/res/:th', (req, res, next) => {
    let data = {};
    let thId = req.params.th.split('.')[0];
    let board = req.params.board;

    // Enviar la solicitud a Hispachan
    request(`https://www.hispachan.org/${board}/res/${thId}.html`, (err, resp, body) => {
        if (res.statusCode == 404) {
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
        let $ = cheerio.load(body);
        let th = $('[id^="thread"]');

        data = (th.length > 0) ? parseThread(th.first(), $) : { status: 404 };
        parseResponse(req, res, data, 'thread');
    });
});

router.get('/hispachan/:board/:page?', (req, res, next) => {
    let data = {};
    let page = req.params.page || 0;
    let board = req.params.board;

    // Enviar la solicitud a Hispachan
    request(`https://www.hispachan.org/${board}/` + (page > 0 ? page + '.html' : ''), (err, resp, body) => {
        if (res.statusCode == 404) {
            parseResponse(req, res, { status: 404 });
            return;
        }
        if (err) {
            parseResponse(req, res, { status: 500 });
            return;
        }
        
        // Cargar HTML y parsear con Cheerio
        let $ = cheerio.load(body);
        let board = $('body');
        
        data = (board.find('input[name="board"]').length > 0) ? parseBoard(board, $, page) :  { status: 404 };
        parseResponse(req, res, data, 'board-page');
    });
});

router.get('/hispachan/', function(req, res, next) {
    let data = {};
    data.apiVersion = '0.3.0';
    request(`https://www.hispachan.org/${board}/res/${thId}.html`, (err, resp, body) => {
        if (res.statusCode == 404 || err) {
            parseResponse(req, res, { status: 500 });
            return;
        }
        let $ = cheerio.load(str);
        // Obtener un listado completo de boards
        if (board.find('input[name="board"]').length > 0) {
            let boardLinks = $('.barra').first().find('a[rel="board"]');
            data.boards = [];
            boardLinks.each((ix, el) => {
                data.boards.push({
                    path: $(el).attr('href'),
                    title: $(el).attr('title')
                });
            });
        }
        else {
            data = { status: 404 }
        }
        
        parseResponse(req,res,data, 'hispachan')
    });
});

router.get('/rss/:board/res/:th', (req, res, next) => {
    let data = {};
    let thId = req.params.th.split('.')[0];
    let board = req.params.board;

    // Enviar la solicitud a Hispachan
    request(`https://www.hispachan.org/${board}/res/${thId}.html`, (err, resp, body) => {
        if (err) {
            // Otro error
            parseResponse(req, res, { status: 500 });
            return;
        }
        if (resp.statusCode == 404) {
            // El hilo está en 404.
            parseResponse(req, res, { status: 404 });
            return;
        }
        // Cargar HTML y parsear con Cheerio
        let $ = cheerio.load(body);
        let th = $('[id^="thread"]');

        data = (th.length > 0) ? parseThread(th.first(), $) : { status: 404 };

        const feed = new Feed({
          title: `/${data.board}/ - ${data.subject || data.message.substr(0, 40)}`,
          id: data.postId,
          link: `https://www.hispachan.org/${board}/res/${thId}.html`,
          description: data.message,
          image: data.file ? data.file.thumb : undefined,
          favicon: "https://www.hispachan.org//favicon.ico",
        });        

        data.replies.reverse().forEach(post => {
            feed.addItem({
                title: post.anonId || 'Anónimo',
                id: post.postId,
                link: `https://www.hispachan.org/${board}/res/${thId}.html#${post.postId}`,
                description: post.message,
                content: post.message,
                date: post.date,
                image: post.file ? post.file.thumb : undefined
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
            image: post.file.thumb
        });

        res.type('application/xml');
        res.send(feed.rss2());
    });
});

module.exports = router;
