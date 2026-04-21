const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const articleRoutes = require('./routes/articleRoutes');
const authRoutes = require('./routes/authRoutes');

const User = require('./models/User'); 
const Article = require('./models/Article'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(express.static('public'));

const dbURI = 'mongodb://admin:123@ac-xsdlsnf-shard-00-00.mxp7sci.mongodb.net:27017,ac-xsdlsnf-shard-00-01.mxp7sci.mongodb.net:27017,ac-xsdlsnf-shard-00-02.mxp7sci.mongodb.net:27017/EsportNews?ssl=true&replicaSet=atlas-b61hyt-shard-0&authSource=admin&appName=TrangTinEsport';

mongoose.connect(dbURI)
  .then(() => {
    console.log('🎉 Kết nối Database thành công!');
    app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));
  })
  .catch(err => console.log('❌ Lỗi kết nối:', err));

app.use('/api/articles', articleRoutes);
app.use('/api/auth', authRoutes);

// ==================================================
// 1. CÁC API QUẢN LÝ TÀI KHOẢN (ADMIN)
// ==================================================
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (error) { res.status(500).json({ message: "Lỗi lấy danh sách user" }); }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Đã xóa thành công!" });
    } catch (error) { res.status(500).json({ message: "Lỗi khi xóa user" }); }
});

app.patch('/api/users/:id/promote', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { role: 'admin' });
        res.json({ message: "Đã thăng cấp thành công!" });
    } catch (error) { res.status(500).json({ message: "Lỗi khi thăng cấp" }); }
});

// ==================================================
// 2. CÁC API XỬ LÝ BÌNH LUẬN 
// ==================================================
const CommentSchema = new mongoose.Schema({
    articleId: { type: String, required: true },
    username: { type: String, required: true },
    content: { type: String, required: true },
    reported: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});
const Comment = mongoose.model('Comment', CommentSchema);

app.get('/api/comments/:articleId', async (req, res) => {
    try {
        const comments = await Comment.find({ articleId: req.params.articleId }).sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) { res.status(500).json({ message: "Lỗi tải bình luận" }); }
});

app.post('/api/comments/:articleId', async (req, res) => {
    try {
        const { username, content } = req.body;
        const newComment = new Comment({ articleId: req.params.articleId, username, content });
        await newComment.save();
        res.status(201).json(newComment);
    } catch (error) { res.status(500).json({ message: "Lỗi thêm bình luận" }); }
});

app.put('/api/comments/:id', async (req, res) => {
    try {
        await Comment.findByIdAndUpdate(req.params.id, { content: req.body.content });
        res.json({ message: "Sửa thành công!" });
    } catch (error) { res.status(500).json({ message: "Lỗi sửa bình luận" }); }
});

app.delete('/api/comments/:id', async (req, res) => {
    try {
        await Comment.findByIdAndDelete(req.params.id);
        res.json({ message: "Xóa thành công!" });
    } catch (error) { res.status(500).json({ message: "Lỗi xóa bình luận" }); }
});

app.patch('/api/comments/:id/report', async (req, res) => {
    try {
        await Comment.findByIdAndUpdate(req.params.id, { reported: true });
        res.json({ message: "Đã báo cáo bình luận!" });
    } catch (error) { res.status(500).json({ message: "Lỗi báo cáo" }); }
});

app.get('/api/admin/comments/reported', async (req, res) => {
    try {
        const comments = await Comment.find({ reported: true }).sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) { res.status(500).json({ message: "Lỗi tải danh sách báo cáo" }); }
});

app.patch('/api/admin/comments/:id/dismiss', async (req, res) => {
    try {
        await Comment.findByIdAndUpdate(req.params.id, { reported: false });
        res.json({ message: "Đã gỡ báo cáo!" });
    } catch (error) { res.status(500).json({ message: "Lỗi gỡ báo cáo" }); }
});

// ==================================================
// 3. API TĂNG LƯỢT XEM BÀI BÁO 
// ==================================================
app.patch('/api/articles/:id/view', async (req, res) => {
    try {
        await Article.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
        res.json({ message: "Đã tăng view!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi tăng view" });
    }
});

// ==================================================
// 4. PHỤC VỤ GIAO DIỆN FRONTEND CHO RENDER
// ==================================================
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});