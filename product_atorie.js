// product_atorie.js - ИСПРАВЛЕННЫЙ КОД
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
    
    // ЗАГРУЖАЕМ ФИЛОСОФИЮ
    const philosophyElement = document.getElementById('product-philosophy');
    if (philosophyElement && currentProduct.philosophy) {
        philosophyElement.innerHTML = currentProduct.philosophy;
        // ПОКАЗЫВАЕМ КОНТЕЙНЕР С ФИЛОСОФИЕЙ
        document.getElementById('philosophy-container').style.display = 'block';
    }
    
    // ЗАГРУЖАЕМ ХАРАКТЕРИСТИКИ (О ТОВАРЕ)
    const featuresList = document.getElementById('product-features');
    featuresList.innerHTML = '';
    if (currentProduct.features && currentProduct.features.length > 0) {
        currentProduct.features.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            featuresList.appendChild(li);
        });
    }
    
    // Инициализируем галерею
    initGallery();
    
    // ЗАГРУЖАЕМ ВИДЕО КАК ОТДЕЛЬНЫЙ БЛОК (если нужно)
    // loadVideos(); // Раскомментируйте если хотите видео отдельно
    
    document.title = currentProduct.name + ' - 6 months';
}

// Инициализация галереи (ПРОСТАЯ И РАБОЧАЯ)
function initGallery() {
    if (!currentProduct) return;
    
    // Проверяем есть ли изображения
    if (!currentProduct.images || currentProduct.images.length === 0) {
        console.error('Нет изображений для товара:', currentProduct.name);
        const productImage = document.getElementById('product-image');
        productImage.src = 'default.jpg';
        productImage.alt = currentProduct.name;
        return;
    }
    
    console.log('Изображения товара:', currentProduct.images);
    
    // Показываем первую картинку
    showImage(0);
    
    // Создаем миниатюры
    createThumbnails();
}

// Показать изображение по индексу
function showImage(index) {
    if (!currentProduct.images || !currentProduct.images[index]) {
        console.error('Изображение не найдено по индексу:', index);
        return;
    }
    
    console.log('Показываем изображение:', currentProduct.images[index]);
    
    const productImage = document.getElementById('product-image');
    productImage.src = currentProduct.images[index];
    productImage.alt = currentProduct.name + ' - фото ' + (index + 1);
    
    // ПРЕДЗАГРУЖАЕМ СЛЕДУЮЩЕЕ ИЗОБРАЖЕНИЕ (чтобы не лагало)
    const nextIndex = (index + 1) % currentProduct.images.length;
    if (currentProduct.images[nextIndex]) {
        const img = new Image();
        img.src = currentProduct.images[nextIndex];
    }
    
    currentImageIndex = index;
    
    // Обновляем активную миниатюру
    updateActiveThumbnail();
}

// Смена изображения
function changeImage(direction) {
    if (!currentProduct.images || currentProduct.images.length === 0) return;
    
    const newIndex = currentImageIndex + direction;
    
    if (newIndex >= 0 && newIndex < currentProduct.images.length) {
        showImage(newIndex);
    } else if (newIndex < 0) {
        showImage(currentProduct.images.length - 1);
    } else {
        showImage(0);
    }
}

// Создание миниатюр
function createThumbnails() {
    const thumbnailsContainer = document.getElementById('thumbnails');
    if (!thumbnailsContainer) return;
    
    thumbnailsContainer.innerHTML = '';
    
    if (!currentProduct.images || currentProduct.images.length === 0) return;
    
    currentProduct.images.forEach((image, index) => {
        // ПРЕДЗАГРУЖАЕМ МИНИАТЮРЫ
        const img = new Image();
        img.src = image;
        
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
