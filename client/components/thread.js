/**
 * Contiene distintos eventos para los hilos
 */

export default class Thread {
    constructor(board, id) {
        this.board = board;
        this.postId = id;
    }

    expandThumb(event) {
        event.preventDefault();
        const imgEl = event.currentTarget;
        const imgParent = imgEl.parentElement.parentElement;
        const expandUrl = imgParent.href;

        if (expandUrl.substr(-3) === 'pdf') return;
        if (expandUrl.substr(-3) === 'swf') return;
        if (expandUrl.substr(-3) === 'mp4' || expandUrl.substr(-4) === 'webm') {
            const video = document.createElement('video');
            video.controls = true;
            video.autoplay = true;
            video.name = 'media';
            video.style.maxWidth = '98%';
            video.style.maxHeight = '70%';
            video.style.margin = '2px 20px 10px';

            const source = document.createElement('source');
            source.src = expandUrl;
            video.appendChild(source);

            imgEl.style.display = 'none';
            imgParent.insertAdjacentElement('afterend', video);

            const closeButton = document.createElement('a');
            closeButton.href = '#';
            closeButton.classList.add('cerr');
            closeButton.innerText = '[Cerrar]';
            imgParent.previousElementSibling.insertAdjacentElement('beforebegin', closeButton);
            closeButton.addEventListener('click', (event) => {
                event.preventDefault();
                video.remove();
                closeButton.remove();
                imgEl.style.display = null;
            });
            return;
        }

        if (imgEl.dataset.expanded === 'true') {
            if (imgEl.height >= window.innerHeight && imgEl.y < 64) {
                window.scrollBy(0, imgEl.y - 64);
            }
            imgEl.src = imgEl.dataset.thumbUrl;
            delete imgEl.dataset.expanded;
            delete imgEl.dataset.thumbUrl;
            imgEl.style.maxWidth = null;
            imgEl.style.maxHeight = null;
        } else {
            imgEl.dataset.thumbUrl = imgEl.src;
            imgEl.src = expandUrl;
            imgEl.dataset.expanded = true;
            imgEl.style.maxWidth = '98%';
            imgEl.style.maxHeight = '100%';
        }
    }

    setEvents() {
        const elements = document.querySelectorAll('img.thumb');
        elements.forEach((element) => {
            element.addEventListener('click', this.expandThumb);
        });
    }
}
