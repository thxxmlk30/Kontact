const express = require('express');
const router = express.Router();
const post = require('../controllers/postController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', isAuthenticated, post.getFeed);
router.post('/', isAuthenticated, upload.single('image'), post.create);
router.get('/:id', isAuthenticated, post.getDetail);
router.put('/:id', isAuthenticated, post.update);
router.delete('/:id', isAuthenticated, post.delete);

module.exports = router;
