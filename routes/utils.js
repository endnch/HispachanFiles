'use strict';

/**
 * Crea el divisor derecho
 *
 * @param {Array} pages - El arreglo que contendrá el resultado
 * @param {Number} p - La página en la que está el usuario
 * @param {Number} totalPages - El número de páginas totales
 */
const createRightDivider = (pages, p, totalPages) => {
    if (p + 10 <= totalPages) {
        pages.push({ type: 'page', num: p + 10, text: '+10', active: false });
    } else if (p + 5 <= totalPages) {
        pages.push({ type: 'page', num: p + 5, text: '+5', active: false });
    } else {
        pages.push({ type: 'divider' });
    }
};

/**
 * Crea el divisor izquierdo
 *
 * @param {Array} pages - El arreglo que contendrá el resultado
 * @param {Number} p - La página en la que está el usuario
 */
const createLeftDivider = (pages, p) => {
    if (p - 10 >= 1) {
        pages.push({ type: 'page', num: p - 10, text: '-10', active: false });
    } else if (p - 5 >= 1) {
        pages.push({ type: 'page', num: p - 5, text: '-5', active: false });
    } else {
        pages.push({ type: 'divider' });
    }
};

/**
 * Genera la paginación
 *
 * @param {Number} p - La página en la que está el usuario
 * @param {Number} totalPages - El número de páginas totales
 */
const generatePagination = (p, totalPages, path) => {
    if (totalPages <= 1) {
        return [];
    }

    const pages = [];

    // Primera página
    pages.push({ type: 'page', num: 1, active: p === 1 });

    if (totalPages <= 7) {
        for (let i = 2; i <= totalPages - 1; i++) {
            pages.push({ type: 'page', num: i, active: p === i });
        }
    } else if (p <= 4) {
        for (let i = 2; i <= 5; i++) {
            pages.push({ type: 'page', num: i, active: p === i });
        }

        createRightDivider(pages, p, totalPages);
    } else if (p >= totalPages - 3) {
        createLeftDivider(pages, p);

        for (let i = totalPages - 4; i <= totalPages - 1; i++) {
            pages.push({ type: 'page', num: i, active: p === i });
        }
    } else {
        //  4 < p < totalPages - 3
        createLeftDivider(pages, p);
        pages.push({ type: 'page', num: p - 1, active: false });
        pages.push({ type: 'page', num: p, active: true });
        pages.push({ type: 'page', num: p + 1, active: false });
        createRightDivider(pages, p, totalPages);
    }

    // Última página
    pages.push({ type: 'page', num: totalPages, active: p === totalPages });

    if (path) {
        for (const page of pages) page.path = path;
    }

    return pages;
};

module.exports = { generatePagination };