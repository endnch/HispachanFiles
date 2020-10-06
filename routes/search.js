'use strict';

const express = require('express');
const router = express.Router();
const querystring = require('querystring');
const publicSettings = require('../settings');
const Post = require('../models/post');
const { allowList } = require('../boards');
const { generatePagination } = require('./utils');
const renderer = require('../utils/renderer');


router.get('/ui-search', async (req, res) => {
    const q = req.query.q;
    const query = { thread: null, $or: [{ subject: { $regex: q, $options: 'i' } }, { message: { $regex: q, $options: 'i' } }] };

    if (!q) {
        res.json({ results: [] });
        return;
    }

    const num = await Post.countDocuments(query);
    const result = await Post.find(query).limit(4);

    if (result.length > 0) {
        const response = { results: [] };

        result.forEach(el => {
            // Lo siguiente es para descartar las propiedades que no están definidas
            el = el.toObject();

            const re = {
                description: el.message.substr(0, 120),
                url: `/${el.board}/res/${el.postId}.html`,
            };

            if (el.subject) re.title = el.subject;
            if (el.file) re.image = '/' + el.file.thumb;

            response.results.push(re);
        });

        if (num > 4) {
            response.action = { url: `/search?q=${encodeURIComponent(q)}`, text: `Ver todos los resultados (${num})` };
        }

        res.json(response);
        return;
    }

    res.json({ results: [] });
});

// Búsqueda avanzada
router.get('/search', async (req, res) => {
    // CloudFlare server push
    res.set('Link', '</dist/app.min.js>; rel=preload, </semantic/semantic.min.css>; rel=prefetch, </stylesheets/css/nprogress.css>; rel=prefetch, </semantic/semantic.js>; rel=prefetch');

    const q = req.query.q;
    const p = parseInt(req.query.p) || 1;
    const query = {};

    if (q) {
        query.$or = [
            { subject: { $regex: q, $options: 'i' } },
            { message: { $regex: q, $options: 'i' } },
        ];
    }

    if (req.query.op === 'true') {
        query.thread = null;
    }

    if (req.query.extensions) {
        if (req.query.extensions.includes('mp4')) {
            query.file = { $exists: true };
            query['file.url'] = query['file.url'] || { $in: [] };
            query['file.url'].$in.push(/\.mp4$/);
        }
        if (req.query.extensions.includes('webm')) {
            query.file = { $exists: true };
            query['file.url'] = query['file.url'] || { $in: [] };
            query['file.url'].$in.push(/\.webm$/);
        }
        if (req.query.extensions.includes('img')) {
            query.file = { $exists: true };
            query['file.url'] = query['file.url'] || { $in: [] };
            query['file.url'].$in.push(/\.jpg$/, /\.png$/, /\.gif$/);
        }
    }

    const num = await Post.countDocuments(query);
    const totalPages = Math.floor(num / 10) + (num % 10 ? 1 : 0);
    const pages = generatePagination(p, totalPages);
    const items = await Post.find(query)
        .skip((p - 1) * 10)
        .limit(10)
        .sort('-date')
        .populate('thread');

    const { p: _p, ...queryObject } = req.query;
    const currentQuery = querystring.stringify(queryObject);

    res.render('search-results', {
        title: `Resultados de búsqueda ${q} - ${publicSettings.site.title}`,
        settings: publicSettings,
        q, currentQuery, totalPages, items, pages, renderer,
    });
});

router.get('/:board', async (req, res, next) => {
    // CloudFlare server push
    res.set('Link', '</dist/app.min.js>; rel=preload, </semantic/semantic.min.css>; rel=prefetch, </stylesheets/css/nprogress.css>; rel=prefetch, </semantic/semantic.js>; rel=prefetch');

    const board = req.params.board;

    if (!allowList.includes(board)) {
        next();
        return;
    }

    const query = Post.find({});

    if (board !== 'all') {
        query.where('board').equals(board);
    }

    const p = parseInt(req.query.p) || 1;
    const items = await query
        .where('thread').equals(null)
        .skip((p - 1) * 10)
        .limit(10)
        .sort('-date');

    const num = board === 'all'
        ? await Post.countDocuments({ thread: null })
        : await Post.countDocuments({ board, thread: null });
    const totalPages = Math.floor(num / 10) + (num % 10 ? 1 : 0);
    const pages = generatePagination(p, totalPages, req.path);

    res.render('board', {
        title: `/${board}/ - ${publicSettings.site.title}`,
        settings: publicSettings,
        totalPages, items, pages,
    });
});

module.exports = router;