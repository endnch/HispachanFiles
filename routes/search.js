'use strict';

const express = require('express');
const router = express.Router();
const cors = require('cors');
const publicSettings = require('../settings');
const Thread = require('../models/thread');
const { allowList } = require('../boards');

router.get('/ui-search', async (req, res) => {
    const q = req.query.q;
    const query = { $or: [{ subject: { $regex: q, $options: 'i' } }, { message: { $regex: q, $options: 'i' } }] };

    if (!q) {
        res.json({ results: [] });
        return;
    }

    const num = await Thread.countDocuments(query);
    const result = await Thread.find(query).limit(4);

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

    // Página en blanco si no hay query
    if (!q) {
        res.render('search-results', {
            title: `Resultados de búsqueda: ${q} - ${publicSettings.site.title}`,
            settings: publicSettings,
            currentQuery: q, totalPages: 1, items: [], pages: [],
        });
        return;
    }

    // Contar los resultados
    const num = await countThreads({ q });
    const totalPages = Math.floor(num / 10) + (num % 10 ? 1 : 0);
    const pages = generatePagination(p, totalPages);
    const result = await searchThreads({ q, p });

    res.render('search-results', {
        title: `Resultados de búsqueda ${q} - ${publicSettings.site.title}`,
        settings: publicSettings,
        currentQuery: q, totalPages: totalPages, items: result, pages: pages,
    });
});

// Todos los hilos
router.get('/all', async (req, res) => {
    // CloudFlare server push
    res.set('Link', '</dist/app.min.js>; rel=preload, </semantic/semantic.min.css>; rel=prefetch, </stylesheets/css/nprogress.css>; rel=prefetch, </semantic/semantic.js>; rel=prefetch');

    const p = parseInt(req.query.p) || 1;
    const num = await countThreads();
    const totalPages = Math.floor(num / 10) + (num % 10 ? 1 : 0);
    const pages = generatePagination(p, totalPages, req.path);
    const result = await searchThreads({ p });

    res.render('all-threads', {
        title: `Todos los hilos - ${publicSettings.site.title}`,
        settings: publicSettings,
        totalPages: totalPages, items: result, pages: pages,
    });
});

router.get('/:board', async (req, res, next) => {
    // CloudFlare server push
    res.set('Link', '</dist/app.min.js>; rel=preload, </semantic/semantic.min.css>; rel=prefetch, </stylesheets/css/nprogress.css>; rel=prefetch, </semantic/semantic.js>; rel=prefetch');

    if (!allowList.includes(req.params.board)) {
        next();
        return;
    }

    const result = await searchThreads({
        board: req.params.board,
        p: req.query.p,
    });

    const num = await countThreads({
        board: req.params.board,
    });

    const p = parseInt(req.query.p) || 1;
    const totalPages = Math.floor(num / 10) + (num % 10 ? 1 : 0);
    const pages = generatePagination(p, totalPages, req.path);

    res.render('all-threads', {
        title: `/${req.params.board}/ - ${publicSettings.site.title}`,
        settings: publicSettings,
        totalPages: totalPages, items: result, pages: pages,
    });
});

router.get('/api/hispafiles/ui-search/:q', cors(), async (req, res) => {
    const q = req.params.q;

    const query = { $or: [
        { subject: { $regex: q, $options: 'i' } },
        { message: { $regex: q, $options: 'i' } }] };

    const threads = await Thread.find(query)
        .limit(4)
        .sort('-date');

    const totalResults = await Thread.countDocuments(query);

    const results = threads.map(thread => ({
        description: thread.message.substr(0, 120),
        url: `/${thread.board}/res/${thread.postId}`,
        title: thread.subject,
        image: thread.file && '/' + thread.file.thumb,
    }));

    res.json({
        totalResults,
        results,
    });
});

router.get('/api/hispafiles/search/:q/:p?', cors(), async (req, res) => {
    const q = req.params.q;
    const p = parseInt(req.params.p) || 1;

    const query = { $or: [
        { subject: { $regex: q, $options: 'i' } },
        { message: { $regex: q, $options: 'i' } }] };

    const threads = await Thread.find(query)
        .skip((p - 1) * 10)
        .limit(10)
        .sort('-date')
        .select('-_id -__v -replies');

    const num = await Thread.countDocuments(query);
    const totalPages = Math.floor(num / 10) + (num % 10 ? 1 : 0);

    res.json({
        totalPages,
        threads,
    });
});

router.get('/api/hispafiles/:board/:p?', cors(), async (req, res) => {
    const board = req.params.board;

    if (!allowList.includes(board)) {
        res.json([]);
        return;
    }

    const query = Thread.find({});

    if (board !== 'all') {
        query.where('board').equals(board);
    }

    const p = parseInt(req.params.p) || 1;
    const threads = await query
        .skip((p - 1) * 10)
        .limit(10)
        .sort('-date')
        .select('-_id -__v -replies');

    const num = board === 'all'
        ? await countThreads()
        : await countThreads({ board });
    const totalPages = Math.floor(num / 10) + (num % 10 ? 1 : 0);

    res.json({
        totalPages,
        threads,
    });
});

