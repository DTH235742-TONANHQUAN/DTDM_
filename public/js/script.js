let allArticles = [];

// ==========================================
// 1. MENU VÀ GIAO DIỆN CƠ BẢN
// ==========================================
window.toggleMainMenu = function(e) {
    e.stopPropagation();
    const menu = document.getElementById('mainMenu');
    if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
};
window.toggleUserMenu = function(e) {
    e.stopPropagation();
    const menu = document.getElementById('userMenuDropdown');
    if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
};
document.addEventListener('click', function() {
    const mainMenu = document.getElementById('mainMenu');
    const userMenu = document.getElementById('userMenuDropdown');
    if (mainMenu) mainMenu.style.display = 'none';
    if (userMenu) userMenu.style.display = 'none';
});

// ==========================================
// 2. XỬ LÝ ĐĂNG NHẬP / TÀI KHOẢN
// ==========================================
function checkAuth() {
    const authSection = document.getElementById('auth-section');
    if (!authSection) return;
    const userStr = localStorage.getItem('esport_user');
    if (userStr) {
        const user = JSON.parse(userStr);
        authSection.innerHTML = `
            <span class="user-greeting">Chào, ${user.username}</span>
            <div class="user-menu-container">
                <button class="hamburger-btn" onclick="toggleUserMenu(event)">☰</button>
                <ul class="user-dropdown" id="userMenuDropdown" style="display: none;">
                    <li><a href="taikhoan.html">👤 Hồ sơ của tôi</a></li>
                    ${user.role === 'admin' ? `<li><a href="admin.html">⚙️ Trang Admin</a></li>` : ''}
                    <li><a href="#" onclick="logout()">🚪 Đăng xuất</a></li>
                </ul>
            </div>
        `;
    } else {
        authSection.innerHTML = `<a href="dangnhap.html" class="auth-btn">Đăng nhập</a> <a href="dangky.html" class="auth-btn">Đăng ký</a>`;
    }
}

function logout() {
    localStorage.removeItem('esport_user');
    checkAuth(); 
    if(window.location.pathname.includes('taikhoan.html') || window.location.pathname.includes('admin.html')) window.location.href = 'index.html';
}

// ==========================================
// 3. TIN TỨC & LỌC TÌM KIẾM
// ==========================================
async function fetchArticles() {
    try {
        const response = await fetch('/api/articles');
        allArticles = await response.json();
        const sortedByDate = [...allArticles].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        renderHeroBanner(sortedByDate.slice(0, 4));
        const isHomePage = document.getElementById('loadMoreContainer') !== null;
        renderArticles(isHomePage ? sortedByDate.slice(0, 6) : sortedByDate);
        renderMostRead(allArticles);
    } catch (error) {
        const container = document.getElementById('news-container');
        if(container) container.innerHTML = '<h3 style="color:#ff4655; width:100%; text-align:center;">❌ Lỗi Server!</h3>';
    }
}
function renderHeroBanner(top4Articles) {
    const bannerContainer = document.getElementById('heroBannerContainer');
    if (!bannerContainer || top4Articles.length === 0) return;
    const mainA = top4Articles[0];
    let sideHtml = '';
    top4Articles.slice(1).forEach(a => {
        sideHtml += `<div class="hero-side-item" onclick="window.location.href='doctin.html?id=${a._id}'"><img src="${a.imageUrl}" onerror="this.src='https://placehold.co/400x200/5d4369/FFF?text=No+Image'"><div class="hero-side-overlay"><span class="hero-tag">${a.category}</span><h3>${a.title}</h3></div></div>`;
    });
    bannerContainer.innerHTML = `<div class="hero-banner"><div class="hero-main" onclick="window.location.href='doctin.html?id=${mainA._id}'"><img src="${mainA.imageUrl}" onerror="this.src='https://placehold.co/800x400/5d4369/FFF?text=No+Image'"><div class="hero-overlay"><span class="hero-tag">${mainA.category}</span><h2>${mainA.title}</h2></div></div><div class="hero-side-list">${sideHtml}</div></div><hr style="border: 0; border-top: 2px solid #2a2e35; margin-bottom: 30px;">`;
}
function renderArticles(articlesToRender) {
    const container = document.getElementById('news-container');
    if (!container) return;
    container.innerHTML = articlesToRender.length === 0 ? '<h3 style="width:100%; color:#888;">Không tìm thấy bài viết.</h3>' : articlesToRender.map(a => `<div class="article-card" onclick="window.location.href='doctin.html?id=${a._id}'"><div class="article-img-wrapper"><img src="${a.imageUrl}" onerror="this.src='https://placehold.co/400x200/5d4369/FFF?text=No+Image'"></div><div class="article-content"><span class="category-tag">${a.category}</span><h2 class="article-title">${a.title}</h2><p class="article-date">🕒 ${new Date(a.createdAt).toLocaleString('vi-VN')}</p></div></div>`).join('');
}
function renderMostRead(articles) {
    const mostReadList = document.getElementById('mostReadList');
    if (mostReadList) mostReadList.innerHTML = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map((a, i) => `<li><span class="rank">${i + 1}</span><a href="doctin.html?id=${a._id}">${a.title}</a></li>`).join('');
}

