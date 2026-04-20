const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true }, // Bắt buộc phải có email và không được trùng
    password: { type: String, required: true },
    role: { type: String, default: 'user' }
});

module.exports = mongoose.model('User', userSchema);