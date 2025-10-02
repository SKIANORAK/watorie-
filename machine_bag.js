// machine_bag.js - ОБНОВЛЕННАЯ ВЕРСИЯ С СИНХРОНИЗАЦИЕЙ

// НАСТРОЙКИ TELEGRAM
const TELEGRAM_CONFIG = {
    botToken: '7969220641:AAGCTj-G2kGav5g4QqR2yx2fV6KUpSByKWQ',
    chatId: '2038132122' // ЗАМЕНИТЬ на реальный Chat ID
};

console.log('=== ЗАПУСК КОРЗИНЫ ===');

// Проверим ВСЕ данные в localStorage
console.log('ВСЕ данные в localStorage:');
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    console.log(`${key}:`, value);
}

// Функции для работы с пользователем
function getCurrentUser() {
    const user = JSON.parse(localStorage.getItem('currentUser')) || null;
    console.log('Текущий пользователь:', user);
    return user;
}

// Получение корзины с учетом пользователя
function getCart() {
    const user = getCurrentUser();
    let cart;
    
    if (user) {
        cart = JSON.parse(localStorage.getItem(`cart_${user.id}`)) || [];
        console.log('Корзина пользователя:', cart);
    } else {
        cart = JSON.parse(localStorage.getItem('cart_guest')) || [];
        console.log('Гостевая корзина:', cart);
    }
    
    return cart;
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

// Обновление счетчика корзины
function updateCartCounter() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCounter = document.getElementById('cart-count');
    if (cartCounter) {
        cartCounter.textContent = totalItems;
    }
}

// Функция отрисовки корзины
function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const clearCartBtn = document.getElementById('clear-cart');
    const cart = getCart();
    
    console.log('Корзина для отображения:', cart);
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
        cartTotal.textContent = '';
        if (clearCartBtn) clearCartBtn.style.display = 'none';
        return;
    }
    
    if (clearCartBtn) clearCartBtn.style.display = 'block';
    
    let total = 0;
    cartItems.innerHTML = '';
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>${item.price} ₽ × ${item.quantity}</p>
                ${item.size ? `<p>Размер: ${item.size}</p>` : ''}
                <button class="remove-item" onclick="removeFromCart(${index})">🗑️ Удалить</button>
            </div>
            <div class="cart-item-total">${itemTotal} ₽</div>
        `;
        cartItems.appendChild(itemEl);
    });
    
    cartTotal.textContent = `Итого: ${total} ₽`;
    cartTotal.innerHTML += `<div class="delivery-note">*Доставка рассчитывается отдельно</div>`;
}

// Удаление товара из корзины
function removeFromCart(index) {
    let cart = getCart();
    
    if (confirm(`Удалить "${cart[index].name}" из корзины?`)) {
        cart.splice(index, 1);
        saveCart(cart);
        renderCart();
        updateCartCounter();
    }
}

// Функция очистки корзины
function clearCart() {
    if (confirm('Вы уверены, что хотите полностью очистить корзину?')) {
        saveCart([]); // Сохраняем пустую корзину
        renderCart();
        updateCartCounter();
        alert('Корзина очищена!');
    }
}

// Обновление UI авторизации в корзине
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

// Выход из системы
function logout() {
    localStorage.removeItem('currentUser');
    updateAuthUI();
    updateCartCounter();
    renderCart(); // Перерисовываем корзину после выхода
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
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    
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
    renderCart(); // Перерисовываем корзину после входа
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

// Функция отправки заказа в Telegram
async function sendOrderToTelegram(orderData) {
    console.log('📤 Отправка заказа в Telegram...');
    console.log('Данные заказа:', orderData);
    
    let message = `🛒 *НОВЫЙ ЗАКАЗ* 🛒\n\n`;
    message += `📅 *Дата:* ${new Date().toLocaleString('ru-RU')}\n`;
    message += `📞 *Контакт:* ${orderData.contact}\n\n`;
    
    message += `*Состав заказа:*\n`;
    orderData.items.forEach((item, index) => {
        message += `${index + 1}. ${item.name}\n`;
        message += `   Размер: ${item.size || 'M'}\n`;
        message += `   Количество: ${item.quantity} шт.\n`;
        message += `   Цена: ${item.price} ₽ × ${item.quantity} = ${item.price * item.quantity} ₽\n\n`;
    });
    
    message += `💰 *Итого:* ${orderData.total} ₽\n`;
    message += `🚚 *Доставка:* рассчитывается отдельно\n\n`;
    message += `⏰ *Время заказа:* ${new Date().toLocaleTimeString('ru-RU')}`;

    console.log('Сообщение для Telegram:', message);

    try {
        const TELEGRAM_URL = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`;
        console.log('URL запроса:', TELEGRAM_URL);
        
        const response = await fetch(TELEGRAM_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.chatId,
                text: message,
                parse_mode: 'Markdown'
            })
        });
        
        const result = await response.json();
        console.log('Ответ от Telegram:', result);
        
        if (result.ok) {
            console.log('✅ Сообщение отправлено успешно!');
            return true;
        } else {
            console.log('❌ Ошибка Telegram:', result.description);
            
            // Покажем конкретную ошибку пользователю
            if (result.description.includes('chat not found')) {
                alert('❌ Ошибка: Chat ID не найден. Проверь настройки бота.');
            } else if (result.description.includes('Not Found')) {
                alert('❌ Ошибка: Неверный токен бота.');
            } else {
                alert(`❌ Ошибка Telegram: ${result.description}`);
            }
            return false;
        }
        
    } catch (error) {
        console.error('❌ Ошибка сети:', error);
        alert('❌ Ошибка сети. Проверь интернет соединение.');
        return false;
    }
}

// Валидация формы
function validateForm(contact) {
    if (!contact.trim()) {
        alert('Пожалуйста, введите ваш Telegram или телефон');
        return false;
    }
    
    if (contact.trim().length < 3) {
        alert('Контактные данные слишком короткие');
        return false;
    }
    
    return true;
}

// Инициализация корзины
document.addEventListener('DOMContentLoaded', function() {
    console.log('Инициализация корзины...');
    renderCart();
    updateCartCounter();
    updateAuthUI();
    
    // Обработчик для кнопки очистки
    const clearCartBtn = document.getElementById('clear-cart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
    
    // Обработчик для формы заказа
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const cart = getCart();
            const contact = document.getElementById('contact').value.trim();
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            // Валидация
            if (!validateForm(contact)) return;
            
            if (cart.length === 0) {
                alert('Корзина пуста! Добавьте товары перед оформлением заказа.');
                return;
            }
            
            const orderData = {
                items: cart,
                total: total,
                contact: contact,
                timestamp: new Date().toISOString()
            };
            
            // Показываем загрузку
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Отправка...';
            submitBtn.disabled = true;
            
            try {
                const success = await sendOrderToTelegram(orderData);
                
                if (success) {
                    alert('✅ Заказ оформлен! Я свяжусь с вами в Telegram для уточнения деталей в течение 15 минут.');
                    saveCart([]); // Очищаем корзину после успешного заказа
                    window.location.href = 'index.html';
                } else {
                    alert('❌ Ошибка при отправке заказа. Пожалуйста, напишите мне напрямую в Telegram.');
                }
            } catch (error) {
                alert('❌ Произошла ошибка. Попробуйте еще раз или свяжитесь со мной напрямую.');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});