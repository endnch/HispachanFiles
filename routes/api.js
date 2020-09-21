'use strict';

const express = require('express');
const router = express.Router();

const hispafiles = require('./api/hispafiles');
const hispachan = require('./api/hispachan');

const publicSettings = require('../settings');

router.get('/', (req, res) => {
    // CloudFlare server push
    res.set('Link', '</dist/app.min.js>; rel=preload, </semantic/semantic.min.css>; rel=prefetch, </stylesheets/css/nprogress.css>; rel=prefetch, </semantic/semantic.js>; rel=prefetch');
    res.render('api', {
        title: `Api - ${publicSettings.site.title}`,
        settings: publicSettings,
    });
});

router.use('/hispafiles', hispafiles);
router.use('/hispachan', hispachan);

module.exports = router;
