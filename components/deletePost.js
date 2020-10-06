'use strict';
const Post = require('../models/post');
const rimraf = require('rimraf');
const fs = require('fs');

/**
 * Elimina un post de la base de datos y todos los archivos relacionados
 * Si es un hilo elimina todos los archivos y respuestas del hilo
 *
 * @param {Object} thread - El post a eliminar
 * @returns {Promise} Promsesa del resultado
 */
const deletePost = post => {
    return new Promise((resolve, reject) => {
        if (post.thread) {
            // Es un post
            // Eliminar post y retornar
            Post.findOneAndRemove({ postId: post.postId, board: post.board }, e => {
                if (e) {
                    reject(e);
                    return;
                }
                if (!post.file) {
                    resolve();
                    return;
                }
                fs.unlinkSync(post.file.url);
                fs.unlinkSync(post.file.thumb);
                resolve();
            });
            return;
        }

        // Es un hilo
        // Eliminar todas las respuestas
        Promise.all(post.replies.map(reply => deletePost(reply)))
            .then(() => {
                // Eliminar OP
                Post.findOneAndRemove({ postId: post.postId, board: post.board }, e => {
                    if (e) {
                        reject(e);
                        return;
                    }
                    rimraf(`data/${post.board}/${post.postId}`, e => {
                        if (e) {
                            reject(e);
                            return;
                        }
                        resolve();
                    });
                });
            })
            .catch(reject);
    });
};

module.exports = deletePost;