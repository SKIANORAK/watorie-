// ФУНКЦИИ ДЛЯ РАБОТЫ С КОРЗИНОЙ
function getCart() {
    return JSON.parse(localStorage.getItem('cart_guest')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart_guest', JSON.stringify(cart));
}

function updateCartCounter() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCounter = document.getElementById('cart-count');
    if (cartCounter) {
        cartCounter.textContent = totalItems;
    }
}

// КАСТОМНОЕ УВЕДОМЛЕНИЕ
function showCustomAlert(message) {
    const alert = document.getElementById('custom-alert');
    const alertText = document.querySelector('.alert-text');
    
    alertText.textContent = message;
    alert.classList.add('show');
    
    setTimeout(() => {
        alert.classList.remove('show');
    }, 2000);
}

// ФУНКЦИЯ ДОБАВЛЕНИЯ В КОРЗИНУ С АНИМАЦИЕЙ
function addToCart(productId, size = 'M', event) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    let cart = getCart();
    
    // Ищем товар с таким же ID и размером
    const existingItemIndex = cart.findIndex(item => 
        item.id === productId && item.size === size
    );
    
    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += 1;
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
    
    // АНИМАЦИЯ КНОПКИ
    const button = event.target;
    const card = button.closest('.product-card');
    
    // Показываем кнопки +/-
    const quantityControls = document.createElement('div');
    quantityControls.className = 'quantity-controls-inline';
    const currentQuantity = cart.find(item => item.id === productId && item.size === size)?.quantity || 1;
    
    quantityControls.innerHTML = `
        <button class="quantity-btn-inline minus" onclick="adjustCartQuantity(${productId}, '${size}', -1, this)">-</button>
        <span class="quantity-inline">${currentQuantity}</span>
        <button class="quantity-btn-inline plus" onclick="adjustCartQuantity(${productId}, '${size}', 1, this)">+</button>
    `;
    
    // Анимация
    button.style.opacity = '0';
    button.style.transform = 'translateX(-20px)';
    button.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
        button.style.display = 'none';
        button.parentElement.appendChild(quantityControls);
        
        quantityControls.style.opacity = '0';
        quantityControls.style.transform = 'translateX(20px)';
        
        setTimeout(() => {
            quantityControls.style.transition = 'all 0.3s ease';
            quantityControls.style.opacity = '1';
            quantityControls.style.transform = 'translateX(0)';
        }, 50);
    }, 300);
    
    // КАСТОМНОЕ УВЕДОМЛЕНИЕ
    showCustomAlert('Товар добавлен в корзину');
    updateCartCounter();
}

// РЕГУЛИРОВКА КОЛИЧЕСТВА НА ГЛАВНОЙ
function adjustCartQuantity(productId, size, change, button) {
    let cart = getCart();
    const existingItemIndex = cart.findIndex(item => 
        item.id === productId && item.size === size
    );
    
    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += change;
        
        if (cart[existingItemIndex].quantity <= 0) {
            cart.splice(existingItemIndex, 1);
            // Возвращаем обычную кнопку
            const controls = button.closest('.quantity-controls-inline');
            const card = controls.closest('.product-card');
            const addButton = card.querySelector('.add-to-cart');
            
            controls.style.opacity = '0';
            controls.style.transform = 'translateX(20px)';
            
            setTimeout(() => {
                controls.remove();
                addButton.style.display = 'block';
                addButton.style.opacity = '0';
                addButton.style.transform = 'translateX(-20px)';
                
                setTimeout(() => {
                    addButton.style.transition = 'all 0.3s ease';
                    addButton.style.opacity = '1';
                    addButton.style.transform = 'translateX(0)';
                }, 50);
            }, 300);
        } else {
            // Обновляем счетчик
            const quantitySpan = button.closest('.quantity-controls-inline').querySelector('.quantity-inline');
            if (quantitySpan) {
                quantitySpan.textContent = cart[existingItemIndex].quantity;
            }
        }
        
        saveCart(cart);
        updateCartCounter();
        showCustomAlert('Корзина обновлена');
    }
}

// СОЗДАНИЕ КАРТОЧЕК ТОВАРОВ
function renderProducts() {
    const grid = document.querySelector('.products-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    products.forEach(product => {
        const productImage = product.images ? product.images[0] : product.image;
        const isInCart = getCart().some(item => item.id === product.id);
        const cartItem = getCart().find(item => item.id === product.id);
        
        const productCard = `
            <div class="product-card">
                <a href="product_atorie.html?id=${product.id}" class="product-link">
                    <div class="product-image">
                        <img src="${productImage}" alt="${product.name}">
                    </div>
                    <div class="product-title">${product.name}</div>
                    <div class="product-price">${product.price} ₽</div>
                </a>
                <div class="add-to-cart-container">
                    ${isInCart ? `
                        <div class="quantity-controls-inline">
                            <button class="quantity-btn-inline minus" onclick="adjustCartQuantity(${product.id}, 'M', -1, this)">-</button>
                            <span class="quantity-inline">${cartItem.quantity}</span>
                            <button class="quantity-btn-inline plus" onclick="adjustCartQuantity(${product.id}, 'M', 1, this)">+</button>
                        </div>
                    ` : `
                        <button class="add-to-cart" onclick="addToCart(${product.id}, 'M', event)" data-id="${product.id}">
                            Добавить в корзину
                        </button>
                    `}
                </div>
            </div>
        `;
        grid.innerHTML += productCard;
    });
}

// ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', function() {
    console.log('Инициализация главной страницы...');
    renderProducts();
    updateCartCounter();
});
