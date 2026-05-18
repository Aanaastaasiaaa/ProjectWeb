document.addEventListener('DOMContentLoaded', function() {

    // ДАННЫЕ МЕНЮ
    const menuData = {
        pizza: [
            { name: "Маргарита", desc: "Томатный соус, моцарелла, базилик", price: 450, image: "margarita.webp" },
            { name: "Пепперони", desc: "Томатный соус, моцарелла, пепперони", price: 550, image: "peporoni.webp" },
            { name: "Четыре сыра", desc: "Моцарелла, горгонзола, пармезан, фета", price: 600, image: "4cheese.jfif" }
        ],
        pasta: [
            { name: "Карбонара", desc: "Спагетти, бекон, сливочный соус", price: 420, image: "carbonara.jpg" },
            { name: "Болоньезе", desc: "Спагетти, мясной соус", price: 450, image: "bolognese.jpg" }
        ],
        salads: [
            { name: "Цезарь", desc: "Курица, пармезан, соус Цезарь", price: 350, image: "caesar.jpg" },
            { name: "Греческий", desc: "Овощи, фета, оливки", price: 320, image: "greek.jpg" }
        ],
        drinks: [
            { name: "Coca-Cola", desc: "0.5 л", price: 120, image: "coca.jpg" },
            { name: "Лимонад", desc: "0.5 л", price: 150, image: "lemonade.jpg" }
        ],
        desserts: [
            { name: "Тирамису", desc: "Классический итальянский десерт", price: 280, image: "tiramisu.jpg" },
            { name: "Чизкейк", desc: "Нежный сливочный", price: 250, image: "cheesecake.jpg" }
        ]
    };

    // РЕНДЕР МЕНЮ
    function renderCategory(cat, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        (menuData[cat] || []).forEach(item => {
            const div = document.createElement('div');
            div.className = 'menu-item';
            div.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="menu-item-content">
                    <h3>${item.name}</h3>
                    <p>${item.desc}</p>
                    <div class="menu-item-price">${item.price} ₽</div>
                    <button class="btn view-product" data-name="${item.name}" data-price="${item.price}" data-desc="${item.desc}" data-img="${item.image}">Подробнее</button>
                </div>
            `;
            container.appendChild(div);
        });
    }

    renderCategory('pizza', 'pizzaGrid');
    renderCategory('pasta', 'pastaGrid');
    renderCategory('salads', 'saladsGrid');
    renderCategory('drinks', 'drinksGrid');
    renderCategory('desserts', 'dessertsGrid');

    // ========== КОРЗИНА (ГЛОБАЛЬНОЕ СОСТОЯНИЕ) ==========
    let cart = [];

    function saveCart() {
        localStorage.setItem('pizzaCart', JSON.stringify(cart));
    }

    function loadCart() {
        const saved = localStorage.getItem('pizzaCart');
        if (saved) cart = JSON.parse(saved);
        renderCart();
    }

    function renderCart() {
        const container = document.getElementById('cartItems');
        const totalSpan = document.getElementById('orderTotal');
        if (!container) return;

        if (cart.length === 0) {
            container.innerHTML = '<div class="cart-empty">Корзина пуста</div>';
            if (totalSpan) totalSpan.innerText = '0 ₽';
            return;
        }

        let html = '';
        let total = 0;

        cart.forEach((item, idx) => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;
            html += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <strong>${item.name}</strong>
                        <span>${item.price} ₽ × ${item.qty} = ${itemTotal} ₽</span>
                    </div>
                    <button type="button" class="remove-item-btn" data-index="${idx}">✖</button>
                </div>
            `;
        });

        container.innerHTML = html;
        if (totalSpan) totalSpan.innerText = total + ' ₽';

        // Назначаем обработчики удаления
        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.dataset.index);
                cart.splice(idx, 1);
                renderCart();
                saveCart();
            });
        });
    }

    function addToCart(name, price, qty) {
        cart.push({ name: name, price: parseInt(price), qty: parseInt(qty) });
        renderCart();
        saveCart();
    }

    // ОЧИСТКА КОРЗИНЫ ПРИ УСПЕШНОМ ЗАКАЗЕ
    function clearCart() {
        cart = [];
        renderCart();
        saveCart();
    }

    // МОДАЛКА ТОВАРА
    const productModal = document.getElementById('productModal');
    const closeProductModal = document.getElementById('closeProductModal');

    document.querySelectorAll('.view-product').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('productImage').src = btn.dataset.img;
            document.getElementById('productName').innerText = btn.dataset.name;
            document.getElementById('productDesc').innerText = btn.dataset.desc;
            document.getElementById('productPrice').innerHTML = btn.dataset.price + ' ₽';
            window.currentProduct = { name: btn.dataset.name, price: btn.dataset.price };
            productModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });

    closeProductModal.addEventListener('click', () => {
        productModal.style.display = 'none';
        document.body.style.overflow = '';
    });

    // ОТКРЫТИЕ ФОРМЫ ЗАКАЗА
    const orderModal = document.getElementById('orderModal');
    const closeOrderModal = document.getElementById('closeOrderModal');

    function openOrderModal() {
        loadCart();
        orderModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    document.querySelectorAll('.order-trigger-main').forEach(btn => {
        btn.addEventListener('click', () => openOrderModal());
    });

    document.getElementById('orderFromProductBtn')?.addEventListener('click', () => {
        productModal.style.display = 'none';
        openOrderModal();
        // Добавляем товар из карточки в корзину
        if (window.currentProduct) {
            addToCart(window.currentProduct.name, window.currentProduct.price, 1);
        }
    });

    closeOrderModal.addEventListener('click', () => {
        orderModal.style.display = 'none';
        document.body.style.overflow = '';
    });

    // ДОБАВЛЕНИЕ ПОЗИЦИИ ИЗ ФОРМЫ
    document.getElementById('addItemBtn')?.addEventListener('click', () => {
        const select = document.getElementById('orderProductSelect');
        const qtyInput = document.getElementById('orderProductQty');
        const selected = select.value;
        if (!selected) {
            alert('Выберите позицию');
            return;
        }
        const [name, price] = selected.split('|');
        const qty = parseInt(qtyInput.value) || 1;
        addToCart(name, price, qty);
        select.value = '';
        qtyInput.value = '1';
    });

    // ОФОРМЛЕНИЕ ЗАКАЗА
    document.getElementById('orderModalForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('orderName').value;
        const phone = document.getElementById('orderPhone').value;
        const address = document.getElementById('orderAddress').value;

        if (!name || !phone) {
            alert('Заполните имя и телефон');
            return;
        }
        if (cart.length === 0) {
            alert('Добавьте хотя бы одну позицию в заказ');
            return;
        }

        const total = document.getElementById('orderTotal').innerText;
        alert(`✅ Заказ оформлен!\n\nКлиент: ${name}\nТелефон: ${phone}\nАдрес: ${address || 'Не указан'}\nСумма: ${total}\n\nСпасибо за заказ!`);
        
        clearCart();
        document.getElementById('orderName').value = '';
        document.getElementById('orderPhone').value = '';
        document.getElementById('orderEmail').value = '';
        document.getElementById('orderAddress').value = '';

        orderModal.style.display = 'none';
        document.body.style.overflow = '';
    });

    // ПЛАВНАЯ ПРОКРУТКА
    document.querySelectorAll('.dropdown-menu a, .mobile-dropdown a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // МОБИЛЬНОЕ МЕНЮ
    document.querySelectorAll('.mobile-dropdown-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            trigger.nextElementSibling?.classList.toggle('active');
        });
    });

    // ЗАКРЫТИЕ МОДАЛОК ПО КЛИКУ ВНЕ ОКНА
    window.addEventListener('click', (e) => {
        if (e.target === productModal) {
            productModal.style.display = 'none';
            document.body.style.overflow = '';
        }
        if (e.target === orderModal) {
            orderModal.style.display = 'none';
            document.body.style.overflow = '';
        }
        if (e.target === document.getElementById('authModal')) {
            document.getElementById('authModal').style.display = 'none';
            document.body.style.overflow = '';
        }
        if (e.target === document.getElementById('credentialsModal')) {
            document.getElementById('credentialsModal').style.display = 'none';
            document.body.style.overflow = '';
        }
    });

});
