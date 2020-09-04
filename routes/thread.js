'use strict';

const express = require('express');
const router = express.Router();
const publicSettings = require('../settings');
const serverSettings = require('../server-settings');
const Thread = require('../models/thread');
const delThread = require('../components/deleteThread');

router.get('/:board/res/:postId', async (req, res, next) => {
    // CloudFlare server push
    res.set('Link', '</dist/app.min.js>; rel=preload, </semantic/semantic.min.css>; rel=prefetch, </stylesheets/css/nprogress.css>; rel=prefetch, </semantic/semantic.js>; rel=prefetch');

    const postId = req.params.postId.split('.')[0];
    const board = req.params.board;

    // Buscar el hilo en la base de datos
    const data = await Thread.findOne({ board: board, postId: postId });

    // JSON Solicitado
    if (typeof req.query.json !== 'undefined') {
        res.json(data || { status: 404 });
        return;
    }
    // No existe el hilo
    if (!data) {
        next();
        return;
    }

    // Renderizar HTML
    res.render('hispachan/thread', {
        title: `${data.subject || data.message.substr(0, 30) + '...'} - ${publicSettings.site.title}`,
        settings: publicSettings,
        thread: data,
    });
});

// Eliminar hilos
router.all('/:board/del/:postId', async (req, res) => {
    const key = req.body.key || req.query.key;
    const postId = req.params.postId.split('.')[0];
    const board = req.params.board;

    res.setHeader('content-type', 'text/html; charset=utf-8');

    if (key !== serverSettings.delPass) {
        res.end('Contraseña Incorrecta.');
        return;
    }

    const data = await Thread.findOne({ board: board, postId: postId });

    if (!data) {
        res.end('El hilo no existe.');
        return;
    }

    try { await delThread(data) } catch (e) {
        res.end('Error.');
        return;
    }

    res.end('Hilo eliminado.');
});

module.exports = router;
