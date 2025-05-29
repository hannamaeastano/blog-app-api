//[SECTION] Dependencies and Modules
const Post = require('../models/post');
const auth = require('../auth');

//[SECTION] Create Post
module.exports.createPost = (req, res) => {
    if (!req.body.title || !req.body.content) {
        return res.status(400).send({ message: 'Title and content are required' });
    } else {
        const newPost = new Post({
            title: req.body.title,
            content: req.body.content,
            author: req.user.id
        });

        return newPost.save()
        .then(post => 
          Post.findById(post._id).populate('author', 'username')
        )
        .then(populatedPost => res.status(201).send({
          message: 'Post created successfully',
          post: populatedPost
        }))
        .catch(error => auth.errorHandler(error, req, res));
      
    }
};

//[SECTION] Get All Posts
module.exports.getAllPosts = (req, res) => {
    return Post.find()
        .populate('author', 'username')
        .sort({ createdAt: -1 })
        .then((posts) => res.status(200).send(posts))
        .catch((error) => auth.errorHandler(error, req, res));
};

//[SECTION] Get Single Post
// In your post controller
module.exports.getPost = (req, res) => {
    Post.findById(req.params.id)
        .populate('author', 'username')
        .populate({
            path: 'comments',
            populate: {
                path: 'author',
                select: 'username'
            }
        })
        .then(post => {
            if (!post) {
                return res.status(404).send({ message: 'Post not found' });
            }
            res.status(200).send(post);
        })
        .catch(error => auth.errorHandler(error, req, res));
};

//[SECTION] Update Post
module.exports.updatePost = (req, res) => {
    return Post.findById(req.params.id)
        .then((post) => {
            if (!post) {
                return res.status(404).send({ message: 'Post not found' });
            } else if (post.author.toString() !== req.user.id && !req.user.isAdmin) {
                return res.status(403).send({ message: 'Not authorized to update this post' });
            } else {
                post.title = req.body.title || post.title;
                post.content = req.body.content || post.content;
                post.updatedAt = Date.now();

                return post.save()
                    .then((result) => res.status(200).send({ 
                        message: 'Post updated successfully', 
                        post: result 
                    }))
                    .catch((error) => auth.errorHandler(error, req, res));
            }
        })
        .catch((error) => auth.errorHandler(error, req, res));
};

//[SECTION] Delete Post
module.exports.deletePost = async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      if (post.author.toString() !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Not authorized to delete this post' });
      }
  
      await post.deleteOne();
  
      return res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Error deleting post:', error);
      // handle error response
      return res.status(500).json({ message: 'Server error while deleting post' });
    }
  };
  