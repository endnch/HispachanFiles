'use strict';

const express = require('express');
const router = express.Router();
const publicSettings = require('../settings');
const serverSettings = require('../server-settings');
const Post = require('../models/post');
const deletePost = require('../components/deletePost');

router.get('/:board/res/:postId', async (req, res, next) => {
    // CloudFlare server push
    res.set('Link', '</dist/app.min.js>; rel=preload, </fomantic/semantic.min.css>; rel=prefetch, </stylesheets/css/nprogress.css>; rel=prefetch, </fomantic/semantic.js>; rel=prefetch');

    const postId = req.params.postId.split('.')[0];
    const board = req.params.board;

    // Buscar el hilo en la base de datos
    const data = await Post.findOne({ board: board, postId: postId, thread: null }).populate('replies');

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

// Eliminar posts
router.delete('/:board/res/:postId', async (req, res) => {
    res.setHeader('content-type', 'text/html; charset=utf-8');

    if (!publicSettings.features.threadDeletion) {
        res.end('Función desactivada');
        return;
    }

    const key = req.body.key;
    const postId = req.params.postId.split('.')[0];
    const board = req.params.board;

    if (key !== serverSettings.delPass) {
        res.end('Contraseña Incorrecta.');
        return;
    }

    const post = await Post.findOne({ board, postId })
        .populate('thread')
        .populate('replies')
        .lean();

    if (!post) {
        res.end('El post no existe.');
        return;
    }

    try { await deletePost(post) } catch (e) {
        res.end('Error.');
        return;
    }

    res.end('Post eliminado.');
});

module.exports = router;
