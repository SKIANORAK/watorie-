// machine_osnova.js - ТОЛЬКО ЛОГИКА

// Функции для работы с пользователем
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser')) || null;
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function logout() {
    localStorage.removeItem('currentUser');
    updateAuthUI();
    updateCartCounter();
}

// Получение корзины с учетом пользователя
function getCart() {
    const user = getCurrentUser();
    if (user) {
        return JSON.parse(localStorage.getItem(`cart_${user.id}`)) || [];
    }
    return JSON.parse(localStorage.getItem('cart_guest')) || [];
}

// Сохранение корзины с учетом пользователя
function saveCart(cart) {
    const user = getCurrentUser();
    if (user) {
        localStorage.setItem(`cart_${user.id}`, JSON.stringify(cart));
    } else {
        localStorage.setItem('cart_guest', JSON.stringify(cart));
    }
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
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images ? product.images[0] : product.image,
            quantity: 1,
            size: size
        });
    }
    
    saveCart(cart);
    alert('Товар "' + product.name + '" добавлен в корзину!');
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

// Обновление UI авторизации
function updateAuthUI() {
    const user = getCurrentUser();
    const authSection = document.getElementById('auth-section');
    
    if (authSection) {
        if (user) {
            authSection.innerHTML = `
                <div class="user-info">
                    <span>👤 ${user.username}</span>
                    <button onclick="logout()" class="logout-btn">Выйти</button>
                </div>
            `;
        } else {
            authSection.innerHTML = `
                <button onclick="showAuthModal()" class="auth-btn">Войти</button>
            `;
        }
    }
}

// Модальное окно авторизации
function showAuthModal() {
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.innerHTML = `
        <div class="auth-modal-content">
            <h3>Вход в аккаунт</h3>
            <p>Войдите, чтобы синхронизировать корзину между устройствами</p>
            
            <div class="auth-options">
                <div class="auth-option" onclick="quickLogin('user123')">
                    <div class="auth-icon">👤</div>
                    <div class="auth-text">
                        <strong>Быстрый вход</strong>
                        <span>Логин: user123</span>
                    </div>
                </div>
                
                <div class="auth-option" onclick="quickLogin('fashion_lover')">
                    <div class="auth-icon">🛍️</div>
                    <div class="auth-text">
                        <strong>Быстрый вход</strong>
                        <span>Логин: fashion_lover</span>
                    </div>
                </div>
                
                <div class="auth-option" onclick="showCustomAuth()">
                    <div class="auth-icon">🔐</div>
                    <div class="auth-text">
                        <strong>Свой логин</strong>
                        <span>Создать новый аккаунт</span>
                    </div>
                </div>
            </div>
            
            <button onclick="closeAuthModal()" class="close-auth-btn">Закрыть</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Быстрый вход
function quickLogin(username) {
    const user = {
        id: generateUserId(),
        username: username,
        loginTime: new Date().toISOString()
    };
    
    // Переносим корзину гостя в корзину пользователя
    const guestCart = JSON.parse(localStorage.getItem('cart_guest')) || [];
    
    setCurrentUser(user);
    
    if (guestCart.length > 0) {
        saveCart(guestCart);
        localStorage.removeItem('cart_guest');
        setTimeout(() => {
            alert('Корзина синхронизирована! Товаров: ' + guestCart.length);
        }, 100);
    }
    
    updateAuthUI();
    closeAuthModal();
    updateCartCounter();
}

// Создание своего аккаунта
function showCustomAuth() {
    const username = prompt('Придумайте логин:');
    if (username && username.length >= 3) {
        quickLogin(username);
    } else {
        alert('Логин должен быть не менее 3 символов');
    }
}

// Генерация ID пользователя
function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

// Закрытие модального окна
function closeAuthModal() {
    const modal = document.querySelector('.auth-modal');
    if (modal) {
        modal.remove();
    }
}

// Создание карточек товаров
function renderProducts() {
    const grid = document.querySelector('.products-grid');
    if (!grid) {
        console.log('Не найден контейнер товаров');
        return;
    }
    
    console.log('Создаем товары:', products.length);
    
    grid.innerHTML = '';
    
    products.forEach(product => {
        const productImage = product.images ? product.images[0] : product.image;
        const productCard = `
            <div class="product-card">
                <a href="product_atorie.html?id=${product.id}" class="product-link">
                    <div class="product-image">
                        <img src="${productImage}" alt="${product.name}" 
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjIyIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuKEoiBJbWFnZTwvdGV4dD48L3N2Zz4='"
                             style="width:100%;height:100%;object-fit:cover;">
                    </div>
                    <div class="product-title">${product.name}</div>
                    <div class="product-price">${product.price} ₽</div>
                </a>
                <button class="add-to-cart" onclick="addToCart(${product.id})">
                    Добавить в корзину
                </button>
            </div>
        `;
        grid.innerHTML += productCard;
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log('Инициализация главной страницы...');
    renderProducts();
    updateCartCounter();
    updateAuthUI();
});