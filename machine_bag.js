// НАСТРОЙКИ TELEGRAM
const TELEGRAM_CONFIG = {
    botToken: '7969220641:AAGCTj-G2kGav5g4QqR2yx2fV6KUpSByKWQ',
    chatId: '2038132122' // ЗАМЕНИТЬ на реальный Chat ID
};

// Получение корзины (только гостевая)
function getCart() {
    return JSON.parse(localStorage.getItem('cart_guest')) || [];
}

// Сохранение корзины (только гостевая)
function saveCart(cart) {
    localStorage.setItem('cart_guest', JSON.stringify(cart));
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
        
        // Добавляем миниатюру
        const productImage = item.image || 'default-image.jpg';
        
        itemEl.innerHTML = `
            <div class="cart-item-image">
                <img src="${productImage}" alt="${item.name}" 
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzIyMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7ihKIgSW1hZ2U8L3RleHQ+PC9zdmc+'" 
                     style="width:60px;height:60px;object-fit:cover;border-radius:4px;">
            </div>
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>${item.price} ₽ × ${item.quantity}</p>
                ${item.size ? `<p>Размер: ${item.size}</p>` : ''}
                <button class="remove-item" onclick="removeFromCart(${index})">Удалить</button>
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

// Функция отправки заказа в Telegram
async function sendOrderToTelegram(orderData) {
    console.log('📤 Отправка заказа в Telegram...');
    console.log('Данные заказа:', orderData);
    
    let message = ` *НОВЫЙ ЗАКАЗ* 🛒\n\n`;
    message += ` *Дата:* ${new Date().toLocaleString('ru-RU')}\n`;
    message += ` *Контакт:* ${orderData.contact}\n\n`;
    
    message += `*Состав заказа:*\n`;
    orderData.items.forEach((item, index) => {
        message += `${index + 1}. ${item.name}\n`;
        message += `   Размер: ${item.size || 'M'}\n`;
        message += `   Количество: ${item.quantity} шт.\n`;
        message += `   Цена: ${item.price} ₽ × ${item.quantity} = ${item.price * item.quantity} ₽\n\n`;
    });
    
    message += ` *Итого:* ${orderData.total} ₽\n`;
    message += ` *Доставка:* рассчитывается отдельно\n\n`;
    message += ` *Время заказа:* ${new Date().toLocaleTimeString('ru-RU')}`;

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

// Функция для открытия/закрытия информации
function toggleInfo() {
    const content = document.getElementById('info-content');
    const arrow = document.querySelector('.arrow');
    
    if (content && arrow) {
        const isOpen = content.classList.toggle('show');
        arrow.textContent = isOpen ? '▲' : '▼';
        console.log('Блок информации', isOpen ? 'открыт' : 'закрыт');
    }
}

// Инициализация корзины
document.addEventListener('DOMContentLoaded', function() {
    console.log('Инициализация корзины...');
    renderCart();
    updateCartCounter();
    
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
    
    // Обработчик для кнопки информации
    const infoBtn = document.querySelector('.info-dropdown-btn');
    if (infoBtn) {
        infoBtn.addEventListener('click', toggleInfo);
    }
    
});




