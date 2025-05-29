//[SECTION] Dependencies and Modules
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment');
const { verify } = require('../auth');

//[SECTION] Comment Routes
router.get('/post/:postId', commentController.getCommentsForPost);
router.post('/', verify, commentController.createComment);
router.delete('/:id', verify, commentController.deleteComment);

module.exports = router;