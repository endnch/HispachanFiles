/**
 * Hispachan Files
 *
 * Modelo de mongoose para posts
 */
'use strict';
const mongoose = require('mongoose');

module.exports = mongoose.model('Post', {
    admin: Boolean,
    anonId: String,
    anonIdColor: String,
    board: String,
    dado: String,
    date: { type: Date, index: true },
    dice: Boolean,
    file: {
        md5: String,
        name: String,
        resolution: String,
        size: String,
        thumb: String,
        url: String,
    },
    flag: String,
    fortuna: String,
    guest: Boolean,
    lastUpdate: { type: Date, default: Date.now },
    locked: Boolean,
    message: String,
    mod: Boolean,
    op: Boolean,
    posterCountry: String,
    posterCountryName: String,
    posterName: String,
    postId: Number,
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    replyCount: Number,
    sticky: Boolean,
    subject: String,
    thread: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
});