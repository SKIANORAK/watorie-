

// Получение корзины (только гостевая)
function getCart() {
    return JSON.parse(localStorage.getItem('cart_guest')) || [];
}

// Сохранение корзины (только гостевая)
function saveCart(cart) {
    localStorage.setItem('cart_guest', JSON.stringify(cart));
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
});

