'use strict';

const axios = require('axios');
const urlParse = require('url-parse');
const cheerio = require('cheerio');
const cloneDeep = require('lodash.clonedeep');
const thParse = require('../components/parsers/parseThread');
const thTest = require('../components/testThread');
const archiver = require('../components/archiver/');
const capitalize = require('../utils/capitalize');
const settings = require('../settings');

module.exports = socket => {
    // Solicitud de almacenamiento de hilo.
    socket.on('queueThread', async url => {
        let urlInfo;
        try {
            urlInfo = urlParse(url);
        } catch (e) {
            socket.emit('queueFailed', 'URL Inválida');
            return;
        }
        if (urlInfo.hostname !== `www.${settings.target}.org`) {
            socket.emit('queueFailed', `Esta URL no pertenece a ${capitalize(settings.target)} ni a Hispachan File`);
            return;
        }
        if (!/\/(.+)\/res\/(\d+)(\.html)?/.test(urlInfo.pathname)) {
            socket.emit('queueFailed', 'Esta URL no pertenece a ningún hilo.');
            return;
        }

        // Obtener información del hilo
        let response = {};
        try {
            response = await axios.get(url);
        } catch ({ response }) {
            if (response.status === 404) {
                socket.emit('queueFailed', 'El Hilo está en 404.');
            } else {
                socket.emit('queueFailed', 'Se ha producido un error al obtener datos del hilo.');
            }
            return;
        }

        const $ = cheerio.load(response.data);
        const threadRaw = $('[id^="thread"]');
        const thread = thParse(threadRaw, $);

        if (thread.length < 1) {
            socket.emit('queueFailed', 'Se ha producido un error al obtener datos del hilo.');
            return;
        }

        // Verificar que el hilo cumpla con los requistos
        const testResult = thTest(thread);
        if (testResult) {
            socket.emit('queueFailed', testResult);
            return;
        }

        // Poner el hilo en la cola de guardado
        try {
            archiver.addToQueue(cloneDeep(thread), socket);
        } catch (e) {
            socket.emit('queueFailed', 'Se ha producido un error al obtener datos del hilo.');
            return;
        }

        socket.emit('queueSuccess', thread);
    });
};