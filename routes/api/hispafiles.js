'use strict';

const express = require('express');
const router = express.Router();
const cors = require('cors');

const Post = require('../../models/post');
const { allowList } = require('../../boards');

router.use(cors());

router.get('/ui-search/:q', async (req, res) => {
    const q = req.params.q;

    const query = {
        thread: null,
        $or: [
            { subject: { $regex: q, $options: 'i' } },
            { message: { $regex: q, $options: 'i' } },
        ],
    };

    const threads = await Post.find(query)
        .limit(4)
        .sort('-date');

    const totalResults = await Post.countDocuments(query);

    const results = threads.map(thread => ({
        description: thread.message.substr(0, 120),
        url: `/${thread.board}/res/${thread.postId}`,
        title: thread.subject,
        image: thread.file && '/' + thread.file.thumb,
    }));

    res.json({
        totalResults,
        results,
    });
});

router.get('/search/:q/:p?', async (req, res) => {
    const q = req.params.q;
    const p = parseInt(req.params.p) || 1;

    const query = {
        thread: null,
        $or: [
            { subject: { $regex: q, $options: 'i' } },
            { message: { $regex: q, $options: 'i' } },
        ],
    };

    const threads = await Post.find(query)
        .skip((p - 1) * 10)
        .limit(10)
        .sort('-date')
        .select('-_id -__v -replies');

    const num = await Post.countDocuments(query);
    const totalPages = Math.floor(num / 10) + (num % 10 ? 1 : 0);

    res.json({
        totalPages,
        threads,
    });
});

router.get('/:board/:p?', async (req, res) => {
    const board = req.params.board;

    if (!allowList.includes(board)) {
        res.json([]);
        return;
    }

    const query = Post.find({ thread: null });

    if (board !== 'all') {
        query.where('board').equals(board);
    }

    const p = parseInt(req.params.p) || 1;
    const threads = await query
        .skip((p - 1) * 10)
        .limit(10)
        .sort('-date')
        .select('-_id -__v -replies');

    const num = board === 'all'
        ? await Post.countDocuments({ thread: null })
        : await Post.countDocuments({ board });
    const totalPages = Math.floor(num / 10) + (num % 10 ? 1 : 0);

    res.json({
        totalPages,
        threads,
    });
});

router.get('/:board/res/:th', async (req, res) => {
    const threadId = req.params.th.split('.')[0];
    const board = req.params.board;

    if (!allowList.includes(board)) {
        res.json({});
        return;
    }

    const thread = await Post.findOne()
        .where('board').equals(board)
        .where('postId').equals(threadId)
        .populate('replies', '-_id -__v -replies')
        .select('-_id -__v');

    if (!thread) {
        res.json({});
        return;
    }

    res.json(thread);
});

module.exports = router;