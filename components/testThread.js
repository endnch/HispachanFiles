'use strict';

const settings = require('../settings');

/**
 * Decide si un hilo cumple con los requisitos para ser almacenado
 * (Putos moralfags)
 *
 * @param {Object} thread
 * @return {String} failReason
 */
function testThread(thread) {
    if (thread.replyCount < settings.misc.minimumReplies) return 'El hilo tiene pocas respuestas';
    return '';
}

module.exports = testThread;