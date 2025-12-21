// product_atorie.js - ТОЛЬКО ЛОГИКА (без дублирования данных)
let currentProduct = null;
let currentImageIndex = 0;

// ФУНКЦИИ ДЛЯ РАБОТЫ С КОРЗИНОЙ
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

// ОСНОВНАЯ ФУНКЦИЯ ЗАГРУЗКИ ТОВАРА
function loadProduct() {
    console.log('--- НАЧАЛО ЗАГРУЗКИ ТОВАРА ---');
    
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    console.log('Ищем товар с ID:', productId);
    console.log('Всего товаров в базе:', products.length);
    
    currentProduct = products.find(p => p.id === productId);
    
    if (!currentProduct) {
        console.error('Товар не найден!');
        document.body.innerHTML = '<div style="padding:50px;text-align:center;color:white;">Товар не найден</div>';
        return;
    }
    
    console.log('Товар найден:', currentProduct.name);
    console.log('Цена:', currentProduct.price);
    console.log('Изображений:', currentProduct.images?.length || 0);
    console.log('Видео:', currentProduct.videos?.length || 0);
    console.log('Есть ли философия?', 'philosophy' in currentProduct);
    
    if (currentProduct.philosophy) {
        console.log('Философия содержимое:', currentProduct.philosophy);
    } else {
        console.log('Философии нет в данных');
    }
    
    // Заполняем основную информацию
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
    
    // РАБОТА С ФИЛОСОФИЕЙ
    const philosophyElement = document.getElementById('product-philosophy');
    const philosophyContainer = document.getElementById('philosophy-container');
    
    console.log('Поиск элемента философии...');
    console.log('Элемент product-philosophy найден?', !!philosophyElement);
    console.log('Контейнер философии найден?', !!philosophyContainer);
    console.log('Данные философии есть?', !!currentProduct.philosophy);
    
    if (philosophyElement && currentProduct.philosophy) {
        console.log('ЗАПОЛНЯЕМ ФИЛОСОФИЮ!');
        philosophyElement.innerHTML = currentProduct.philosophy;
        
        // Показываем контейнер
        if (philosophyContainer) {
            philosophyContainer.style.display = 'block';
            console.log('Контейнер философии показан');
        }
        
        // Убираем тестовые стили (оставляем только CSS стили)
        philosophyElement.style.border = '';
        philosophyElement.style.padding = '';
        philosophyElement.style.backgroundColor = '';
        
    } else {
        console.log('Проблема с философией:');
        console.log('- philosophyElement:', philosophyElement);
        console.log('- hasPhilosophy:', !!currentProduct.philosophy);
        
        // Скрываем контейнер, если философии нет
        if (philosophyContainer) {
            philosophyContainer.style.display = 'none';
            console.log('Контейнер философии скрыт');
        }
    }
    
    // Обновляем заголовок страницы
    document.title = currentProduct.name + ' - 6 months';
    console.log('Страница загружена успешно!');
}

// ФУНКЦИИ ГАЛЕРЕИ
function initGallery() {
    if (!currentProduct.images || currentProduct.images.length === 0) return;
    
    showImage(0);
    createThumbnails();
}

function showImage(index) {
    if (!currentProduct.images || !currentProduct.images[index]) return;
    
    const productImage = document.getElementById('product-image');
    productImage.src = currentProduct.images[index];
    productImage.alt = currentProduct.name + ' - фото ' + (index + 1);
    
    currentImageIndex = index;
    updateActiveThumbnail();
}

function changeImage(direction) {
    if (!currentProduct.images) return;
    
    const newIndex = currentImageIndex + direction;
    
    if (newIndex >= 0 && newIndex < currentProduct.images.length) {
        showImage(newIndex);
    } else if (newIndex < 0) {
        showImage(currentProduct.images.length - 1);
    } else {
        showImage(0);
    }
}

function createThumbnails() {
    const thumbnailsContainer = document.getElementById('thumbnails');
    if (!thumbnailsContainer || !currentProduct.images) return;
    
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

function updateActiveThumbnail() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, index) => {
        thumb.classList.toggle('active', index === currentImageIndex);
    });
}

// ФУНКЦИИ ВИДЕО
function loadVideos() {
    const videoContainer = document.getElementById('video-container');
    if (!videoContainer) return;
    
    if (!currentProduct.videos || currentProduct.videos.length === 0) {
        videoContainer.innerHTML = '<p style="text-align:center;color:#666;padding:40px;">Видео скоро появятся</p>';
        return;
    }
    
    videoContainer.innerHTML = '';
    
    currentProduct.videos.forEach(video => {
        const videoItem = document.createElement('div');
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

// ФУНКЦИИ КОРЗИНЫ
function addToCart(productId, size = 'M') {
    const product = products.find(p => p.id === productId);
    if (!product) {
        console.error('Товар не найден:', productId);
        alert('Ошибка: товар не найден');
        return;
    }
    
    let cart = getCart();
    const existingItem = cart.find(item => item.id === productId && item.size === size);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        const productImage = product.images && product.images.length > 0 
            ? product.images[0] 
            : 'images/default-product.jpg';
        
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
    console.log('Товар добавлен:', product.name);
    alert('Товар "' + product.name + '" добавлен в корзину!');
    updateCartCounter();
}

function updateCartCounter() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCounter = document.getElementById('cart-count');
    if (cartCounter) {
        cartCounter.textContent = totalItems;
    }
}

// ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM полностью загружен');
    
    // Проверяем наличие необходимых элементов
    if (!document.getElementById('product-philosophy')) {
        console.error('Элемент product-philosophy не найден в DOM!');
    }
    
    // Загружаем товар
    loadProduct();
    
    // Обновляем счетчик корзины
    updateCartCounter();
    
    // Назначаем обработчик кнопки "Добавить в корзину"
    const addToCartBtn = document.getElementById('add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const selectedSize = document.getElementById('size-select').value;
            const urlParams = new URLSearchParams(window.location.search);
            const productId = parseInt(urlParams.get('id'));
            addToCart(productId, selectedSize);
        });
    }
    
    // Отладочная информация
    console.log('Инициализация завершена');
    console.log('Текущий URL:', window.location.href);
});
