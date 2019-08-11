/**
 * Hispachan Files
 * 
 * Modelo de mongoose para hilos
 */
'use strict';
const mongoose = require('mongoose');

module.exports = mongoose.model('Thread', {
    board: String,
    subject: String,
    postId: Number,
    posterName: String,
    posterCountry: String,
    posterCountryName: String,
    flag: String,
    date: Date,
    lastUpdate: { type: Date, default: Date.now },
    dado: String,
    fortuna: String,
    message: String,
    file: {
        url: String,
        size: String,
        resolution: String,
        name: String,
        thumb: String,
        md5: String
    },
    replyCount: Number,
    replies: [{
        postId: Number,
        posterName: String,
        posterCountry: String,
        posterCountryName: String,
        flag: String,
        date: Date,
        dado: String,
        fortuna: String,
        message: String,
        file: {
            url: String,
            size: String,
            resolution: String,
            name: String,
            thumb: String,
            md5: String
        },
        op: Boolean,
        admin: Boolean,
        mod: Boolean,
        anonId: String,
        anonIdColor: String,
    }],
    admin: Boolean,
    mod: Boolean,
    locked: Boolean,
    sticky: Boolean,
    dice: Boolean,
    anonId: String,
    anonIdColor: String
});