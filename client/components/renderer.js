/**
 * Ayuda a renderizar los mensajes de los posts
 */

export default function renderPostMessage(text, postId) {
    // texto rojo (diciembre de 2018)
    // Este reemplazo siempre se tiene que ejecutar antes que los demas para que
    // no de problemas con el HTML que se va agregando
    text = text.replace(/(^[<]+)([^\n].+)$/gm, (x, y, z) => {
        return '<span class="redtext">' + y.replace(/</g, '&lt;') + z + '</span>';
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
    text = text.replace(/>>([r]?[l]?[f]?[q]?[0-9,\-,,]+)/g, ref => {
        const rP = ref.substr(2);
        const post = document.getElementsByName(rP)[0];
        if (post !== undefined) {
            // Backlinks
            const backlinks = post.parentElement.querySelector('blockquote .replybacklinks');
            const refToPost = backlinks.querySelector(`a.backlink[href="#${postId}"]`);
            if (refToPost === null) {
                const i = document.createElement('i');
                i.classList.add('notched', 'circle', 'loading', 'icon');
                const div = document.createElement('div');
                div.classList.add('ui', 'flowing', 'popup');
                const a = document.createElement('a');
                a.classList.add('backlink');
                a.href = `#${postId}`;
                a.innerText = `>>>${postId}`;
                div.appendChild(i);
                backlinks.appendChild(a);
                backlinks.appendChild(div);
            }
            return `<a class="backlink" href="#${rP}" data-ref="${rP}">${ref}</a><div class="ui flowing popup"><i class="notched circle loading icon"></i></div>`;
        } else {
            return `<a class="ref-futura" data-ref="${rP}">${ref}</a>`;
        }
    });
    // textoverde :^)
    text = text.replace(/(^[>]+)([^\n].+)$/gm,  (x, y, z) => {
        return '<span class="unkfunc">' + y.replace(/>/g, '&gt;') + z + '</span>';
    });
    // Saltos de línea
    text = text.replace(/\n/g, '<br />');

    return text;
}