router.get('/api/hispafiles/:board/res/:th', cors(), async (req, res) => {
    const threadId = req.params.th.split('.')[0];
    const board = req.params.board;

    if (!allowList.includes(board)) {
        res.json({});
        return;
    }

    const thread = await Thread.findOne()
        .where('board').equals(board)
        .where('postId').equals(threadId)
        .select('-_id -__v -replies._id');

    if (!thread) {
        res.json({});
        return;
    }

    res.json(thread);
});

/**
 * Buscador de hilos
 *
 * @param {Object} search - El objecto que especifíca la búsqueda
 * @param {Number} search.p - La página a retornar
 * @param {String=} search.q - El termino de búsqueda
 * @param {String=} search.board - El tablon en donde buscar
 */
const searchThreads = (search) => {
    if (search.q) {
        const q = search.q;
        const query = { $or: [{ subject: { $regex: q, $options: 'i' } }, { message: { $regex: q, $options: 'i' } }] };
        return Thread.find(query, null, { sort: { date: -1 } }).skip((search.p - 1) * 10).limit(10);

    }

    if (search.board === undefined) {
        return Thread.find({}, null, { sort: { date: -1 } }).skip((search.p - 1) * 10).limit(10);
    }

    return Thread.find({ board: search.board }, null, { sort: { date: -1 } }).skip((search.p - 1) * 10).limit(10);
};

/**
 * Contador de hilos
 *
 * @param {Object=} search - El objecto que especifíca la búsqueda
 * @param {String=} search.q - El termino de búsqueda
 * @param {String=} search.board - El tablon en donde buscar
 */
const countThreads = (search) => {
    if (search === undefined || Object.keys(search).length === 0) {
        return Thread.estimatedDocumentCount();
    }

    if (search.q) {
        const q = search.q;
        const query = { $or: [{ subject: { $regex: q, $options: 'i' } }, { message: { $regex: q, $options: 'i' } }] };
        return Thread.countDocuments(query);
    }

    return Thread.countDocuments({ board: search.board });
};

/**
 * Crea el divisor derecho
 *
 * @param {Array} pages - El arreglo que contendrá el resultado
 * @param {Number} p - La página en la que está el usuario
 * @param {Number} totalPages - El número de páginas totales
 */
const createRightDivider = (pages, p, totalPages) => {
    if (p + 10 <= totalPages) {
        pages.push({ type: 'page', num: p + 10, text: '+10', active: false });
    } else if (p + 5 <= totalPages) {
        pages.push({ type: 'page', num: p + 5, text: '+5', active: false });
    } else {
        pages.push({ type: 'divider' });
    }
};

/**
 * Crea el divisor izquierdo
 *
 * @param {Array} pages - El arreglo que contendrá el resultado
 * @param {Number} p - La página en la que está el usuario
 */
const createLeftDivider = (pages, p) => {
    if (p - 10 >= 1) {
        pages.push({ type: 'page', num: p - 10, text: '-10', active: false });
    } else if (p - 5 >= 1) {
        pages.push({ type: 'page', num: p - 5, text: '-5', active: false });
    } else {
        pages.push({ type: 'divider' });
    }
};

/**
 * Genera la paginación
 *
 * @param {Number} p - La página en la que está el usuario
 * @param {Number} totalPages - El número de páginas totales
 */
const generatePagination = (p, totalPages, path) => {
    if (totalPages <= 1) {
        return [];
    }

    const pages = [];

    // Primera página
    pages.push({ type: 'page', num: 1, active: p === 1 });

    if (totalPages <= 7) {
        for (let i = 2; i <= totalPages - 1; i++) {
            pages.push({ type: 'page', num: i, active: p === i });
        }
    } else if (p <= 4) {
        for (let i = 2; i <= 5; i++) {
            pages.push({ type: 'page', num: i, active: p === i });
        }

        createRightDivider(pages, p, totalPages);
    } else if (p >= totalPages - 3) {
        createLeftDivider(pages, p);

        for (let i = totalPages - 4; i <= totalPages - 1; i++) {
            pages.push({ type: 'page', num: i, active: p === i });
        }
    } else {
        //  4 < p < totalPages - 3
        createLeftDivider(pages, p);
        pages.push({ type: 'page', num: p - 1, active: false });
        pages.push({ type: 'page', num: p, active: true });
        pages.push({ type: 'page', num: p + 1, active: false });
        createRightDivider(pages, p, totalPages);
    }

    // Última página
    pages.push({ type: 'page', num: totalPages, active: p === totalPages });

    if (path) {
        for (const page of pages) page.path = path;
    }

    return pages;
};

module.exports = router;