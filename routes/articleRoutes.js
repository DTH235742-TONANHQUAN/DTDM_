const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

// Định nghĩa các đường dẫn
router.get('/', articleController.getAllArticles);
router.post('/', articleController.createArticle);
router.get('/:id', articleController.getArticleById);
router.put('/:id', articleController.updateArticle);    
router.delete('/:id', articleController.deleteArticle);

module.exports = router;