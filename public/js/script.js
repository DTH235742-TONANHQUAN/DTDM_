let allArticles = [];

// ==========================================
// 1. LOGIC CHO MENU 3 GẠCH (HAMBURGER MENU)
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

// Bấm ra ngoài thì tự đóng menu
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
        // Giao diện khi đã đăng nhập (Có menu 3 gạch bên phải)
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
        // Giao diện khi chưa đăng nhập
        authSection.innerHTML = `
            <a href="dangnhap.html" class="auth-btn">Đăng nhập</a>
            <a href="dangky.html" class="auth-btn">Đăng ký</a>
        `;
    }
}

function logout() {
    localStorage.removeItem('esport_user');
    localStorage.removeItem('esport_token'); 
    checkAuth(); 
    // Nếu đang ở trang yêu cầu đăng nhập thì đá ra trang chủ
    if(window.location.pathname.includes('taikhoan.html') || window.location.pathname.includes('admin.html')) {
        window.location.href = 'index.html';
    }
}

// ==========================================
// 3. TẢI VÀ HIỂN THỊ BÀI VIẾT (TRANG CHỦ & TIN TỨC)
// ==========================================
async function fetchArticles() {
    try {
        const response = await fetch('/api/articles');
        allArticles = await response.json();
        
        const sortedByDate = [...allArticles].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const top4 = sortedByDate.slice(0, 4);
        
        renderHeroBanner(top4);
        renderArticles(sortedByDate);
        renderMostRead(allArticles);

    } catch (error) {
        const container = document.getElementById('news-container');
        if(container) container.innerHTML = '<h3 style="color:#ff4655; text-align:center; width:100%;">❌ Lỗi kết nối Server!</h3>';
    }
}

function renderHeroBanner(top4Articles) {
    const bannerContainer = document.getElementById('heroBannerContainer');
    if (!bannerContainer) return;

    const titleElement = bannerContainer.previousElementSibling;

    if (top4Articles.length === 0) {
        bannerContainer.innerHTML = '';
        if (titleElement && titleElement.tagName === 'H2') titleElement.style.display = 'none';
        return;
    }

    if (titleElement && titleElement.tagName === 'H2') titleElement.style.display = 'block';

    const mainArticle = top4Articles[0];
    const sideArticles = top4Articles.slice(1);

    let sideHtml = '';
    sideArticles.forEach(article => {
        const dateString = new Date(article.createdAt).toLocaleDateString('vi-VN');
        sideHtml += `
            <div class="hero-side-item" onclick="window.location.href='doctin.html?id=${article._id}'">
                <img src="${article.imageUrl}" onerror="this.onerror=null; this.src='https://placehold.co/400x200/5d4369/FFF?text=No+Image'">
                <div class="hero-side-overlay">
                    <span class="hero-tag">${article.category}</span>
                    <h3>${article.title}</h3>
                    <span style="font-size: 0.75rem; color: #ccc;">🕒 ${dateString}</span>
                </div>
            </div>
        `;
    });

    const mainDateString = new Date(mainArticle.createdAt).toLocaleDateString('vi-VN');

    bannerContainer.innerHTML = `
        <div class="hero-banner">
            <div class="hero-main" onclick="window.location.href='doctin.html?id=${mainArticle._id}'">
                <img src="${mainArticle.imageUrl}" onerror="this.onerror=null; this.src='https://placehold.co/800x400/5d4369/FFF?text=No+Image'">
                <div class="hero-overlay">
                    <span class="hero-tag">${mainArticle.category}</span>
                    <h2>${mainArticle.title}</h2>
                    <p style="color: #ccc; margin: 0; font-size: 0.9rem;">🕒 ${mainDateString} • 👁️ ${mainArticle.views || 0} lượt xem</p>
                </div>
            </div>
            <div class="hero-side-list">
                ${sideHtml}
            </div>
        </div>
        <hr style="border: 0; border-top: 2px solid #2a2e35; margin-bottom: 30px;">
    `;
}

