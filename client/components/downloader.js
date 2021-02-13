/**
 * Descarga, comprime y guarda todo el contenido (archivos) de un hilo
 */

import JSZIp from 'jszip';
import { saveAs } from 'file-saver';

export class Downloader {
    constructor(parent) {
        this.parent = parent;
        this.progressObj = $('#downloadProgress');
    }

    // Inicia la descarga
    start() {
        this.resetProgress();
        this.parent.data.downloader.started = true;
        this.parent.data.downloader.working = true;
        this.parent.data.downloader.done    = false;

        // Nombre del archivo comprimido a guardar
        const filename = `${this.getThreadId()}.zip`;

        // Mas bind, menos That
        this.getFilesData()
            .then(this.downloadFiles.bind(this))
            .then(this.generateZip.bind(this))
            .then(zip => this.save.bind(this)(zip, filename))
            .catch(err => this.displayError.bind(this)(err.toString(), true));
    }

    // Establece el estado la barra de progreso (lamentable)
    setProgress(data, data2, data3) {
        if (typeof data === 'object') this.progressObj.progress(data);
        else if (typeof data === 'string') this.progressObj.progress({
            label: 'ratio',
            text: {
                ratio: data2 ? '{value} de {total}' : '',
                active: data,
                success: data,
            },
            value: data2 || 0,
            total: data3 || 100,
        });
        return this.progressObj;
    }

    // Reinicia la barra de progreso
    resetProgress() {
        this.progressObj.removeClass('error success').addClass('indicating');
        this.setProgress({
            label: 'ratio',
            text: { ratio: '' },
            value: 0,
            total: 100,
        });
    }

    // Muestra un error y desbloquea el boton de descarga
    displayError(reason, unlock = false) {
        this.setProgress({
            label: 'ratio',
            text: { ratio: 'Error', active: reason, success: reason },
            value: 100, 
            total: 100,
        }).removeClass('success').addClass('error').removeClass('indicating');
        if (unlock) {
            this.parent.data.downloader.working = false;
        }
    }

    getThreadId() {
        const thread = document.getElementById('hispaBox');
        return (thread) ? thread.getAttribute('hf-id') : 'thread';
    }

    // Obtiene los datos de todos los archivos de un hilo
    async getFilesData() {
        // Contienen las URLs hacia los archivos
        const spans = [...document.querySelectorAll('.filesize')];

        const data = spans.map(span => {
            const a = span.querySelector('a');

            return {
                filename: a.textContent,
                url: a.href,
                blob: null
            }
        })
        return data;
    }

    async downloadFiles(filesData) {
        let count = 0;

        for (const fileData of filesData) {
            fileData.blob = await fetch(fileData.url)
                .then(response => {
                    // Manejo de errores (adicional)
                    switch (response.status) {
                        case 404:
                            throw new Error(`Archivo no encontrado.`);
                        default:
                            return response.blob();
                      }
                })
                .catch(err => { throw err });
                
            count++;
            
            // Progress bar
            const progressText = `Descargando: ${count} de ${filesData.length}`;
            this.setProgress({
                label: 'ratio',
                text: {
                    ratio: ' ',
                    active: progressText,
                    success: progressText
                },
                value: count,
                total: filesData.length,
            });
        }        
        return filesData;
    }

    async generateZip(files) {
        const zip = new JSZIp();

        for (const file of files) {
            zip.file(file.filename, file.blob, {binary: true});
        }

        const options = { type: 'blob', streamFiles: true };
        const zipped = await zip.generateAsync(options, metadata => {
            // Progress bar
            const progressPercent = Math.floor(metadata.percent);
            const progressText = `Comprimiendo archivos: ${progressPercent}%`;
            this.setProgress({
                label: 'ratio',
                text: {
                    ratio: ' ',
                    active: progressText,
                    success: progressText
                },
                value: progressPercent,
                total: 100,
            });
        })
        .catch(err => { throw new Error('Error durante la compresion.') });

        return zipped;
    }

    async save(blob, filename) {
        try {
            saveAs(blob, filename);
            this.parent.data.downloader.done = true;
            this.parent.data.downloader.working = false;
            this.setProgress({
                label: 'ratio',
                text: {
                    ratio: ' ',
                    active: 'Terminado.',
                    success: 'Terminado.'
                },
                value: 100,
                total: 100
            });
        } catch (err) {
            throw new Error('Error durante el guardado.')
        }
    }
}

// Estado por defecto del downloader. Usado por Vue.
export const downloaderState =
{
    working: false,
    started: false,
    done: false,
};
