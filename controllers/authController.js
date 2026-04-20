const User = require('../models/User');
const bcrypt = require('bcryptjs');

// 1. ĐĂNG KÝ BÌNH THƯỜNG (Từ trang dangky.html)
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body; 
        
        // KHÓA CỬA SAU: Bất kỳ ai đăng ký ở ngoài cũng chỉ là 'user'
        const role = 'user'; 
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new User({ username, email, password: hashedPassword, role });
        await newUser.save();
        res.status(201).json({ message: 'Đăng ký thành công!', user: { username, role } });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: 'Tên đăng nhập hoặc Email đã tồn tại!' });
        res.status(500).json({ message: 'Lỗi hệ thống khi đăng ký' });
    }
};

// 2. TẠO ADMIN (Chỉ gọi từ trang admin.html)
exports.createAdmin = async (req, res) => {
    try {
        const { username, email, password } = req.body; 
        
        // Mặc định gán luôn quyền 'admin'
        const role = 'admin'; 
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new User({ username, email, password: hashedPassword, role });
        await newUser.save();
        res.status(201).json({ message: 'Tạo tài khoản Admin thành công!', user: { username, role } });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: 'Tên đăng nhập hoặc Email đã tồn tại!' });
        res.status(500).json({ message: 'Lỗi hệ thống khi tạo admin' });
    }
};

// 3. ĐĂNG NHẬP (Giữ nguyên)
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        if (!user) return res.status(401).json({ message: 'Sai tên tài khoản hoặc mật khẩu!' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            res.status(200).json({ message: 'Đăng nhập thành công', user: { username: user.username, role: user.role } });
        } else {
            res.status(401).json({ message: 'Sai tên tài khoản hoặc mật khẩu!' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi hệ thống khi đăng nhập' });
    }
};