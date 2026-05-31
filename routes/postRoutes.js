const express = require('express');
const router  = express.Router();
const post    = require('../controllers/postController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const upload  = require('../middleware/uploadMiddleware');

router.get('/',              isAuthenticated, post.getFeed);
router.get('/feed',          isAuthenticated, post.getFeed);
router.get('/posts/create',  isAuthenticated, post.showCreate);
router.post('/posts',        isAuthenticated, upload.single('image'), post.create);
router.get('/posts/:id',     isAuthenticated, post.getDetail);
router.post('/posts/:id',    isAuthenticated, post.update);
router.post('/posts/:id/delete', isAuthenticated, post.delete);

module.exports = router;