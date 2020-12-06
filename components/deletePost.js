'use strict';
const Post = require('../models/post');
const fs = require('fs/promises');

/**
 * Elimina un post de la base de datos y todos los archivos relacionados
 * Si es un hilo elimina todos los archivos y respuestas del hilo
 *
 * @param {Object} thread - El post a eliminar
 * @returns {Promise} Promsesa del resultado
 */

const deletePost = async post => {
    if (post.thread) {
        // Es un post
        // Eliminar post y retornar

        // Eliminar post
        await Post.findOneAndRemove({ postId: post.postId, board: post.board });
        // Eliminar post de arreglo replies
        await Post.updateOne({ _id: post.thread._id }, { $pull: { replies: post._id } });

        // Eliminar archivos
        if (post.file) {
            await fs.unlink(post.file.url);
            await fs.unlink(post.file.thumb);
        }

        return;
    }
    // Es un hilo
    // Eliminar todas las respuestas
    await Promise.all(post.replies.map(reply => deletePost(reply)));
    // Eliminar OP
    await Post.findOneAndRemove({ postId: post.postId, board: post.board });
    // Eliminar carpeta
    await fs.rmdir(`data/${post.board}/${post.postId}`, { recursive: true });
};

module.exports = deletePost;