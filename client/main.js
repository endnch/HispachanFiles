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
        window.addEventListener('load', () => {
            this.documentLoaded();
        });

        if (document.readyState === 'complete') {
            this.documentReady();
        } else {
            document.addEventListener('readystatechange', (event) => {
                if (event.target.readyState === 'complete') {
                    this.documentReady();
                }
            });
        }
    }

    documentReady() {
        const that = this;
        document.getElementById('sideToggle').addEventListener('click', (event) => {
            event.preventDefault();
            $('#mainSb').sidebar('toggle');
        });

        $('#mainTabs .item').tab();

        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn !== null) {
            saveBtn.addEventListener('click', () => {
                if (that.data.archiver.working) return;
                const archiver = new Archiver(that.data.archiver.url, that);
                archiver.start();
            });
        }

        $('#threadSearch').search({
            apiSettings: {
                url: '/ui-search?q={query}',
            },
            type: 'standard',
        });

        document.getElementById('settingsBtn').addEventListener('click', () => that.settings.showModal());

        document.body.addEventListener('click', (event) => {
            if (event.srcElement.id === 'copyBtn') {
                const copyBox = document.getElementById('copyBox');
                if (document.queryCommandSupported('copy')) {
                    copyBox.select();
                    document.execCommand('copy');
                } else {
                    prompt('Tu navegador no soporta el copiado. Pulsa Ctrl+C para copiar manualmente.', copyBox.value);
                }
            }
        });

        // Estamos en un Hilo
        if (document.getElementById('hispaBox') !== null) {
            const hB = document.getElementById('hispaBox');
            const th = new Thread(hB.getAttribute('hf-board'), hB.getAttribute('hf-id'));
            this.threadControl = th;
            th.setEvents();
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
                this.html(document.getElementById(`reply${this.prev().attr('href').substr(1)}`).innerHTML);
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
        const backlinks = document.getElementsByClassName('backlink');
        for (const backlink of backlinks) {
            backlink.addEventListener('click', (event) => {
                const target = event.currentTarget;
                const replies = document.getElementsByClassName('reply');
                for (const reply of replies) {
                    reply.classList.remove('highlight');
                }
                document.getElementById(`reply${target.href.split('#')[1]}`)
                    .classList.add('highlight');
            });
        }
        $('.ui.dropdown').dropdown();
    }
}

window.hispachanFiles = new HispachanFiles();