function renderArticles(articlesToRender) {
    const container = document.getElementById('news-container');
    if (!container) return;
    container.innerHTML = ''; 

    if (articlesToRender.length === 0) {
        container.innerHTML = '<h3 style="text-align:center; width:100%; color:#888;">Không tìm thấy bài viết nào.</h3>'; 
        return;
    }
    
    articlesToRender.forEach(article => {
        const dateString = new Date(article.createdAt).toLocaleString('vi-VN');
        const viewsCount = article.views || 0; 
        
        container.innerHTML += `
            <div class="article-card" onclick="window.location.href='doctin.html?id=${article._id}'" style="cursor: pointer;">
                <div class="article-img-wrapper">
                    <img src="${article.imageUrl}" onerror="this.onerror=null; this.src='https://placehold.co/400x200/5d4369/FFF?text=No+Image'">
                </div>
                <div class="article-content">
                    <span class="category-tag">${article.category}</span>
                    <span style="font-size: 0.8rem; color: #aaa; margin-left: 10px;">👁️ ${viewsCount} lượt xem</span>
                    <h2 class="article-title">${article.title}</h2>
                    <p class="article-date">🕒 ${dateString}</p>
                    <p class="article-summary">${article.summary}</p>
                </div>
            </div>`;
    });
}

function renderMostRead(articles) {
    const mostReadList = document.getElementById('mostReadList');
    if (!mostReadList) return;

    const sortedByViews = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0));
    const top5 = sortedByViews.slice(0, 5);

    mostReadList.innerHTML = '';
    top5.forEach((article, index) => {
        mostReadList.innerHTML += `
            <li>
                <span class="rank">${index + 1}</span>
                <a href="doctin.html?id=${article._id}" style="text-decoration: none; display: block; width: 100%; transition: 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#ece8e1'">
                    ${article.title}
                </a>
            </li>
        `;
    });
}

// ==========================================
// 4. LỌC VÀ TÌM KIẾM BÀI VIẾT
// ==========================================
let currentCategory = 'Tất cả';
let currentSearchText = '';

function applyFiltersAndSearch() {
    let filteredList = allArticles; 

    if (currentCategory !== 'Tất cả') {
        filteredList = filteredList.filter(article => article.category === currentCategory);
    }
    if (currentSearchText.trim() !== '') {
        filteredList = filteredList.filter(article => 
            article.title.toLowerCase().includes(currentSearchText.toLowerCase())
        );
    }
    
    const sortedByDate = [...filteredList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    renderArticles(sortedByDate);
}

const searchInput = document.getElementById('homeSearchInput');
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        currentSearchText = e.target.value; 
        applyFiltersAndSearch(); 
    });
}

document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        currentCategory = this.getAttribute('data-category');
        applyFiltersAndSearch(); 
    });
});

// ==========================================
// 5. TRANG CHI TIẾT BÀI VIẾT & BÌNH LUẬN
// ==========================================
async function loadArticleDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');

    if (!articleId) return; 

    const detailContainer = document.getElementById('articleDetail');
    if (!detailContainer) return;

    try {
        fetch(`/api/articles/${articleId}/view`, { method: 'PATCH' }).catch(err => console.log(err));

        const response = await fetch(`/api/articles/${articleId}`);
        if (!response.ok) throw new Error('Bài viết không tồn tại');
        
        const article = await response.json();
        const dateString = new Date(article.createdAt).toLocaleString('vi-VN');
        const viewsCount = (article.views || 0) + 1; 

        detailContainer.innerHTML = `
            <div style="text-align: center;">
                <span class="category-tag">${article.category}</span>
                <h1 class="detail-title">${article.title}</h1>
                <div class="detail-meta" style="justify-content: center;">
                    <span>✍️ Đăng bởi: Admin</span>
                    <span>🕒 ${dateString}</span>
                    <span>👁️ ${viewsCount} lượt xem</span>
                </div>
            </div>
            <img src="${article.imageUrl}" alt="${article.title}" class="detail-cover" onerror="this.onerror=null; this.src='https://placehold.co/1000x500/5d4369/FFF?text=No+Cover+Image'">
            <div class="detail-content">
                <p><strong><em>${article.summary}</em></strong></p>
                <div style="margin-top: 30px;">${article.content}</div>
            </div>
        `;
        
        loadComments(articleId);

    } catch (error) {
        detailContainer.innerHTML = `
            <h2 style="text-align: center; color: #ff4655;">❌ Lỗi: Không thể tải bài viết này!</h2>
        `;
    }
}

