// product_atorie.js - ТОЛЬКО ЛОГИКА (без дублирования данных)
let currentProduct = null;
let currentImageIndex = 0;

// Функции для работы с корзиной
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser')) || null;
}

function getCart() {
    const user = getCurrentUser();
    if (user) {
        return JSON.parse(localStorage.getItem(`cart_${user.id}`)) || [];
    }
    return JSON.parse(localStorage.getItem('cart_guest')) || [];
}

function saveCart(cart) {
    const user = getCurrentUser();
    if (user) {
        localStorage.setItem(`cart_${user.id}`, JSON.stringify(cart));
    } else {
        localStorage.setItem('cart_guest', JSON.stringify(cart));
    }
}

// Кастомное уведомление
function showCustomAlert(message) {
    let alert = document.getElementById('custom-alert');
    if (!alert) {
        alert = document.createElement('div');
        alert.id = 'custom-alert';
        alert.className = 'custom-alert';
        alert.innerHTML = `
            <div class="alert-content">
                <span class="alert-text">${message}</span>
            </div>
        `;
        document.body.appendChild(alert);
    } else {
        document.querySelector('.alert-text').textContent = message;
    }
    
    alert.classList.add('show');
    
    setTimeout(() => {
        alert.classList.remove('show');
    }, 2000);
}

// Загрузка данных товара
function loadProduct() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    currentProduct = products.find(p => p.id === productId);
    
    if (!currentProduct) {
        document.body.innerHTML = '<div style="padding:50px;text-align:center;color:white;">Товар не найден</div>';
        return;
    }
    
    // Заполняем страницу данными
    document.getElementById('product-title').textContent = currentProduct.name;
    document.getElementById('product-price').textContent = currentProduct.price + ' ₽';
    document.getElementById('product-description').textContent = currentProduct.description;
    
    // Инициализируем галерею
    initGallery();
    
    // Загружаем видео
    loadVideos();
    
    // Заполняем характеристики
    const featuresList = document.getElementById('product-features');
    featuresList.innerHTML = '';
    currentProduct.features.forEach(feature => {
        const li = document.createElement('li');
        li.textContent = feature;
        featuresList.appendChild(li);
    });
    
    // Философия
    const philosophyElement = document.getElementById('product-philosophy');
    if (philosophyElement && currentProduct.philosophy) {
        philosophyElement.innerHTML = currentProduct.philosophy;
    }
    
    document.title = currentProduct.name + ' - 6 months';
}

// Инициализация галереи (теперь с видео)
function initGallery() {
    if (!currentProduct) return;
    
    const allMedia = [];
    
    // Добавляем все изображения
    if (currentProduct.images && currentProduct.images.length > 0) {
        currentProduct.images.forEach(image => {
            allMedia.push({
                type: 'image',
                src: image
            });
        });
    }
    
    // Добавляем видео ПЕРЕД или ПОСЛЕ изображений (как хотите)
    if (currentProduct.videos && currentProduct.videos.length > 0) {
        currentProduct.videos.forEach(video => {
            allMedia.push({
                type: 'video',
                src: video.src,
                caption: video.caption
            });
        });
    }
    
    if (allMedia.length === 0) {
        // Если нет ни фото ни видео
        const productImage = document.getElementById('product-image');
        productImage.src = 'default.jpg';
        productImage.alt = currentProduct.name;
        return;
    }
    
    // Сохраняем все медиа для галереи
    window.productGallery = allMedia;
    
    // Показываем первый элемент
    showMedia(0);
    
    // Создаем миниатюры
    createThumbnails();
}

// Показать изображение по индексу
function showImage(index) {
    if (!currentProduct.images[index]) return;
    
    const productImage = document.getElementById('product-image');
    productImage.src = currentProduct.images[index];
    productImage.alt = currentProduct.name + ' - фото ' + (index + 1);
    
    currentImageIndex = index;
    
    // Обновляем активную миниатюру
    updateActiveThumbnail();
}

// Смена изображения
function changeImage(direction) {
    const newIndex = currentImageIndex + direction;
    
    if (newIndex >= 0 && newIndex < currentProduct.images.length) {
        showImage(newIndex);
    } else if (newIndex < 0) {
        showImage(currentProduct.images.length - 1); // Последняя картинка
    } else {
        showImage(0); // Первая картинка
    }
}

// Создание миниатюр
function createThumbnails() {
    const thumbnailsContainer = document.getElementById('thumbnails');
    thumbnailsContainer.innerHTML = '';
    
    currentProduct.images.forEach((image, index) => {
        const thumbnail = document.createElement('img');
        thumbnail.src = image;
        thumbnail.alt = 'Миниатюра ' + (index + 1);
        thumbnail.className = 'thumbnail';
        if (index === 0) thumbnail.classList.add('active');
        
        thumbnail.addEventListener('click', () => showImage(index));
        thumbnailsContainer.appendChild(thumbnail);
    });
}

// Обновление активной миниатюры
function updateActiveThumbnail() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, index) => {
        thumb.classList.toggle('active', index === currentImageIndex);
    });
}

// Загрузка видео
function loadVideos() {
    const videoContainer = document.getElementById('video-container');
    
    if (!currentProduct.videos || currentProduct.videos.length === 0) {
        videoContainer.innerHTML = '<p style="text-align:center;color:#666;">Видео скоро появятся</p>';
        return;
    }
    
    videoContainer.innerHTML = '';
    
    currentProduct.videos.forEach(video => {
        const videoItem = document.createElement('div');
        
        // Определяем класс для вертикальных/горизонтальных видео
        const videoClass = video.isVertical ? 'video-item vertical' : 'video-item';
        
        videoItem.className = videoClass;
        videoItem.innerHTML = `
            <video controls muted playsinline>
                <source src="${video.src}" type="video/mp4">
                Ваш браузер не поддерживает видео.
            </video>
            <div class="video-caption">${video.caption}</div>
        `;
        
        videoContainer.appendChild(videoItem);
    });
}

// Функция добавления в корзину (с кастомным уведомлением)
function addToCart(productId, size = 'M') {
    const product = products.find(p => p.id === productId);
    if (!product) {
        console.error('Товар не найден:', productId);
        return;
    }
    
    let cart = getCart();
    
    const existingItem = cart.find(item => item.id === productId && item.size === size);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // Сохраняем первое изображение товара
        const productImage = product.images ? product.images[0] : 'default.jpg';
        
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: productImage, // ← ВАЖНО: сохраняем изображение
            quantity: 1,
            size: size
        });
    }
    
    saveCart(cart);
    
    // КАСТОМНОЕ УВЕДОМЛЕНИЕ
    showCustomAlert('Товар "' + product.name + '" добавлен в корзину!');
    
    updateCartCounter();
}

// Обновление счетчика корзины
function updateCartCounter() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCounter = document.getElementById('cart-count');
    if (cartCounter) {
        cartCounter.textContent = totalItems;
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    loadProduct();
    updateCartCounter();
    
    const addToCartBtn = document.getElementById('add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const selectedSize = document.getElementById('size-select').value;
            const urlParams = new URLSearchParams(window.location.search);
            const productId = parseInt(urlParams.get('id'));
            addToCart(productId, selectedSize);
        });
    }
});

