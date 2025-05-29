//[SECTION] Dependencies and Modules
const express = require('express');
const router = express.Router();
const postController = require('../controllers/post');
const { verify } = require('../auth');

//[SECTION] Post Routes
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPost);
router.post('/', verify, postController.createPost);
router.put('/:id', verify, postController.updatePost);
router.delete('/:id', verify, postController.deletePost);

module.exports = router;