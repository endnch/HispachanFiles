'use strict';

/**
 * Obtener los datos de cada post.
 * @param {Cheerio} post
 * @param {Cheerio} $
 * @return {Object} data
 */

function postMeta(post) {
    const data = {};
    // ID de posteo
    data.postId = parseInt(post.find('.reflink').first().find('a').last().text().trim());
    // Nombre del posteador (en boards con campo de nombre)
    const posterName = post.find('span.postername').first().contents().filter(function(){
        return this.nodeType === 3;
    });

    if (posterName.length > 0) {
        data.posterName = posterName[0].nodeValue.trim();
    }

    // ID anónimo
    if (post.find('.anonid').length > 0) {
        const anonId = post.find('.anonid').first();
        data.anonId = anonId.text();
        data.anonIdColor = anonId.css('background-color');
    }

    // Bandera
    if (post.find('.bandera').length > 0) {
        const bandera = post.find('.bandera').first();
        data.posterCountry = bandera.attr('alt');
        data.posterCountryName = bandera.attr('title');
        data.flag = bandera.attr('src');
    }

    // Bandera LGBT+
    if (post.find('img[title="Bandera LGBT+"]').length > 0) {
        const bandera = post.find('img[title="Bandera LGBT+"]').first();
        data.flag = 'https://www.hispachan.org' + bandera.attr('src');
        data.posterCountryName = 'Bandera LGBT+';
    }

    // OP
    if (post.find('.op').length > 0) {
        data.op = true;
    }

    // Admin
    if (post.find('.postername').first().next().hasClass('admin')) {
        data.admin = true;
    }

    // Mod
    if (post.find('.postername').first().next().hasClass('mod')) {
        data.mod = true;
    }

    // Cerrado
    if (post.find('[alt="Cerrado"]').length > 0) {
        data.locked = true;
    }

    // Hilo fijado
    if (post.find('[alt="Hilo fijado"]').length > 0) {
        data.sticky = true;
    }

    // Dados
    if (post.find('[alt="Se permiten dados"]').length > 0) {
        data.dice = true;
    }

    // Fecha y Hora
    const dateRe    = /(\d{1,2})\/(\d{1,2})\/(\d{1,2}) (\d{1,2}):(\d{1,2})/;
    const dateParts = post.find('.timer a')[0].attribs['data-date'].trim().match(dateRe);
    const date      = new Date(Date.UTC(
        parseInt('20' + dateParts[3]),
        parseInt(dateParts[2]) - 1,
        parseInt(dateParts[1]),
        parseInt(dateParts[4]),
        parseInt(dateParts[5]),
    ));
    data.date = date;

    // Nuevo dado [Abril 2016]
    const dC = post.find('blockquote').first().find('span.dado');
    if (dC.length > 0) {
        data.dado = dC.text().replace('=', '').trim();
        dC.remove();
    }

    // Fortunas [Julio 2016]
    const fort = post.find('blockquote').first().find('font[color="red"]');
    if (fort.length > 0) {
        const fortxt = fort.find('b').text();
        if (fortxt.substr(0, 11) === 'Tu fortuna:') {
            data.fortuna = fortxt.substr(11).trim();
            fort.remove();
        }
    }

    // Mensaje
    let html = post.find('blockquote').first().html();
    // Convertir HTML a BBCode de Hispa
    html = html.replace(/<div class="code([^"]*)">([\s\S]*?)<\/div>/gmi, '[code]$2[/code]'); // [code]
    html = html.replace(/<b([^r>]*)>([\s\S]*?)<\/b>/gmi, '[b]$2[/b]'); // [b] evitando <br>
    html = html.replace(/<i([^>]*)>([\s\S]*?)<\/i>/gmi, '[i]$2[/i]'); // [i]
    html = html.replace(/<span style="border-bottom([^"]+)">([\s\S]*?)<\/span>/gmi, '[u]$2[/u]'); // [u] (que mierda zeta?)
    html = html.replace(/<strike([^>]*)>([\s\S]*?)<\/strike>/gmi, '[s]$2[/s]'); // [s]
    html = html.replace(/<span[^>]+class="spoiler(.*?)"[^>]*>([\s\S]*?)<\/span>/gmi, '[spoiler]$2[/spoiler]'); // [spoiler]
    html = html.replace(/<a id="embed(.*?)">(.*?)<\/a>/gmi, ''); // [Reproducir]
    post.find('blockquote').first().html(html);
    post.find('.abbrev').first().remove();
    data.message = post.find('blockquote').first().text().trim().replace(/(\r\n|\r)/gm, '\n');

    // Archivo
    if (post.children('.filesize').length >= 1 || post.find('.activa').children('.filesize').length >= 1) {
        const fileInfo = post.find('.filesize').first();
        const fileMeta = fileInfo.children('span[style^="font-size"]').first();
        const fileMetaR = fileMeta.text().replace(/(\r\n|\n|\r|[()])/gm, '').split(',');
        const fileSize = fileMetaR[0].trim();
        let fileRes = (fileMetaR.length > 1) ? fileMetaR[1].trim() : '';
        let fileON = fileMeta.find('.nombrefile').attr('title') || fileMeta.find('.nombrefile').text().replace(',', '').trim();
        if (fileMetaR.length === 2) fileRes = undefined;
        if (!fileON) fileON = undefined;
        data.file = {
            url: fileInfo.find('a').first().attr('href'),
            size: fileSize,
            resolution: fileRes,
            name: fileON,
            thumb: post.find('img.thumb').first().attr('src'),
        };
    }

    return data;
}

module.exports = postMeta;