let currentCategory = 'Tất cả', currentSearchText = '';
function applyFiltersAndSearch() {
    let filtered = allArticles;
    if (currentCategory !== 'Tất cả') filtered = filtered.filter(a => a.category === currentCategory);
    if (currentSearchText.trim() !== '') filtered = filtered.filter(a => a.title.toLowerCase().includes(currentSearchText.toLowerCase()));
    const isHomePage = document.getElementById('loadMoreContainer') !== null;
    renderArticles(isHomePage ? filtered.slice(0, 6) : filtered);
}
if (document.getElementById('homeSearchInput')) document.getElementById('homeSearchInput').addEventListener('input', e => { currentSearchText = e.target.value; applyFiltersAndSearch(); });
document.querySelectorAll('.filter-btn').forEach(btn => btn.addEventListener('click', function() { document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active')); this.classList.add('active'); currentCategory = this.getAttribute('data-category'); applyFiltersAndSearch(); }));

// ==========================================
// 4. CHI TIẾT BÀI VIẾT (TIN TỨC) VÀ BÌNH LUẬN
// ==========================================
async function loadArticleDetail() {
    const id = new URLSearchParams(window.location.search).get('id');
    const container = document.getElementById('articleDetail');
    if (!id || !container) return;
    try {
        fetch(`/api/articles/${id}/view`, { method: 'PATCH' }).catch(e=>e);
        const article = await (await fetch(`/api/articles/${id}`)).json();
        container.innerHTML = `<div style="text-align: center;"><span class="category-tag">${article.category}</span><h1 class="detail-title">${article.title}</h1></div><img src="${article.imageUrl}" class="detail-cover" onerror="this.src='https://placehold.co/1000x500/5d4369/FFF?text=No+Cover'"><div class="detail-content"><p><strong><em>${article.summary}</em></strong></p><div>${article.content}</div></div>`;
        loadComments(id);
    } catch { container.innerHTML = `<h2 style="color:#ff4655;">❌ Lỗi: Không thể tải!</h2>`; }
}

async function loadComments(articleId) {
    const list = document.getElementById('commentsList'), form = document.getElementById('commentFormContainer');
    if (!list) return;
    const user = JSON.parse(localStorage.getItem('esport_user'));
    form.innerHTML = user ? `<div style="background:#1a1e24; padding:15px; border-radius:8px;"><p>Bình luận với tên: <b>${user.username}</b></p><textarea id="commentInput" rows="3" style="width:100%; padding:10px;"></textarea><button onclick="submitComment('${articleId}', '${user.username}')" class="submit-btn">Gửi</button></div>` : `<a href="dangnhap.html" class="submit-btn">Đăng nhập để bình luận</a>`;
    const comments = await (await fetch(`/api/comments/${articleId}`)).json();
    document.getElementById('commentCount').innerText = comments.length;
    list.innerHTML = comments.map(c => `<div style="background:#1a1e24; padding:15px; border-left:4px solid #5d4369; margin-bottom:10px;"><b>${c.username}</b>: ${c.content}</div>`).join('');
}
async function submitComment(id, user) {
    const content = document.getElementById('commentInput').value.trim();
    if(content) { await fetch(`/api/comments/${id}`, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({username: user, content})}); document.getElementById('commentInput').value = ''; loadComments(id); }
}

// ==========================================
// 5. DIỄN ĐÀN (FORUM) - TRANG DANH SÁCH
// ==========================================
async function fetchForumPosts() {
    const homeList = document.getElementById('homeForumList'), fullList = document.getElementById('fullForumList');
    if (!homeList && !fullList) return;
    try {
        const posts = await (await fetch('/api/forums')).json();
        const displayPosts = homeList ? posts.slice(0, 6) : posts;
        let html = displayPosts.map(p => `<div class="forum-item">${p.imageUrl ? `<img src="${p.imageUrl}" class="forum-thumbnail">` : '<div class="forum-thumbnail" style="display:flex; justify-content:center; align-items:center; font-size:2rem;">💬</div>'}<div class="forum-info"><span class="forum-title" style="cursor:pointer;" onclick="window.location.href='chitietdiandan.html?id=${p._id}'">${p.title}</span><div class="forum-meta">👤 ${p.author} • 👁️ ${p.views || 0} xem</div></div></div>`).join('');
        if (homeList) homeList.innerHTML = html || '<p>Chưa có bài viết.</p>';
        if (fullList) fullList.innerHTML = html || '<p>Chưa có bài viết.</p>';
    } catch (err) { console.log(err); }
}

function openForumModal() {
    if (!localStorage.getItem('esport_user')) return alert('Bạn cần đăng nhập để đăng câu hỏi!');
    document.getElementById('forumModal').style.display = 'flex';
}
function closeForumModal() { document.getElementById('forumModal').style.display = 'none'; }
async function submitForumPost() {
    const title = document.getElementById('forumTitle').value.trim(), content = document.getElementById('forumContent').value.trim(), imageUrl = document.getElementById('forumImage').value.trim();
    const user = JSON.parse(localStorage.getItem('esport_user'));
    if (!title || !content) return alert("Vui lòng nhập đủ Tiêu đề và Nội dung!");
    try {
        if ((await fetch('/api/forums', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content, imageUrl, author: user.username }) })).ok) {
            closeForumModal(); fetchForumPosts(); alert("Đăng bài thành công!");
        }
    } catch (err) { alert("Lỗi đăng bài!"); }
}

