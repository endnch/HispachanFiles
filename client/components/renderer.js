/**
 * Ayuda a renderizar los mensajes de los posts
 */
'use strict';

export default function renderPostMessage(text, postId)
{
    // texto rojo (diciembre de 2018)
    // Este reemplazo siempre se tiene que ejecutar antes que los demas para que
    // no de problemas con el HTML que se va agregando
    text = text.replace(/(^[\<]+)([^\n].+)$/gm, function (x, y, z) {
         return '<span class="redtext">'+y.replace(/</g, "&lt;") + z + '</span>';
    });
    // Links
    text = text.replace(/(https?:\/\/[^\s]+)/g, url => `<a target="_blank" href="${url}">${url}</a>`);
    // BBCode
    text = text.replace(/\[b\]([\s\S]*?)\[\/b\]/g, '<b>$1</b>');
    text = text.replace(/\[i\]([\s\S]*?)\[\/i\]/g, '<i>$1</i>');
    text = text.replace(/\[u\]([\s\S]*?)\[\/u\]/g, '<u>$1</u>');
    text = text.replace(/\[s\]([\s\S]*?)\[\/s\]/g, '<s>$1</s>');
    // Descansa en paz, dulce príncipe
    text = text.replace(/\[spoiler\]([\s\S]*?)\[\/spoiler\]/g, '<span class="spoiler">$1</span>');
    // Code
    text = text.replace(/\[code\]([\s\S]*?)\[\/code\]/g, '<div class="code">$1</div>');
    // Reflinks
    text = text.replace(/\>\>([r]?[l]?[f]?[q]?[0-9,\-,\,]+)/g, ref => {
        var rP = ref.substr(2);
        if($('[name="'+rP+'"]').length)
        {
            $(`a[name="${rP}"]`).parent().find('blockquote .replybacklinks').first().append(`<a href="#${postId}">>>${postId}</a>`);
            return `<a href="#${rP}" data-ref="${rP}">${ref}</a>`;
        }
        else
        {
            return `<a class="ref-futura" data-ref="${rP}">${ref}</a>`;
        }
    });
    // textoverde :^)
    text = text.replace(/(^[\>]+)([^\n].+)$/gm,  function (x, y, z) {
         return '<span class="unkfunc">'+y.replace(/>/g, "&gt;") + z + '</span>';
    });
    // Saltos de línea
    text = text.replace(/\n/g, "<br />");
    
    return text;
}