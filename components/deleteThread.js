'use strict';
const Thread = require('../models/thread');
const rimraf = require('rimraf');

/**
 * Elimina un hilo de la base de datos y todos los archivos relacionados
 *
 * @param {Object} thread - El hilo a eliminar
 * @returns {Promise} Promsesa del resultado
 */
const deleteThread = thread => {
    return new Promise((resolve, reject) => {
        Thread.findOneAndRemove({ postId: thread.postId, board: thread.board })
            .catch(reject);

        rimraf(`data/${thread.board}/${thread.postId}`, e => {
            if (e) reject(e);
            resolve();
        });
    });
};

module.exports = deleteThread;