// ==========================================
// 6. CHI TIẾT VÀ TRẢ LỜI DIỄN ĐÀN (CHITIETDIANDAN)
// ==========================================
let currentForumPost = null; 

async function loadForumDetail() {
    const id = new URLSearchParams(window.location.search).get('id');
    const container = document.getElementById('forumDetailContent');
    if (!id || !container) return;
    try {
        fetch(`/api/forums/${id}/view`, { method: 'PATCH' }).catch(e=>e);
        const post = await (await fetch(`/api/forums/${id}`)).json();
        currentForumPost = post; 
        const user = JSON.parse(localStorage.getItem('esport_user'));
        
        let actionHtml = ''; 
        if (user && (user.username === post.author || user.role === 'admin')) {
            actionHtml = `<div style="margin-top: 20px;">
                <button onclick="openEditForumModal()" style="background:#f39c12; border:none; padding:8px 15px; border-radius:5px; color:#fff; cursor:pointer; margin-right:10px;">✏️ Sửa nội dung</button>
                <button onclick="deleteForumPost('${post._id}')" style="background:#ff4655; border:none; padding:8px 15px; border-radius:5px; color:#fff; cursor:pointer;">🗑️ Xóa bài</button>
            </div>`;
        }

        container.innerHTML = `<div style="background: #1a1e24; padding: 30px; border-radius: 12px; border: 1px solid #2a2e35;"><h1 style="color:#fff; font-size:2rem; margin-bottom:10px;">${post.title}</h1><div style="color:#888; margin-bottom:25px;">👤 <b>${post.author}</b> • 🕒 ${new Date(post.createdAt).toLocaleString('vi-VN')} • 👁️ ${post.views + 1} lượt xem</div><div style="color:#ece8e1; font-size:1.1rem; line-height:1.8; white-space:pre-wrap;">${post.content}</div>${post.imageUrl ? `<img src="${post.imageUrl}" style="max-width:100%; border-radius:8px; margin-top:20px;">` : ''}${actionHtml}</div>`;
        loadForumReplies(id);
    } catch { container.innerHTML = `<h2 style="color:#ff4655; text-align:center;">❌ Lỗi: Bài viết không tồn tại hoặc đã bị xóa!</h2>`; }
}

async function deleteForumPost(id) {
    if(confirm("Xóa vĩnh viễn bài đăng này?")) {
        await fetch(`/api/forums/${id}`, { method: 'DELETE' });
        window.location.href = 'diandan.html';
    }
}

