/**
 * Archivador de Hispachan Files
 *
 * Aquí es donde ocurre toda la magia
 */
'use strict';

const mkdirp   = require('mkdirp');
const fs       = require('fs');
const md5      = require('md5');
const axios    = require('axios');

const Thread   = require('../../models/thread');

class Archiver {
    constructor() {
        this.queue = [];
        this.current = {};
    }

    // Añadir hilo a la cola.
    addToQueue(data, socket) {
        this.queue.push({ data: data, by: socket });
        if (this.queue.length < 2) {
            this.next();
        }
    }

    // Avanzar en la cola
    next() {
        this.current = this.queue.shift();
        this.start();
    }

    // Archivar Hilo
    async start() {
        const thread = this.current;
        // Establecer directorios para los datos del hilo
        thread.dataDir = `data/${thread.data.board}/${thread.data.postId}/`;
        thread.fileDir = thread.dataDir + 'src/';
        thread.thumbDir = thread.dataDir + 'thumb/';
        thread.saved = 0;

        // Almacenar todas las imágenes
        for (const reply of thread.data.replies) {
            if (reply.file) {
                await this.storeAttachment(reply);
            }
            this.reportProgress('Guardando archivos...', ++thread.saved, thread.data.replyCount + 1);
        }

        // Almacenar imagen de OP
        if (thread.data.file) {
            await this.storeAttachment(thread.data);
        }

        // Almacenar en la base de datos
        const query = { 'postId': thread.data.postId, 'board': thread.data.board };
        thread.data.lastUpdate = Date.now();
        await Thread.findOneAndUpdate(query, thread.data, { upsert: true });

        // Reportar al navegador
        if (this.current.by.connected) {
            this.current.by.emit('archiverDone');
        }
        // Avanzar en la cola
        this.current = {};
        if (this.queue.length > 0) this.next();
    }

    // Reportar progreso al navegador
    reportProgress(text, current, total) {
        if (this.current.by.connected) {
            this.current.by.emit('progressReport', text, current, total);
        }
    }

    // Guardar archivos adjuntos de un post
    async storeAttachment(post) {
        // Crear Directorios para archivos, si no existen
        mkdirp.sync(this.current.fileDir);
        mkdirp.sync(this.current.thumbDir);

        // Almacenar thumb
        // Ubicación final de la thumb
        const thumbPath = this.current.thumbDir + post.file.thumb.split('/').reverse()[0];

        if (!fs.existsSync(thumbPath)) {
            // Descargar thumb
            try {
                const response = await axios.get(post.file.thumb, { responseType: 'stream' });

                await new Promise((resolve, reject) => {
                    response.data.pipe(fs.createWriteStream(thumbPath))
                        .on('error', error => { reject(error) })
                        .on('finish', () => { resolve() });
                });
            } catch (error) {
                if (!(error.response && error.response.status === 404)) {
                    throw new Error(error);
                }

                // Esto es un hack
                // Hace falta hacer el parseado de hilos con un headless browser
                const response = await axios.get('https://www.hispachan.org/buttons/previewerror.png', { responseType: 'stream' });

                await new Promise((resolve, reject) => {
                    response.data.pipe(fs.createWriteStream(thumbPath))
                        .on('error', error => { reject(error) })
                        .on('finish', () => { resolve() });
                });
            }
        }
        // Establecer nueva ubicación
        post.file.thumb = thumbPath;

        // Almacenar archivo
        // Ubicación final del archivo
        const filePath = this.current.fileDir + post.file.url.split('/').reverse()[0];

        if (!fs.existsSync(filePath)) {
            // Descargar archivo
            const response = await axios.get(post.file.url, { responseType: 'stream' });
            await new Promise((resolve, reject) => {
                response.data.pipe(fs.createWriteStream(filePath))
                    .on('error', error => { reject(error) })
                    .on('finish', () => { resolve() });
            });
            post.file.md5 = md5(fs.readFileSync(filePath));
        }
        // Establecer nueva ubicación
        post.file.url = filePath;
    }
}

module.exports = new Archiver();