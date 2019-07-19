/**
 * Contiene distintos eventos para los hilos
 */
'use strict';

export default class Thread
{
    constructor(board, id)
    {
        this.board = board;
        this.postId = id;
    }
    
    // Expandir Imágenes
    // TODO: Expandir WEBM
    expandThumb(imgEl)
    {
        let expandUrl = $(imgEl).parent().parent().prop('href');
        if(expandUrl.substr(-3) == 'pdf') return;
        if(expandUrl.substr(-3) == 'swf') return;
        if(expandUrl.substr(-3) == 'mp4' || expandUrl.substr(-4) == 'webm') {
            const video = $(`<video controls autoplay name="media"><source src="${expandUrl}"></video>`);
            const image = $(imgEl);
            image.parent().parent().after(video);
            $(video).css({
                'max-width': '98%',
                'max-height': '70%',
                'margin': '2px 20px 10px'
            });
            image.hide();
            const closeButton = $('<a href="#" class="cerr">[Cerrar]</a>');
            image.parent().parent().prev().before(closeButton);
            closeButton.click(() => {
                video.remove();
                image.show();
                closeButton.remove();
                return false;
            });
            return false;
        };

        if($(imgEl).is('[expand]'))
        {
            // Fix para imágenes muy altas
            if ($(imgEl).height() >= $(window).height() && $(window).scrollTop() > $(imgEl).offset().top - 64) {
                $(window).scrollLeft(0).scrollTop($(imgEl).offset().top - 64);
            }
            $(imgEl).prop('src', $(imgEl).data('thumbUrl'));
            $(imgEl).removeAttr('expand');
            $(imgEl).removeAttr('style');
        }
        else
        {
            $(imgEl).data('thumbUrl', $(imgEl).prop('src'));
            $(imgEl).prop('src', expandUrl);
            $(imgEl).attr('expand','');
            $(imgEl).css({
                'max-width': '98%',
                'max-height': '100%',
            });
        }
        
        return false;
    }
    
    setEvents($)
    {
        let that = this;
        
        // Expandir imágenes
        $('img.thumb').click(ev=> that.expandThumb(ev.currentTarget));
    }
}