function openEditForumModal() {
    if(!currentForumPost) return;
    document.getElementById('editForumId').value = currentForumPost._id;
    document.getElementById('editForumTitle').value = currentForumPost.title;
    document.getElementById('editForumImage').value = currentForumPost.imageUrl || '';
    document.getElementById('editForumContent').value = currentForumPost.content;
    document.getElementById('editForumModal').style.display = 'flex';
}
function closeEditForumModal() { document.getElementById('editForumModal').style.display = 'none'; }
async function submitEditForumPost() {
    const id = document.getElementById('editForumId').value, title = document.getElementById('editForumTitle').value.trim(), imageUrl = document.getElementById('editForumImage').value.trim(), content = document.getElementById('editForumContent').value.trim();
    if (!title || !content) return alert("Vui lòng nhập đủ!");
    try {
        if((await fetch(`/api/forums/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ title, imageUrl, content }) })).ok) {
            alert("Cập nhật thành công!"); closeEditForumModal(); loadForumDetail();
        }
    } catch(e) { alert("Lỗi khi sửa!"); }
}

async function loadForumReplies(forumId) {
    const list = document.getElementById('repliesList'), form = document.getElementById('replyFormContainer');
    if (!list) return;
    const user = JSON.parse(localStorage.getItem('esport_user'));
    
    form.innerHTML = user ? `<div style="background:#1a1e24; padding:15px; border-radius:8px; border: 1px solid #2a2e35;"><textarea id="replyInput" rows="3" style="width:100%; padding:12px; background:#111418; color:white; border:1px solid #333; border-radius:5px; margin-bottom:10px;" placeholder="Nhập câu trả lời của bạn..."></textarea><div style="text-align:right;"><button onclick="submitForumReply('${forumId}', '${user.username}')" class="submit-btn" style="width:auto; padding:10px 20px;">Gửi Trả Lời 🚀</button></div></div>` : `<div style="text-align:center; padding:20px;"><a href="dangnhap.html" class="auth-btn">Đăng nhập để tham gia thảo luận</a></div>`;
    
    const replies = await (await fetch(`/api/forums/${forumId}/replies`)).json();
    document.getElementById('replyCount').innerText = replies.length;
    
    list.innerHTML = replies.map(r => {
        let actionBtn = '';
        if (user && (user.username === r.author || user.role === 'admin')) {
            actionBtn = `<button onclick="editReply('${r._id}', \`${r.content}\`, '${forumId}')" style="background:none; border:none; color:#f39c12; cursor:pointer;">✏️ Sửa</button> <button onclick="deleteReply('${r._id}', '${forumId}')" style="background:none; border:none; color:#ff4655; cursor:pointer; margin-left:10px;">🗑️ Xóa</button>`;
        }
        return `<div style="background:#1a1e24; padding:15px; border-radius:8px; border:1px solid #2a2e35; border-left:4px solid #aaa;"><div style="display:flex; justify-content:space-between; margin-bottom:10px;"><div><b style="color:#fff;">👤 ${r.author}</b> <span style="color:#888; font-size:0.85rem; margin-left:10px;">🕒 ${new Date(r.createdAt).toLocaleString('vi-VN')}</span></div><div>${actionBtn}</div></div><p style="color:#ece8e1; white-space:pre-wrap;">${r.content}</p></div>`;
    }).join('');
}

async function submitForumReply(forumId, author) {
    const content = document.getElementById('replyInput').value.trim();
    if(content) {
        await fetch(`/api/forums/${forumId}/replies`, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({author, content}) });
        loadForumReplies(forumId);
    }
}
async function editReply(id, oldContent, forumId) {
    const newContent = prompt("Sửa câu trả lời:", oldContent);
    if(newContent && newContent !== oldContent) {
        await fetch(`/api/forum-replies/${id}`, { method: 'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({content: newContent}) });
        loadForumReplies(forumId);
    }
}
async function deleteReply(id, forumId) {
    if(confirm("Xóa câu trả lời này?")) {
        await fetch(`/api/forum-replies/${id}`, { method: 'DELETE' });
        loadForumReplies(forumId);
    }
}

// ==========================================
// 7. BẢN ĐỒ (MAP) TÍCH HỢP BÊN NGOÀI
// ==========================================
// Hàm tự động tải thư viện Leaflet nếu chưa có
function loadMapLibrary() {
    return new Promise((resolve) => {
        if (document.getElementById('leaflet-css')) return resolve();
        
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve();
        document.head.appendChild(script);
    });
}

// Khởi tạo bản đồ sau khi đã có thư viện
async function initMap() {
    const mapElement = document.getElementById('footer-map');
    if (!mapElement) return;

    await loadMapLibrary(); // Tải CSS và JS

    // Tọa độ Khu Sinh viên Công nghệ, TP. Long Xuyên
    const lat = 10.3708; 
    const lng = 105.4312;

    const map = L.map('footer-map').setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    L.marker([lat, lng]).addTo(map)
        .bindPopup('<b style="color:#5d4369;">Trụ sở Q-Esport</b><br>Khu SV Công nghệ, TP. Long Xuyên')
        .openPopup();
}

// ==========================================
// 8. KHỞI TẠO TRANG
// ==========================================
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const hRes = await fetch('components/header.html');
        const fRes = await fetch('components/footer.html');
        if(document.getElementById('header-placeholder')) document.getElementById('header-placeholder').innerHTML = await hRes.text();
        if(document.getElementById('footer-placeholder')) {
            document.getElementById('footer-placeholder').innerHTML = await fRes.text();
            initMap(); // Gọi hiển thị bản đồ ngay sau khi tải xong Footer
        }
        
        checkAuth();
        if (document.getElementById('news-container')) fetchArticles();
        if (document.getElementById('articleDetail')) loadArticleDetail();
        fetchForumPosts();
        if (document.getElementById('forumDetailContent')) loadForumDetail();
    } catch (err) { console.error(err); }
});