async function loadComments(articleId) {
    const commentsList = document.getElementById('commentsList');
    const commentCount = document.getElementById('commentCount');
    const formContainer = document.getElementById('commentFormContainer');
    
    if (!commentsList) return;

    const userStr = localStorage.getItem('esport_user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    if (currentUser) {
        formContainer.innerHTML = `
            <div style="background: #1a1e24; padding: 15px; border-radius: 8px; border: 1px solid #2a2e35;">
                <p style="margin-bottom: 10px; font-weight: bold; color: #5d4369;">👤 Bạn đang bình luận với tên: <span style="color: white;">${currentUser.username}</span></p>
                <textarea id="commentInput" rows="3" style="width: 100%; padding: 12px; background: #111418; color: white; border: 1px solid #333; border-radius: 5px; outline: none; margin-bottom: 10px; resize: vertical;" placeholder="Chia sẻ suy nghĩ của bạn về bài báo này..."></textarea>
                <div style="text-align: right;">
                    <button onclick="submitComment('${articleId}', '${currentUser.username}')" class="submit-btn" style="width: auto; padding: 10px 20px;">Gửi bình luận 🚀</button>
                </div>
            </div>
        `;
    } else {
        formContainer.innerHTML = `
            <div style="background: #1a1e24; padding: 20px; text-align: center; border-radius: 8px; border: 1px solid #2a2e35;">
                <p style="color: #aaa; margin-bottom: 15px;">Bạn cần đăng nhập để tham gia bình luận cùng cộng đồng.</p>
                <a href="dangnhap.html" class="submit-btn" style="text-decoration: none; display: inline-block; width: auto; padding: 10px 25px;">Đăng nhập ngay</a>
            </div>
        `;
    }

    try {
        const res = await fetch(`/api/comments/${articleId}`);
        if (res.ok) {
            const comments = await res.json();
            commentCount.innerText = comments.length;
            
            if (comments.length === 0) {
                commentsList.innerHTML = '<p style="color: #888; font-style: italic; text-align: center; margin-top: 10px;">Chưa có bình luận nào. Hãy là người đầu tiên bóc tem bài viết này!</p>';
                return;
            }

            commentsList.innerHTML = '';
            comments.forEach(cmt => {
                const dateStr = new Date(cmt.createdAt).toLocaleString('vi-VN');
                
                let menuHtml = '';
                if (currentUser) {
                    const isOwner = currentUser.username === cmt.username;
                    const isAdmin = currentUser.role === 'admin';
                    
                    menuHtml = `
                    <div style="position: relative; display: inline-block;">
                        <button onclick="toggleCommentMenu('${cmt._id}')" style="background:none; border:none; color:#888; font-size:1.5rem; cursor:pointer; padding: 0 10px;">⋮</button>
                        <div id="menu-${cmt._id}" class="comment-menu" style="display:none; position:absolute; right:0; top:25px; background:#2a2e35; border:1px solid #444; padding:5px; border-radius:5px; z-index:10; min-width: 120px; box-shadow: 0 4px 8px rgba(0,0,0,0.5);">
                            ${isOwner ? `<button onclick="editComment('${cmt._id}', \`${cmt.content}\`, '${articleId}')" style="display:block; width:100%; background:none; border:none; color:white; padding:8px; text-align:left; cursor:pointer;">✏️ Sửa</button>` : ''}
                            ${(isOwner || isAdmin) ? `<button onclick="deleteComment('${cmt._id}', '${articleId}')" style="display:block; width:100%; background:none; border:none; color:#ff4655; padding:8px; text-align:left; cursor:pointer;">🗑️ Xóa</button>` : ''}
                            ${!isOwner ? `<button onclick="reportComment('${cmt._id}')" style="display:block; width:100%; background:none; border:none; color:#f39c12; padding:8px; text-align:left; cursor:pointer;">🚩 Báo cáo</button>` : ''}
                        </div>
                    </div>`;
                }

                commentsList.innerHTML += `
                    <div style="background: #1a1e24; padding: 15px; border-radius: 8px; border: 1px solid #2a2e35; border-left: 4px solid #5d4369;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                            <div>
                                <span style="font-weight: bold; color: #fff; font-size: 1.1rem;">👤 ${cmt.username}</span>
                                <span style="font-size: 0.85rem; color: #888; margin-left: 10px;">🕒 ${dateStr}</span>
                            </div>
                            ${menuHtml}
                        </div>
                        <p style="color: #ece8e1; line-height: 1.6; margin: 0; white-space: pre-wrap;">${cmt.content}</p>
                    </div>
                `;
            });
        }
    } catch (error) { console.error("Lỗi tải bình luận:", error); }
}

