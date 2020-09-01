'use strict';

const postMeta = require('./parsePost');

/**
 * Obtener los datos de cada hilo.
 * @param {Cheerio} thread
 * @param {Cheerio} $
 * @return {Object} data
 */
function threadMeta(thread, $) {
    // Metadatos básicos
    const data = postMeta(thread);
    data.board = $('input[name="board"]').val();
    data.subject = thread.find('span.filetitle').first().text().replace(/(\r\n|\n|\r)/gm, '');
    const replies = thread.find('.reply');
    data.replyCount = replies.length;
    const omitted = thread.find('.omittedposts');
    if (omitted.length > 0) {
        const oX = omitted.text();
        const oM = oX.match(/\d+/g);
        if (oM.length > 0) {
            data.omittedPosts = parseInt(oM[0]);
            data.replyCount += parseInt(oM[0]);
            data.omittedImages = (oM.length > 1) ? parseInt(oM[1]) : 0;
        }
    }
    data.replies = [];
    replies.each((i, el) => {
        data.replies.push(postMeta($(el), $));
    });

    return data;
}

module.exports = threadMeta;