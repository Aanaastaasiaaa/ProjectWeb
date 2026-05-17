document.addEventListener('DOMContentLoaded', function() {

    // ========== ДАННЫЕ МЕНЮ ==========
    const menuData = {
        pizza: [
            { name: "Маргарита", desc: "Томатный соус, моцарелла, базилик", price: 450, image: "margarita.webp" },
            { name: "Пепперони", desc: "Томатный соус, моцарелла, пепперони", price: 550, image: "peporoni.webp" },
            { name: "Четыре сыра", desc: "Моцарелла, горгонзола, пармезан, фета", price: 600, image: "4cheese.jfif" }
        ],
        pasta: [
            { name: "Карбонара", desc: "Спагетти, бекон, сливочный соус", price: 420, image: "carbonara.jpg" }
        ],
        salads: [
            { name: "Цезарь", desc: "Курица, пармезан, соус Цезарь", price: 350, image: "caesar.jpg" }
        ],
        drinks: [
            { name: "Coca-Cola", desc: "0.5 л", price: 120, image: "coca.jpg" }
        ],
        desserts: [
            { name: "Тирамису", desc: "Классический итальянский десерт", price: 280, image: "tiramisu.jpg" }
        ]
    };

    // Рендер
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
                    <h3 class="menu-item-title">${item.name}</h3>
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

    // ========== МОДАЛЬНОЕ ОКНО ТОВАРА ==========
    const productModal = document.getElementById('productModal');
    const closeProductModal = document.getElementById('closeProductModal');

    document.querySelectorAll('.view-product').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            const price = btn.dataset.price;
            const desc = btn.dataset.desc;
            const img = btn.dataset.img;
            document.getElementById('productImage').src = img;
            document.getElementById('productName').innerText = name;
            document.getElementById('productDesc').innerText = desc;
            document.getElementById('productPrice').innerHTML = price + ' ₽';
            window.currentProduct = { name, price };
            productModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });

    closeProductModal?.addEventListener('click', () => {
        productModal.style.display = 'none';
        document.body.style.overflow = '';
    });

    // ========== МОДАЛЬНОЕ ОКНО ЗАКАЗА ==========
    const orderModal = document.getElementById('orderModal');
    const closeOrderModal = document.getElementById('closeOrderModal');
    const orderTotalSpan = document.getElementById('orderTotal');

    function openOrderModal(product = null) {
        if (product) {
            document.getElementById('orderTotal').innerText = product.price + ' ₽';
            window.currentOrderProduct = product;
        }
        orderModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    document.getElementById('orderFromProductBtn')?.addEventListener('click', () => {
        productModal.style.display = 'none';
        openOrderModal(window.currentProduct);
    });

    document.querySelectorAll('.order-trigger-main').forEach(btn => {
        btn.addEventListener('click', () => openOrderModal());
    });

    closeOrderModal?.addEventListener('click', () => {
        orderModal.style.display = 'none';
        document.body.style.overflow = '';
    });

    // Отправка заказа
    document.getElementById('orderModalForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        alert('Заказ отправлен! (демо-режим)');
        orderModal.style.display = 'none';
        document.body.style.overflow = '';
    });

    // ========== ПЛАВНАЯ ПРОКРУТКА ==========
    document.querySelectorAll('.dropdown-menu a, .mobile-dropdown a, .order-trigger-main').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Мобильное меню
    document.querySelectorAll('.mobile-dropdown-trigger').forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            this.nextElementSibling?.classList.toggle('active');
        });
    });

    // Закрытие модалок по клику вне окна
    window.addEventListener('click', (e) => {
        if (e.target === productModal) { productModal.style.display = 'none'; document.body.style.overflow = ''; }
        if (e.target === orderModal) { orderModal.style.display = 'none'; document.body.style.overflow = ''; }
        if (e.target === document.getElementById('authModal')) { document.getElementById('authModal').style.display = 'none'; document.body.style.overflow = ''; }
        if (e.target === document.getElementById('credentialsModal')) { document.getElementById('credentialsModal').style.display = 'none'; document.body.style.overflow = ''; }
    });
});