function toggleCommentMenu(id) {
    const menus = document.querySelectorAll('.comment-menu');
    menus.forEach(m => { if(m.id !== 'menu-' + id) m.style.display = 'none'; });
    const menu = document.getElementById('menu-' + id);
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

async function submitComment(articleId, username) {
    const input = document.getElementById('commentInput');
    const content = input.value.trim();
    if (!content) return alert("Vui lòng nhập nội dung bình luận!");

    try {
        const res = await fetch(`/api/comments/${articleId}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, content })
        });
        if (res.ok) { input.value = ''; loadComments(articleId); }
    } catch (error) { alert("Lỗi khi gửi bình luận!"); }
}

async function editComment(id, oldContent, articleId) {
    const newContent = prompt("Sửa bình luận của bạn:", oldContent);
    if (newContent !== null && newContent.trim() !== "" && newContent !== oldContent) {
        try {
            await fetch(`/api/comments/${id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newContent })
            });
            loadComments(articleId);
        } catch (error) { alert("Lỗi sửa bình luận!"); }
    }
}

async function deleteComment(id, articleId) {
    if (confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
        try {
            await fetch(`/api/comments/${id}`, { method: 'DELETE' });
            loadComments(articleId);
        } catch (error) { alert("Lỗi xóa bình luận!"); }
    }
}

async function reportComment(id) {
    if (confirm("Báo cáo bình luận này vì nội dung không phù hợp?")) {
        try {
            await fetch(`/api/comments/${id}/report`, { method: 'PATCH' });
            alert("Đã gửi báo cáo cho Admin xem xét!");
            document.getElementById('menu-' + id).style.display = 'none';
        } catch (error) { alert("Lỗi báo cáo!"); }
    }
}

// ==========================================
// 6. TẢI COMPONENT VÀ KHỞI TẠO TRANG
// ==========================================
async function loadComponents() {
    try {
        const hRes = await fetch('components/header.html');
        const fRes = await fetch('components/footer.html');
        const hBox = document.getElementById('header-placeholder');
        const fBox = document.getElementById('footer-placeholder');
        if(hBox) hBox.innerHTML = await hRes.text();
        if(fBox) fBox.innerHTML = await fRes.text();

        checkAuth(); 
        if (document.getElementById('news-container')) fetchArticles(); 
        if (document.getElementById('articleDetail')) loadArticleDetail();
    } catch (error) { console.error("Lỗi khi tải component:", error); }
}

window.addEventListener('DOMContentLoaded', loadComponents);