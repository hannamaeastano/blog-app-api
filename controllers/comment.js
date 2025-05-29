//[SECTION] Dependencies and Modules
const Comment = require('../models/comment');
const Post = require('../models/post');
const auth = require('../auth');

//[SECTION] Create Comment
module.exports.createComment = (req, res) => {
    if (!req.body.content || !req.body.postId) {
        return res.status(400).send({ message: 'Content and post ID are required' });
    } else {
        return Post.findById(req.body.postId)
            .then((post) => {
                if (!post) {
                    return res.status(404).send({ message: 'Post not found' });
                } else {
                    const newComment = new Comment({
                        content: req.body.content,
                        post: req.body.postId,
                        author: req.user.id
                    });

                    return newComment.save()
                        .then((result) => {
                            // Add the comment to the post's comments array
                            post.comments.push(result._id);
                            return post.save();
                        })
                        .then(() => res.status(201).send({ 
                            message: 'Comment added successfully', 
                            comment: newComment 
                        }))
                        .catch((error) => auth.errorHandler(error, req, res));
                }
            })
            .catch((error) => auth.errorHandler(error, req, res));
    }
};

//[SECTION] Get Comments for Post
module.exports.getCommentsForPost = (req, res) => {
    return Comment.find({ post: req.params.postId })
        .populate('author', 'username')
        .sort({ createdAt: -1 })
        .then((comments) => res.status(200).send(comments))
        .catch((error) => auth.errorHandler(error, req, res));
};

//[SECTION] Delete Comment - Updated Version
module.exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        
        if (!comment) {
            return res.status(404).send({ message: 'Comment not found' });
        }

        // Check authorization
        if (comment.author.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).send({ message: 'Not authorized to delete this comment' });
        }

        // Use deleteOne() instead of remove()
        await Comment.deleteOne({ _id: req.params.id });
        
        return res.status(200).send({ 
            message: 'Comment deleted successfully',
            deletedCommentId: req.params.id
        });

    } catch (error) {
        console.error('Delete comment error:', error);
        return res.status(500).send({ 
            message: 'Server error while deleting comment',
            error: error.message
        });
    }
};