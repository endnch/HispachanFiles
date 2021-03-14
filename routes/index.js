'use strict';

const express = require('express');
const router = express.Router();
const marked = require('marked');
const news = marked(require('fs').readFileSync('news.md', 'utf-8'));
const publicSettings = require('../settings');
const { boards } = require('../boards');

router.get('/', (req, res) => {
    // CloudFlare server push
    res.set('Link', '</dist/app.min.js>; rel=preload, </fomantic/semantic.min.css>; rel=prefetch, </stylesheets/css/nprogress.css>; rel=prefetch, </fomantic/semantic.js>; rel=prefetch');
    res.render('index', {
        title: `${publicSettings.site.title} - ${publicSettings.site.subtitle}`,
        settings: publicSettings,
        news,
        boards,
    });
});

module.exports = router;