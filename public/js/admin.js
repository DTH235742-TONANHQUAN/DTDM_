// 1. BẢO MẬT
function checkSecurity() {
    const userStr = localStorage.getItem('esport_user');
    if (!userStr || JSON.parse(userStr).role !== 'admin') {
        alert("Bạn không có quyền!"); window.location.href = 'index.html';
    }
}
checkSecurity();

// 2. CHUYỂN TAB
function switchTab(tabId, btnElement) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btnElement.classList.add('active');
}

// === QUẢN LÝ BÀI VIẾT ===
let adminArticles = [];
async function fetchAdminArticles() {
    const res = await fetch('http://localhost:3000/api/articles');
    adminArticles = await res.json();
    renderAdminTable(adminArticles);
}

function renderAdminTable(data) {
    const tbody = document.getElementById('adminTableBody');
    tbody.innerHTML = '';
    data.forEach(a => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${a.title}</strong></td>
                <td><span style="background:#5d4369; color:white; padding:3px 8px; border-radius:4px;">${a.category}</span></td>
                <td>${new Date(a.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editArticle('${a._id}')">Sửa</button>
                    <button class="action-btn delete-btn" onclick="deleteArticle('${a._id}')">Xóa</button>
                </td>
            </tr>`;
    });
}

document.getElementById('adminSearch').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = adminArticles.filter(a => a.title.toLowerCase().includes(query));
    renderAdminTable(filtered);
});

async function deleteArticle(id) {
    if(!confirm("Xóa bài viết này?")) return;
    await fetch(`http://localhost:3000/api/articles/${id}`, { method: 'DELETE' });
    fetchAdminArticles();
}

function editArticle(id) {
    const a = adminArticles.find(item => item._id === id);
    document.getElementById('editArticleId').value = a._id;
    document.getElementById('postTitle').value = a.title;
    document.getElementById('postCategory').value = a.category;
    document.getElementById('postImage').value = a.imageUrl;
    document.getElementById('postSummary').value = a.summary;
    document.getElementById('postContent').value = a.content;
    document.getElementById('postFormTitle').innerText = "Cập nhật bài viết";
    document.getElementById('submitPostBtn').innerText = "LƯU THAY ĐỔI";
    document.getElementById('cancelEditBtn').style.display = "block";
    switchTab('post-tab', document.querySelectorAll('.sidebar-btn')[1]);
}

function cancelEdit() {
    document.getElementById('createPostForm').reset();
    document.getElementById('editArticleId').value = '';
    document.getElementById('postFormTitle').innerText = "Đăng bài viết mới";
    document.getElementById('submitPostBtn').innerText = "ĐĂNG BÀI";
    document.getElementById('cancelEditBtn').style.display = "none";
}

document.getElementById('createPostForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editArticleId').value;
    const data = {
        title: document.getElementById('postTitle').value,
        category: document.getElementById('postCategory').value,
        imageUrl: document.getElementById('postImage').value,
        summary: document.getElementById('postSummary').value,
        content: document.getElementById('postContent').value
    };
    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:3000/api/articles/${id}` : 'http://localhost:3000/api/articles';
    await fetch(url, {
        method: method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    alert("Thành công!"); cancelEdit(); fetchAdminArticles();
    switchTab('manage-tab', document.querySelectorAll('.sidebar-btn')[0]);
});

// === QUẢN LÝ TÀI KHOẢN ===
async function fetchAllUsers() {
    const res = await fetch('http://localhost:3000/api/users');
    const users = await res.json();
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = '';
    users.forEach(u => {
        const isUser = u.role !== 'admin';
        tbody.innerHTML += `
            <tr>
                <td><strong>${u.username}</strong></td>
                <td>${u.email}</td>
                <td><span style="color:${isUser?'#aaa':'#5d4369'}; font-weight:bold;">${u.role==='admin'?'Admin':'User'}</span></td>
                <td>
                    <div style="display:flex; gap:5px;">
                        ${isUser ? `<button onclick="promoteToAdmin('${u._id}')" style="background:#28a745; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer;">Thăng cấp</button>` : ''}
                        <button onclick="deleteUser('${u._id}')" style="background:#ff4655; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer;">Xóa</button>
                    </div>
                </td>
            </tr>`;
    });
}

async function deleteUser(id) {
    if(confirm("Xóa tài khoản này?")) {
        await fetch(`http://localhost:3000/api/users/${id}`, { method: 'DELETE' });
        fetchAllUsers();
    }
}

async function promoteToAdmin(id) {
    if(confirm("Thăng cấp lên Admin?")) {
        await fetch(`http://localhost:3000/api/users/${id}/promote`, { method: 'PATCH' });
        fetchAllUsers();
    }
}

// === QUẢN LÝ BÁO CÁO BÌNH LUẬN ===
async function fetchReportedComments() {
    try {
        const res = await fetch('http://localhost:3000/api/admin/comments/reported');
        const comments = await res.json();
        const tbody = document.getElementById('reportTableBody');
        tbody.innerHTML = '';

        if (comments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #888;">🎉 Không có báo cáo vi phạm nào!</td></tr>';
            return;
        }

        comments.forEach(cmt => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>${cmt.username}</strong></td>
                    <td style="color: #f39c12; font-style: italic;">"${cmt.content}"</td>
                    <td>
                        <div style="display:flex; gap:5px;">
                            <button onclick="deleteReportedComment('${cmt._id}')" style="background:#ff4655; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer;">🗑️ Xóa BL</button>
                            <button onclick="dismissReport('${cmt._id}')" style="background:#28a745; color:white; border:none; padding:5px 8px; border-radius:4px; cursor:pointer;">✅ Bỏ qua</button>
                        </div>
                    </td>
                </tr>`;
        });
    } catch (error) { console.error("Lỗi tải báo cáo"); }
}

async function deleteReportedComment(id) {
    if(confirm("Xóa vĩnh viễn bình luận vi phạm này?")) {
        await fetch(`http://localhost:3000/api/comments/${id}`, { method: 'DELETE' });
        fetchReportedComments();
    }
}

async function dismissReport(id) {
    if(confirm("Bình luận này bình thường, gỡ mác báo cáo?")) {
        await fetch(`http://localhost:3000/api/admin/comments/${id}/dismiss`, { method: 'PATCH' });
        fetchReportedComments();
    }
}

// TẠO ADMIN MỚI
document.getElementById('createAdminForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('adminUser').value;
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPass').value;
    const res = await fetch('http://localhost:3000/api/auth/create-admin', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    });
    const result = await res.json();
    alert(result.message);
    document.getElementById('createAdminForm').reset();
    fetchAllUsers();
});

// Khởi tạo
fetchAdminArticles();
fetchAllUsers();
fetchReportedComments(); // Tải danh sách báo cáo