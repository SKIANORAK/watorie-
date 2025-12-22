// product_atorie.js - ТОЛЬКО ЛОГИКА (без дублирования данных)
let currentProduct = null;
let currentMediaIndex = 0;
let productGallery = []; // Массив всех медиа (фото + видео)

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
    
    // Инициализируем галерею (теперь с видео)
    initGallery();
    
    document.title = currentProduct.name + ' - 6 months';
}

// Инициализация галереи (с фото и видео)
function initGallery() {
    if (!currentProduct) return;
    
    productGallery = [];
    
    // Добавляем все изображения
    if (currentProduct.images && currentProduct.images.length > 0) {
        currentProduct.images.forEach(image => {
            productGallery.push({
                type: 'image',
                src: image
            });
        });
    }
    
    // Добавляем видео ПОСЛЕ изображений
    if (currentProduct.videos && currentProduct.videos.length > 0) {
        currentProduct.videos.forEach(video => {
            productGallery.push({
                type: 'video',
                src: video.src,
                caption: video.caption
            });
        });
    }
    
    if (productGallery.length === 0) {
        // Если нет ни фото ни видео
        const productImage = document.getElementById('product-image');
        productImage.src = 'default.jpg';
        productImage.alt = currentProduct.name;
        return;
    }
    
    // Показываем первый элемент
    showMedia(0);
    
    // Создаем миниатюры
    createThumbnails();
}

// Показать медиа (фото или видео) по индексу
function showMedia(index) {
    if (!productGallery[index]) return;
    
    const productImage = document.getElementById('product-image');
    const media = productGallery[index];
    
    // Очищаем контейнер
    const container = document.querySelector('.main-image-container');
    
    // Убираем старое видео если было
    const existingVideo = container.querySelector('video');
    if (existingVideo) {
        existingVideo.remove();
    }
    
    if (media.type === 'image') {
        // Показываем изображение
        productImage.style.display = 'block';
        productImage.src = media.src;
        productImage.alt = currentProduct.name + ' - фото ' + (index + 1);
    } else if (media.type === 'video') {
        // Скрываем основное изображение
        productImage.style.display = 'none';
        
        // Создаем видео элемент
        const video = document.createElement('video');
        video.src = media.src;
        video.controls = true; // Оставляем контролы
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.className = 'main-video';
        
        container.appendChild(video);
        
        // Пытаемся запустить автоматически
        video.play().catch(e => {
            console.log('Автозапуск видео заблокирован:', e);
        });
    }
    
    currentMediaIndex = index;
    
    // Обновляем активную миниатюру
    updateActiveThumbnail();
}

// Смена изображения/видео
function changeImage(direction) {
    let newIndex = currentMediaIndex + direction;
    
    // Циклическая прокрутка
    if (newIndex < 0) {
        newIndex = productGallery.length - 1;
    } else if (newIndex >= productGallery.length) {
        newIndex = 0;
    }
    
    showMedia(newIndex);
}

// Создание миниатюр для фото и видео
function createThumbnails() {
    const thumbnailsContainer = document.getElementById('thumbnails');
    thumbnailsContainer.innerHTML = '';
    
    if (productGallery.length === 0) return;
    
    productGallery.forEach((media, index) => {
        const thumbnailWrapper = document.createElement('div');
        thumbnailWrapper.className = 'thumbnail-wrapper';
        thumbnailWrapper.style.position = 'relative';
        thumbnailWrapper.style.display = 'inline-block';
        thumbnailWrapper.style.margin = '5px';
        
        if (media.type === 'image') {
            // Миниатюра для фото
            const img = document.createElement('img');
            img.src = media.src;
            img.alt = 'Миниатюра ' + (index + 1);
            img.className = 'thumbnail';
            if (index === 0) img.classList.add('active');
            
            img.addEventListener('click', () => showMedia(index));
            thumbnailWrapper.appendChild(img);
            
            // Иконка фото
            const photoIcon = document.createElement('div');
            photoIcon.className = 'thumbnail-icon';
            photoIcon.textContent = '📷';
            photoIcon.style.cssText = `
                position: absolute;
                top: 5px;
                right: 5px;
                font-size: 10px;
                background: rgba(0,0,0,0.7);
                border-radius: 50%;
                width: 18px;
                height: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: none;
            `;
            thumbnailWrapper.appendChild(photoIcon);
            
        } else if (media.type === 'video') {
            // Миниатюра для видео (первый кадр)
            const video = document.createElement('video');
            video.src = media.src;
            video.muted = true;
            video.className = 'thumbnail';
            if (index === 0) video.classList.add('active');
            
            // Устанавливаем первый кадр как постер
            video.addEventListener('loadeddata', function() {
                this.currentTime = 0.1;
            });
            
            video.addEventListener('click', () => showMedia(index));
            thumbnailWrapper.appendChild(video);
            
            // Иконка видео
            const videoIcon = document.createElement('div');
            videoIcon.className = 'thumbnail-icon';
            videoIcon.textContent = '▶️';
            videoIcon.style.cssText = `
                position: absolute;
                top: 5px;
                right: 5px;
                font-size: 10px;
                background: rgba(0,0,0,0.7);
                border-radius: 50%;
                width: 18px;
                height: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: none;
            `;
            thumbnailWrapper.appendChild(videoIcon);
        }
        
        thumbnailsContainer.appendChild(thumbnailWrapper);
    });
}

// Обновление активной миниатюры
function updateActiveThumbnail() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, index) => {
        thumb.classList.toggle('active', index === currentMediaIndex);
    });
}

// Функция добавления в корзину
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
            image: productImage,
            quantity: 1,
            size: size
        });
    }
    
    saveCart(cart);
    
    // Кастомное уведомление
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
