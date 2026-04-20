const Article = require('../models/Article');

// Lấy danh sách bài báo
exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tải bài viết', error });
  }
};

// Đăng bài báo mới
exports.createArticle = async (req, res) => {
  try {
    const newArticle = new Article(req.body);
    const savedArticle = await newArticle.save();
    res.status(201).json({ message: 'Đã đăng bài thành công!', data: savedArticle });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi đăng bài', error });
  }
};
// Lấy chi tiết 1 bài báo dựa vào ID
exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tải chi tiết bài viết', error });
  }
};
// HÀM CẬP NHẬT (SỬA) BÀI VIẾT
exports.updateArticle = async (req, res) => {
    try {
        // Tìm bài viết theo ID và cập nhật nội dung mới
        const updatedArticle = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedArticle) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        res.status(200).json({ message: 'Cập nhật thành công!', article: updatedArticle });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật bài viết', error });
    }
};

// HÀM XÓA BÀI VIẾT
exports.deleteArticle = async (req, res) => {
    try {
        const deletedArticle = await Article.findByIdAndDelete(req.params.id);
        if (!deletedArticle) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        res.status(200).json({ message: 'Đã xóa bài viết thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa bài viết', error });
    }
};