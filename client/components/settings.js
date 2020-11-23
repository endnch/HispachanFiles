/**
 * Maneja la configuración (client-side) de Hispachan Files
 */

import settings from '../../settings';

export class Settings {
    constructor(app) {
        this.app = app;
        if (localStorage.hfSettings) {
            app.data.settings = JSON.parse(localStorage.hfSettings);
        }
        this.data = app.data.settings;
        this.loadStyles();
    }

    loadStyles() {
        const styleLink = document.getElementById('mainStyle');
        styleLink.href = '/stylesheets/' +  this.data.style + '.css';

        if (this.data.useCustomCSS) {
            const element = document.createElement('style');
            element.id = 'customStyle';
            element.innerText = this.data.customCSS;
            document.body.appendChild(element);
        }
    }

    updateStyles() {
        this.data = this.app.data.settings;
        const styleLink = document.getElementById('mainStyle');
        styleLink.href = '/stylesheets/' + this.data.style + '.css';
        const customStyle = document.getElementById('customStyle');
        if (customStyle !== null) {
            customStyle.remove();
        }
        if (this.data.useCustomCSS) {
            const element = document.createElement('style');
            element.id = 'customStyle';
            element.innerText = this.data.customCSS;
            document.body.appendChild(element);
        }
    }

    showModal() {
        const that = this;
        const previousSettings = this.app.data.settings;
        $('#hfSettings').modal({
            closable: false,
            onDeny() {
                that.app.data.settings = previousSettings;
            },
            onApprove: function() {
                that.saveSettings();
                that.updateStyles();
            },
        }).modal('show');
    }

    saveSettings() {
        localStorage.hfSettings = JSON.stringify(this.app.data.settings);
    }
}

export const defaultSettings =
{
    style: settings.styles.defaultStyle,
    useCustomCSS: false,
    customCSS: '',
};
