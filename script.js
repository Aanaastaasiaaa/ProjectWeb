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

    // РЕНДЕР КАТЕГОРИЙ
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

    // МОДАЛКА ЗАКАЗА
    const orderModal = document.getElementById('orderModal');
    const closeOrderModal = document.getElementById('closeOrderModal');
    const orderProduct = document.getElementById('orderProduct');
    const orderQuantity = document.getElementById('orderQuantity');
    const orderTotal = document.getElementById('orderTotal');

    function updateTotal() {
        const val = orderProduct.value;
        if (!val) { orderTotal.innerText = '0 ₽'; return; }
        const price = parseInt(val.split('|')[1]) || 0;
        const qty = parseInt(orderQuantity.value) || 1;
        orderTotal.innerText = (price * qty) + ' ₽';
    }

    orderProduct.addEventListener('change', updateTotal);
    orderQuantity.addEventListener('change', updateTotal);

    function openOrderModal(product = null) {
        if (product) {
            for (let opt of orderProduct.options) {
                if (opt.value.startsWith(product.name + '|')) {
                    opt.selected = true;
                    break;
                }
            }
            updateTotal();
        }
        orderModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    document.getElementById('orderFromProductBtn').addEventListener('click', () => {
        productModal.style.display = 'none';
        openOrderModal(window.currentProduct);
    });

    document.querySelectorAll('.order-trigger-main').forEach(btn => {
        btn.addEventListener('click', () => openOrderModal());
    });

    closeOrderModal.addEventListener('click', () => {
        orderModal.style.display = 'none';
        document.body.style.overflow = '';
    });

    document.getElementById('orderModalForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('orderName').value;
        const phone = document.getElementById('orderPhone').value;
        if (!name || !phone || !orderProduct.value) {
            alert('Заполните имя, телефон и выберите позицию');
            return;
        }
        alert(`Заказ отправлен!\nСумма: ${orderTotal.innerText}`);
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
