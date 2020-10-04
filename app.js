'use strict';

const express = require('express');
const socket_io = require('socket.io');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const sass = require('node-sass-middleware');
const mongoose = require('mongoose');

const routes = require('./routes/index');
const apiRoutes = require('./routes/api');
const socketRoutes = require('./routes/socket');
const threadRoutes = require('./routes/thread');
const searchRoutes = require('./routes/search');

const settings = require('./settings');
const serverSettings = require('./server-settings');
const capitalize = require('./utils/capitalize');

const app = express();

// Socket.io
const io = socket_io();
app.io = io;

// Mongoose
const url = process.env.NODE_ENV === 'test'
    ? serverSettings.db.testUrl
    : serverSettings.db.url;

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(sass({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    sourceMap: true,
}));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/data', express.static(path.join(__dirname, 'data')));
app.use((req, res, next) => {
    res.locals.capitalize = capitalize;
    next();
});

app.use('/', routes);
app.use('/', threadRoutes);
app.use('/', searchRoutes);
if (settings.features.apiEnabled) {
    app.use('/api', apiRoutes);
}

io.on('connection', socketRoutes);

// Interceptar 404 y enviarlo al error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handler personalizado
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    if (app.get('env') === 'development') {
        res.json(err);
    } else {
        res.render('error', {
            title: `Error - ${settings.site.title}`,
            settings: settings,
            error: err,
        });
    }
});


module.exports = app;
