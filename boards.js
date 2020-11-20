/**
 * Tablones
 *
 * Tablones reconocidos por HispachanFiles
 */
'use strict';

const boards = [
    [
        {
            board: 'all',
            title: 'Todos los hilos',
        },
    ],
    [
        {
            board: 'a',
            title: 'Anime y Manga',
        },
        {
            board: 'b',
            title: 'Balcón',
        },
        {
            board: 'ac',
            title: 'Animación y Cómics',
        },
        {
            board: 'c',
            title: 'Ciencia',
        },
        {
            board: 'ch',
            title: 'Historias y Consejos',
        },
        {
            board: 'di',
            title: 'Dibujo y Arte',
        },
        {
            board: 'f',
            title: 'Ejercicio, Salud y Estilo',
        },
        {
            board: 'g',
            title: 'General',
        },
        {
            board: 'hu',
            title: 'Humanidades',
        },
        {
            board: 'i',
            title: 'Adictos a Internet',
        },
        {
            board: 'k',
            title: 'Economía',
        },
        {
            board: 'm',
            title: 'Meta',
        },
        {
            board: 'mu',
            title: 'Música',
        },
        {
            board: 'p',
            title: 'Deportes',
        },
        {
            board: 'pol',
            title: 'Política',
        },
        {
            board: 'q',
            title: 'LGBT+',
        },
        {
            board: 'r',
            title: 'Juegos y Rol',
        },
        {
            board: 't',
            title: 'Tecnología',
        },
        {
            board: 'tv',
            title: 'Cine y Series',
        },
        {
            board: 'v',
            title: 'Videojuegos',
        },
        {
            board: 'w',
            title: 'Videos',
        },
        {
            board: 'z',
            title: 'Libros y Literatura',
        },
    ],
    [
        {
            board: 'ar',
            title: 'Argentina',
        },
        {
            board: 'bo',
            title: 'Bolivia',
        },
        {
            board: 'cc',
            title: 'Centroamérica y Caribe',
        },
        {
            board: 'cl',
            title: 'Chile',
        },
        {
            board: 'co',
            title: 'Colombia',
        },
        {
            board: 'ec',
            title: 'Ecuador',
        },
        {
            board: 'es',
            title: 'España',
        },
        {
            board: 'mx',
            title: 'México',
        },
        {
            board: 'pe',
            title: 'Perú',
        },
        {
            board: 'py',
            title: 'Paraguay',
        },
        {
            board: 'us',
            title: 'Estados Unidos',
        },
        {
            board: 'uy',
            title: 'Uruguay',
        },
        {
            board: 've',
            title: 'Venezuela',
        },
    ],
    [
        {
            board: 'd',
            title: 'Fetiches',
        },
        {
            board: 'h',
            title: 'Hentai',
        },
        {
            board: 'ha',
            title: 'Hentai Alternativo',
        },
        {
            board: 'sc',
            title: 'Sexy Cartoons',
        },
        {
            board: 'o',
            title: 'Chicos Sexy',
        },
        {
            board: 's',
            title: 'Chicas Sexy',
        },
        {
            board: 'sar',
            title: 'Chicas Sexy Argentina',
        },
        {
            board: 'scl',
            title: 'Chicas Sexy Chile',
        },
        {
            board: 'sco',
            title: 'Chicas Sexy Colombia',
        },
        {
            board: 'ses',
            title: 'Chicas Sexy España',
        },
        {
            board: 'smx',
            title: 'Chicas Sexy México',
        },
        {
            board: 'spe',
            title: 'Chicas Sexy Perú',
        },
        {
            board: 'sve',
            title: 'Chicas Sexy Venezuela',
        },
    ],
];

module.exports = {
    boards,
    allowList: boards.flat().map(x => x.board),
};