// НАСТРОЙКИ TELEGRAM
const TELEGRAM_CONFIG = {
    botToken: '7969220641:AAGCTj-G2kGav5g4QqR2yx2fV6KUpSByKWQ',
    chatId: '2038132122'
};

// ПОЛУЧЕНИЕ КОРЗИНЫ
function getCart() {
    return JSON.parse(localStorage.getItem('cart_guest')) || [];
}

// СОХРАНЕНИЕ КОРЗИНЫ
function saveCart(cart) {
    localStorage.setItem('cart_guest', JSON.stringify(cart));
}

// ОБНОВЛЕНИЕ СЧЕТЧИКА КОРЗИНЫ
function updateCartCounter() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCounter = document.getElementById('cart-count');
    if (cartCounter) {
        cartCounter.textContent = totalItems;
    }
}

// ОТРИСОВКА КОРЗИНЫ (БЕЗ ФИЛОСОФИИ)
function renderCart() {
    console.log('=== ОТРИСОВКА КОРЗИНЫ ===');
    
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const clearCartBtn = document.getElementById('clear-cart');
    const cart = getCart();
    
    // Считаем общее количество единиц товара
    const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    console.log('Всего единиц товара:', totalItemsCount);
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
        cartTotal.textContent = '';
        if (clearCartBtn) clearCartBtn.classList.remove('show');
        return;
    }
    
    // ОСНОВНОЙ РЕНДЕРИНГ
    let total = 0;
    cartItems.innerHTML = '';
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const productImage = item.image || 'default-image.jpg';
        
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <div class="cart-item-image">
                <img src="${productImage}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="item-size">Размер: ${item.size || 'M'}</div>
                <div class="quantity-controls">
                    <button class="quantity-btn minus" onclick="updateQuantity(${index}, -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
            </div>
            <div class="cart-item-total">${itemTotal} ₽</div>
        `;
        cartItems.appendChild(itemEl);
    });
    
    // ОБНОВЛЯЕМ ИТОГ
    cartTotal.textContent = `Итого: ${total} ₽`;
    cartTotal.innerHTML += `<div class="delivery-note">*Доставка рассчитывается отдельно</div>`;
    
    // УПРАВЛЕНИЕ КНОПКОЙ ОЧИСТКИ (ПОКАЗЫВАТЬ ОТ 2+ ЕДИНИЦ ТОВАРА)
    if (clearCartBtn) {
        if (totalItemsCount >= 2) {
            clearCartBtn.classList.add('show');
            console.log('Показали кнопку очистки (2+ единиц товара)');
        } else {
            clearCartBtn.classList.remove('show');
            console.log('Скрыли кнопку очистки (меньше 2 единиц товара)');
        }
    }
}

// ИЗМЕНЕНИЕ КОЛИЧЕСТВА ТОВАРА
function updateQuantity(index, change) {
    let cart = getCart();
    
    if (index >= 0 && index < cart.length) {
        cart[index].quantity += change;
        
        // ЕСЛИ КОЛИЧЕСТВО СТАЛО 0 - АВТОМАТИЧЕСКИ УДАЛЯЕМ
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        
        saveCart(cart);
        renderCart();
        updateCartCounter();
    }
}

// ОЧИСТКА КОРЗИНЫ
function removeFromCart(index) {
    let cart = getCart();
    const itemName = cart[index].name;
    
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
    updateCartCounter();
    
    // Кастомное уведомление
    showCustomAlert('🗑️ Товар удалён');
}

// ОЧИСТКА КОРЗИНЫ (БЕЗ CONFIRM)
function clearCart() {
    saveCart([]);
    renderCart();
    updateCartCounter();
    showCustomAlert('🔄 Корзина очищена');
}

// Добавь функцию кастомного уведомления в machine_bag.js:
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
    }, 1500);
}

// ОТПРАВКА ЗАКАЗА В TELEGRAM
async function sendOrderToTelegram(orderData) {
    console.log('Отправка заказа в Telegram...');
    
    let message = `🛒 *НОВЫЙ ЗАКАЗ*\n\n`;
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
    
    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.chatId,
                text: message,
                parse_mode: 'Markdown'
            })
        });
        
        const result = await response.json();
        
        if (result.ok) {
            console.log('✅ Заказ отправлен!');
            return true;
        } else {
            alert(`❌ Ошибка Telegram: ${result.description}`);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Ошибка сети:', error);
        alert('❌ Ошибка сети');
        return false;
    }
}

// ВАЛИДАЦИЯ ФОРМЫ
function validateForm(contact) {
    if (!contact.trim()) {
        alert('Введите ваш Telegram или телефон');
        return false;
    }
    
    if (contact.trim().length < 3) {
        alert('Контактные данные слишком короткие');
        return false;
    }
    
    return true;
}

// ПЕРЕКЛЮЧЕНИЕ ИНФОРМАЦИИ
function toggleInfo() {
    const content = document.getElementById('info-content');
    const arrow = document.querySelector('.arrow');
    
    if (content && arrow) {
        const isOpen = content.classList.toggle('show');
        arrow.textContent = isOpen ? '▲' : '▼';
    }
}

// ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', function() {
    console.log('Инициализация корзины...');
    renderCart();
    updateCartCounter();
    
    // КНОПКА ОЧИСТКИ
    const clearCartBtn = document.getElementById('clear-cart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
    
    // ФОРМА ЗАКАЗА
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const cart = getCart();
            const contact = document.getElementById('contact').value.trim();
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            if (!validateForm(contact)) return;
            
            if (cart.length === 0) {
                alert('Корзина пуста!');
                return;
            }
            
            const orderData = {
                items: cart,
                total: total,
                contact: contact,
                timestamp: new Date().toISOString()
            };
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Отправка...';
            submitBtn.disabled = true;
            
            try {
                const success = await sendOrderToTelegram(orderData);
                
                if (success) {
                    alert('✅ Заказ оформлен! Свяжусь с вами в Telegram.');
                    saveCart([]);
                    window.location.href = 'index.html';
                } else {
                    alert('❌ Ошибка при отправке. Напишите @SKIANORAK');
                }
            } catch (error) {
                alert('❌ Произошла ошибка');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // КНОПКА ИНФОРМАЦИИ
    const infoBtn = document.querySelector('.info-dropdown-btn');
    if (infoBtn) {
        infoBtn.addEventListener('click', toggleInfo);
    }
});

