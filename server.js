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

// Chú ý: Chuỗi kết nối DB của ông giữ nguyên
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
// 2. CÁC API XỬ LÝ BÌNH LUẬN TIN TỨC
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
// 4. API DIỄN ĐÀN (FORUM)
// ==================================================
const ForumSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    views: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});
const Forum = mongoose.model('Forum', ForumSchema);

app.get('/api/forums', async (req, res) => {
    try {
        const posts = await Forum.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) { res.status(500).json({ message: "Lỗi tải diễn đàn" }); }
});

app.post('/api/forums', async (req, res) => {
    try {
        const { title, content, author, imageUrl } = req.body;
        const newPost = new Forum({ title, content, author, imageUrl });
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) { res.status(500).json({ message: "Lỗi tạo bài viết diễn đàn" }); }
});

app.delete('/api/forums/:id', async (req, res) => {
    try {
        await Forum.findByIdAndDelete(req.params.id);
        res.json({ message: "Xóa thành công!" });
    } catch (error) { res.status(500).json({ message: "Lỗi xóa" }); }
});

// ==================================================
// 5. API CHI TIẾT & TRẢ LỜI DIỄN ĐÀN (REPLIES)
// ==================================================
const ForumReplySchema = new mongoose.Schema({
    forumId: { type: String, required: true },
    author: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const ForumReply = mongoose.model('ForumReply', ForumReplySchema);

app.get('/api/forums/:id', async (req, res) => {
    try {
        const post = await Forum.findById(req.params.id);
        res.json(post);
    } catch (error) { res.status(500).json({ message: "Lỗi tải bài viết" }); }
});

app.patch('/api/forums/:id/view', async (req, res) => {
    try {
        await Forum.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
        res.json({ message: "OK" });
    } catch (error) { res.status(500).json({ message: "Lỗi" }); }
});

app.put('/api/forums/:id', async (req, res) => {
    try {
        // Lấy thêm title và imageUrl từ form gửi lên
        const { title, content, imageUrl } = req.body; 
        await mongoose.model('Forum').findByIdAndUpdate(req.params.id, { title, content, imageUrl });
        res.json({ message: "Sửa thành công" });
    } catch (error) { res.status(500).json({ message: "Lỗi sửa" }); }
});

app.get('/api/forums/:id/replies', async (req, res) => {
    try {
        const replies = await ForumReply.find({ forumId: req.params.id }).sort({ createdAt: 1 });
        res.json(replies);
    } catch (error) { res.status(500).json({ message: "Lỗi" }); }
});

app.post('/api/forums/:id/replies', async (req, res) => {
    try {
        const newReply = new ForumReply({ forumId: req.params.id, author: req.body.author, content: req.body.content });
        await newReply.save();
        res.status(201).json(newReply);
    } catch (error) { res.status(500).json({ message: "Lỗi" }); }
});

app.put('/api/forum-replies/:id', async (req, res) => {
    try {
        await ForumReply.findByIdAndUpdate(req.params.id, { content: req.body.content });
        res.json({ message: "OK" });
    } catch (error) { res.status(500).json({ message: "Lỗi" }); }
});

app.delete('/api/forum-replies/:id', async (req, res) => {
    try {
        await ForumReply.findByIdAndDelete(req.params.id);
        res.json({ message: "OK" });
    } catch (error) { res.status(500).json({ message: "Lỗi" }); }
});

// ==================================================
// 6. API TẠO DATA ẢO (SEED FORUMS)
// ==================================================
app.get('/api/seed-forums', async (req, res) => {
    try {
        const dummyData = [
            { title: "Cách leo rank LMHT hiệu quả mùa này?", content: "Mọi người cho em xin tip leo rank từ Bạch Kim lên Lục Bảo với ạ. Cảm giác dạo này leo chua quá...", author: "YasuoMain" },
            { title: "TFT Mùa mới: Đội hình nào đang bá đạo nhất?", content: "Như tiêu đề, mình mới chơi lại TFT, thấy bảo đội hình Exodia đang hot, ai có guide cụ thể không?", author: "KỳThủHệTâmLinh" }
            // Tui thu gọn mảng này lại xíu cho code đỡ dài, vì database của ông đã có 20 bài sẵn rồi nên xài tiếp vô tư.
        ];
        await Forum.insertMany(dummyData);
        res.send("<h1 style='color:green; text-align:center; margin-top: 50px;'>✅ XONG! Đã import thành công!</h1>");
    } catch (error) { res.send("Lỗi: " + error.message); }
});