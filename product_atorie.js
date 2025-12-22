// product_atorie.js - с видео в галерее
let currentProduct = null;
let currentMediaIndex = 0;
let productMedia = []; // Массив всех медиа: фото + видео

// Функции для работы с корзиной
function getCart() {
    return JSON.parse(localStorage.getItem('cart_guest')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart_guest', JSON.stringify(cart));
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
        alert.querySelector('.alert-text').textContent = message;
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
    
    console.log('Загружаем товар:', currentProduct.name);
    
    // Заполняем страницу данными
    document.getElementById('product-title').textContent = currentProduct.name;
    document.getElementById('product-price').textContent = currentProduct.price + ' ₽';
    document.getElementById('product-description').textContent = currentProduct.description;
    
    // Философия
    const philosophyElement = document.getElementById('product-philosophy');
    if (philosophyElement && currentProduct.philosophy) {
        philosophyElement.innerHTML = currentProduct.philosophy;
    }
    
    // Характеристики
    const featuresList = document.getElementById('product-features');
    featuresList.innerHTML = '';
    if (currentProduct.features && currentProduct.features.length > 0) {
        currentProduct.features.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            featuresList.appendChild(li);
        });
    }
    
    // Инициализируем галерею (фото + видео)
    initGallery();
    
    document.title = currentProduct.name + ' - 6 months';
}

// Инициализация галереи с фото и видео
function initGallery() {
    if (!currentProduct) return;
    
    productMedia = [];
    
    // 1. Добавляем ВСЕ изображения
    if (currentProduct.images && currentProduct.images.length > 0) {
        currentProduct.images.forEach(image => {
            productMedia.push({
                type: 'image',
                src: image
            });
        });
    }
    
    // 2. Добавляем ВСЕ видео ПОСЛЕ изображений
    if (currentProduct.videos && currentProduct.videos.length > 0) {
        currentProduct.videos.forEach(video => {
            productMedia.push({
                type: 'video',
                src: video.src,
                caption: video.caption || ''
            });
        });
    }
    
    if (productMedia.length === 0) {
        console.error('Нет ни фото ни видео для товара');
        return;
    }
    
    console.log('Всего медиа в галерее:', productMedia.length);
    
    // Показываем первый элемент
    showMedia(0);
    
    // Создаем миниатюры
    createThumbnails();
}

// Показать медиа (фото или видео) по индексу
function showMedia(index) {
    if (!productMedia[index]) return;
    
    const media = productMedia[index];
    const container = document.querySelector('.main-image-container');
    const mainImage = document.getElementById('product-image');
    
    // Очищаем контейнер
    const existingVideo = container.querySelector('video');
    if (existingVideo) {
        existingVideo.remove();
    }
    
    if (media.type === 'image') {
        // Показываем изображение
        mainImage.style.display = 'block';
        mainImage.src = media.src;
        mainImage.alt = currentProduct.name + ' - фото ' + (index + 1);
    } 
    else if (media.type === 'video') {
        // Скрываем основное изображение
        mainImage.style.display = 'none';
        
        // Создаем видео элемент
        const video = document.createElement('video');
        video.src = media.src;
        video.controls = false; // БЕЗ КОНТРОЛОВ - как гифка
        video.muted = true;
        video.autoplay = true; // АВТОЗАПУСК
        video.loop = true; // ЗАЦИКЛИВАНИЕ
        video.playsInline = true;
        video.className = 'main-video';
        
        // Настройки для автовоспроизведения
        video.setAttribute('webkit-playsinline', '');
        video.setAttribute('playsinline', '');
        
        container.appendChild(video);
        
        // Пытаемся запустить видео
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.log('Автозапуск видео заблокирован:', e);
                // Если автозапуск заблокирован, показываем кнопку play
                video.controls = true;
            });
        }
    }
    
    currentMediaIndex = index;
    
    // Обновляем активную миниатюру
    updateActiveThumbnail();
}

// Смена медиа
function changeImage(direction) {
    if (productMedia.length === 0) return;
    
    let newIndex = currentMediaIndex + direction;
    
    // Циклическая прокрутка
    if (newIndex < 0) {
        newIndex = productMedia.length - 1;
    } else if (newIndex >= productMedia.length) {
        newIndex = 0;
    }
    
    showMedia(newIndex);
}

// Создание миниатюр
function createThumbnails() {
    const thumbnailsContainer = document.getElementById('thumbnails');
    if (!thumbnailsContainer) return;
    
    thumbnailsContainer.innerHTML = '';
    
    if (productMedia.length === 0) return;
    
    productMedia.forEach((media, index) => {
        const thumbnailWrapper = document.createElement('div');
        thumbnailWrapper.className = 'thumbnail-wrapper';
        
        if (media.type === 'image') {
            // Миниатюра для фото
            const img = document.createElement('img');
            img.src = media.src;
            img.alt = 'Миниатюра ' + (index + 1);
            img.className = 'thumbnail';
            if (index === 0) img.classList.add('active');
            
            img.addEventListener('click', () => showMedia(index));
            thumbnailWrapper.appendChild(img);
            
            // Добавляем иконку фото
            const icon = document.createElement('div');
            icon.className = 'thumbnail-icon photo';
            icon.textContent = '📷';
            thumbnailWrapper.appendChild(icon);
            
        } 
        else if (media.type === 'video') {
            // Миниатюра для видео
            const video = document.createElement('video');
            video.src = media.src;
            video.muted = true;
            video.preload = 'metadata';
            video.className = 'thumbnail-video';
            if (index === 0) video.classList.add('active');
            
            // Устанавливаем первый кадр как постер
            video.addEventListener('loadeddata', function() {
                this.currentTime = 0.1;
            });
            
            video.addEventListener('click', () => showMedia(index));
            thumbnailWrapper.appendChild(video);
            
            // Добавляем иконку видео
            const icon = document.createElement('div');
            icon.className = 'thumbnail-icon video';
            icon.textContent = '▶️';
            thumbnailWrapper.appendChild(icon);
        }
        
        thumbnailsContainer.appendChild(thumbnailWrapper);
    });
}

// Обновление активной миниатюры
function updateActiveThumbnail() {
    const thumbnails = document.querySelectorAll('.thumbnail, .thumbnail-video');
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
    console.log('Страница товара загружается...');
    
    // Ждем загрузки данных товаров
    if (typeof products === 'undefined') {
        console.error('products не загружен!');
        setTimeout(loadProduct, 100);
    } else {
        loadProduct();
    }
    
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
