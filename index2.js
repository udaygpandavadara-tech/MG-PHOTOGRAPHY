// ========== ADMIN CONFIG ==========
const ADMIN_PASSWORD = 'admin123'; // CHANGE THIS!

// ========== DOM ELEMENTS ==========
const adminLogin = document.getElementById('adminLogin');
const adminPass = document.getElementById('adminPass');
const loginBtn = document.getElementById('loginBtn');
const skipBtn = document.getElementById('skipBtn');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');

const uploadSection = document.getElementById('uploadSection');
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const uploadPreview = document.getElementById('uploadPreview');
const previewGrid = document.getElementById('previewGrid');
const fileCount = document.getElementById('fileCount');
const clearBtn = document.getElementById('clearBtn');
const uploadBtn = document.getElementById('uploadBtn');
const uploadProgress = document.getElementById('uploadProgress');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const uploadSuccess = document.getElementById('uploadSuccess');
const customerGrid = document.getElementById('customerGrid');
const galleryCount = document.getElementById('galleryCount');

let selectedFiles = [];

// ========== ADMIN LOGIN ==========
function initAdmin() {
    // Check if already logged in
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        showUploadSection();
        return;
    }

    // Show login overlay
    adminLogin.classList.remove('hidden');
}

function showUploadSection() {
    adminLogin.classList.add('hidden');
    uploadSection.style.display = 'block';
}

function checkPassword() {
    if (adminPass.value === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        showUploadSection();
    } else {
        loginError.classList.add('active');
        adminPass.value = '';
        adminPass.focus();
    }
}

function skipLogin() {
    adminLogin.classList.add('hidden');
}

function adminLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    uploadSection.style.display = 'none';
    adminPass.value = '';
    loginError.classList.remove('active');
    initAdmin();
}

// Event listeners
if (loginBtn) {
    loginBtn.addEventListener('click', checkPassword);
}

if (adminPass) {
    adminPass.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkPassword();
    });
}

if (skipBtn) {
    skipBtn.addEventListener('click', skipLogin);
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', adminLogout);
}

// Initialize
initAdmin();

// ========== DRAG & DROP ==========
if (uploadZone) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadZone.addEventListener(eventName, () => uploadZone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, () => uploadZone.classList.remove('dragover'), false);
    });

    uploadZone.addEventListener('drop', handleDrop, false);
}

if (fileInput) {
    fileInput.addEventListener('change', handleFiles, false);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles({ target: { files } });
}

// ========== FILE HANDLING ==========
function handleFiles(e) {
    const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
    
    if (files.length + selectedFiles.length > 10) {
        alert('Maximum 10 files allowed');
        return;
    }

    files.forEach(file => {
        if (file.size > 10 * 1024 * 1024) {
            alert(`${file.name} exceeds 10MB limit`);
            return;
        }
        selectedFiles.push(file);
    });

    updatePreview();
}

function updatePreview() {
    if (!uploadPreview) return;
    
    if (selectedFiles.length === 0) {
        uploadPreview.classList.remove('active');
        return;
    }

    uploadPreview.classList.add('active');
    fileCount.textContent = selectedFiles.length;
    previewGrid.innerHTML = '';

    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const div = document.createElement('div');
            div.className = 'preview-item';
            div.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}">
                <button class="remove-btn" data-index="${index}">×</button>
                <div class="file-name">${file.name}</div>
            `;
            previewGrid.appendChild(div);
        };
        reader.readAsDataURL(file);
    });
}

// ========== REMOVE / CLEAR ==========
if (previewGrid) {
    previewGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const index = parseInt(e.target.dataset.index);
            selectedFiles.splice(index, 1);
            updatePreview();
        }
    });
}

if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        selectedFiles = [];
        updatePreview();
        if (fileInput) fileInput.value = '';
    });
}

// ========== UPLOAD SIMULATION ==========
if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
        if (selectedFiles.length === 0) return;

        uploadBtn.disabled = true;
        uploadProgress.classList.add('active');
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                setTimeout(() => {
                    completeUpload();
                }, 500);
            }
            
            progressFill.style.width = progress + '%';
            progressText.textContent = `Uploading... ${Math.round(progress)}%`;
        }, 200);
    });
}

function completeUpload() {
    uploadProgress.classList.remove('active');
    uploadSuccess.classList.add('active');
    uploadPreview.classList.remove('active');
    
    selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            addToCustomerGallery(e.target.result, file.name);
        };
        reader.readAsDataURL(file);
    });

    selectedFiles = [];
    if (fileInput) fileInput.value = '';
    uploadBtn.disabled = false;

    setTimeout(() => {
        uploadSuccess.classList.remove('active');
    }, 3000);
}

function addToCustomerGallery(src, filename) {
    const card = document.createElement('article');
    card.className = 'customer-card';
    card.dataset.category = 'community';
    card.innerHTML = `
        <img src="${src}" alt="Customer photo">
        <div class="customer-overlay">
            <span class="customer-tag">Community</span>
            <h3 class="customer-name">Admin Upload</h3>
            <p class="customer-date">Just now</p>
            <div class="customer-meta">
                <div class="meta-item">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                    <span>0 likes</span>
                </div>
            </div>
        </div>
    `;
    
    customerGrid.insertBefore(card, customerGrid.firstChild);
    
    const count = customerGrid.children.length;
    galleryCount.textContent = `${count} photo${count !== 1 ? 's' : ''}`;
}

// ========== FILTER FUNCTIONALITY ==========
const filterBtns = document.querySelectorAll('.filter-btn');
const allCards = document.querySelectorAll('.photo-card, .customer-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        allCards.forEach(card => {
            const categories = card.dataset.category || '';
            const isVisible = filter === 'all' || categories.includes(filter);
            
            if (isVisible) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 10);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 400);
            }
        });
    });
});