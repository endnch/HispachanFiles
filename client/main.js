/**
 * Hispachan Files Front End
 */

import jQuery from 'jquery';
import NProgress from 'nprogress';
import Vue from 'vue';
import { Archiver, archiverState } from './components/archiver';
import { Settings, defaultSettings } from './components/settings';
import renderPostMessage from './components/renderer';
import Thread from './components/thread';

class HispachanFiles {
    constructor() {
        this.data = { archiver: archiverState, settings: defaultSettings };
        // Mostrar barra de carga inicial
        NProgress.start();
        // Si no coloco jQuery en una variable global, la perra de semantic-ui deja de funcionar
        window.jQuery = jQuery;
        window.$ = jQuery;
        this.settings = new Settings(this);
        this.assignEvents();
    }

    // Eventos básicos
    assignEvents() {
        const that = this;
        // Clásico
        $(document).ready(() => { that.documentReady() });
        $(window).load(() => { that.documentLoaded() });
    }

    documentReady() {
        const that = this;
        $('#sideToggle').click(() => {
            $('#mainSb').sidebar('toggle');
            return false;
        });

        $('#mainTabs .item').tab();

        $('#saveBtn').click(() => {
            if (that.data.archiver.working) return;
            const archiver = new Archiver(that.data.archiver.url, that);
            archiver.start();
        });

        $('#threadSearch').search({
            apiSettings: {
                url: '/ui-search?q={query}',
            },
            type: 'standard',
        });

        $('#settingsBtn').click(() => that.settings.showModal());

        $(document.body).on('click', '#copyBtn', () => {
            if (document.queryCommandSupported('copy')) {
                $('#copyBox').select();
                document.execCommand('copy');
            } else {
                prompt('Tu navegador no soporta el copiado. Pulsa Ctrl+C para copiar manualmente.', $('#copyBox').val());
            }
        });

        // Estamos en un Hilo
        if ($('#hispaBox').length) {
            const hB = $('#hispaBox');
            const th = new Thread(hB.prop('hf-board'), hB.prop('hf-id'));
            this.threadControl = th;
            th.setEvents($);
        }

        // Uso Vue para el parseado
        Vue.use(require('vue-moment'));
        Vue.filter('renderPostMessage', renderPostMessage);

        this.app = new Vue({
            el: document.body,
            data: this.data,
            created: function () {
                NProgress.done();
            },
        });
    }

    documentLoaded() {
        // Previews de backlinks
        $('.backlink').popup({
            duration: 0,
            variation: 'basic small',
            lastResort: 'bottom left',
            position: 'bottom left',
            onVisible: function() {
                this.html($(`#reply${this.prev().attr('href').substr(1)}`).html());
                this.find(`a[name=${this.prev().attr('href').substr(1)}]`).attr('name', '');
                if (this.find('video').length > 0) {
                    // Si el video está dentro de otro popup, no lo reproduzcas
                    const videos = this.find('.popup video');
                    videos.removeAttr('autoplay');
                }
            },
            onHide: function() {
                if (this.find('video').length > 0) {
                    this.find('video').get(0).pause();
                }
            },
        });
        $('.backlink').click(function() {
            $('.reply').removeClass('highlight');
            $(`#reply${$(this).attr('href').substr(1)}`).addClass('highlight');
        });
    }
}

window.hispachanFiles = new HispachanFiles();