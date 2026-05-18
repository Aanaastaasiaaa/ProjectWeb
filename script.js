document.addEventListener('DOMContentLoaded', function() {

    // ========== ДАННЫЕ МЕНЮ ==========
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

    // ========== РЕНДЕР МЕНЮ ==========
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

    // ========== МОДАЛКА ТОВАРА ==========
    const productModal = document.getElementById('productModal');
    const closeProductModal = document.getElementById('closeProductModal');

    document.querySelectorAll('.view-product').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('productImage').src = btn.dataset.img;
            document.getElementById('productName').innerText = btn.dataset.name;
            document.getElementById('productDesc').innerText = btn.dataset.desc;
            document.getElementById('productPrice').innerHTML = btn.dataset.price + ' ₽';
            window.currentProduct = { name: btn.dataset.name, price: parseInt(btn.dataset.price) };
            productModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });

    closeProductModal.addEventListener('click', () => {
        productModal.style.display = 'none';
        document.body.style.overflow = '';
    });

    // ========== КОРЗИНА ==========
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
        const totalSpan = document.getElementById('cartTotal');
        if (!container) return;

        if (cart.length === 0) {
            container.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
            if (totalSpan) totalSpan.innerText = '0 ₽';
            return;
        }

        let html = '';
        let total = 0;
        cart.forEach((item, idx) => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;
            html += `
                <div class="cart-item" data-index="${idx}">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">${item.price} ₽</div>
                    </div>
                    <div class="cart-item-actions">
                        <input type="number" class="cart-item-qty" data-idx="${idx}" value="${item.qty}" min="1" style="width:60px">
                        <button class="cart-item-remove" data-idx="${idx}">Удалить</button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
        if (totalSpan) totalSpan.innerText = total + ' ₽';

        // Обработчики изменения количества
        document.querySelectorAll('.cart-item-qty').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.idx);
                const newQty = parseInt(e.target.value);
                if (!isNaN(newQty) && newQty > 0 && cart[idx]) {
                    cart[idx].qty = newQty;
                    saveCart();
                    renderCart();
                } else {
                    e.target.value = cart[idx]?.qty || 1;
                }
            });
        });

        // Обработчики удаления
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.dataset.idx);
                cart.splice(idx, 1);
                saveCart();
                renderCart();
            });
        });
    }

    function addToCart(name, price) {
        const existing = cart.find(item => item.name === name);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ name: name, price: price, qty: 1 });
        }
        saveCart();
        renderCart();
    }

    // ========== МОДАЛКА ЗАКАЗА ==========
    const orderModal = document.getElementById('orderModal');
    const closeOrderModal = document.getElementById('closeOrderModal');

    function openOrderModal(product = null) {
        loadCart();
        if (product) {
            addToCart(product.name, product.price);
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

    // Добавление позиции из выпадающего списка
    document.getElementById('addToCartBtn')?.addEventListener('click', () => {
        const select = document.getElementById('addProductSelect');
        const selected = select.value;
        if (!selected) {
            alert('Выберите позицию');
            return;
        }
        const qtyInput = document.getElementById('addProductQty');
        let qty = parseInt(qtyInput.value);
        if (isNaN(qty) || qty < 1) qty = 1;

        const [name, priceStr] = selected.split('|');
        const price = parseInt(priceStr);

        const existing = cart.find(item => item.name === name);
        if (existing) {
            existing.qty += qty;
        } else {
            cart.push({ name: name, price: price, qty: qty });
        }
        saveCart();
        renderCart();
        select.value = '';
        qtyInput.value = '1';
    });

    // Отправка заказа
    document.getElementById('orderModalForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('orderName').value.trim();
        const phone = document.getElementById('orderPhone').value.trim();

        if (!name || !phone) {
            alert('Заполните имя и телефон');
            return;
        }

        if (cart.length === 0) {
            alert('Добавьте хотя бы одну позицию в заказ');
            return;
        }

        const totalSpan = document.getElementById('cartTotal');
        alert(`Заказ оформлен!\nКлиент: ${name}\nТелефон: ${phone}\n${cart.map(i => `${i.name} x${i.qty} = ${i.price * i.qty}₽`).join('\n')}\nИТОГО: ${totalSpan.innerText}`);

        // Очистка корзины
        cart = [];
        saveCart();
        renderCart();
        orderModal.style.display = 'none';
        document.body.style.overflow = '';
    });

    // ========== СЛАЙДЕР ==========
    const slides = [
        { image: "з.webp", caption: "Наша фирменная печь на дровах" },
        { image: "ing.jpg", caption: "Свежие ингредиенты высшего качества" },
        { image: "kor.webp", caption: "Идеальная хрустящая корочка" }
    ];

    const sliderTrack = document.getElementById('sliderTrack');
    const sliderDots = document.getElementById('sliderDots');
    let currentSlide = 0;

    if (sliderTrack && sliderDots) {
        slides.forEach((slide, index) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'slide';
            slideDiv.innerHTML = `<img src="${slide.image}" alt="slide"><h3>${slide.caption}</h3>`;
            sliderTrack.appendChild(slideDiv);
            const dot = document.createElement('div');
            dot.className = index === 0 ? 'slider-dot active' : 'slider-dot';
            dot.addEventListener('click', () => goToSlide(index));
            sliderDots.appendChild(dot);
        });

        function goToSlide(index) {
            currentSlide = index;
            sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
            document.querySelectorAll('.slider-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === currentSlide);
            });
        }

        document.getElementById('sliderPrev')?.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            goToSlide(currentSlide);
        });
        document.getElementById('sliderNext')?.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % slides.length;
            goToSlide(currentSlide);
        });
        goToSlide(0);
    }

    // ========== ПЛАВНАЯ ПРОКРУТКА ==========
    document.querySelectorAll('.dropdown-menu a, .mobile-dropdown a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ========== МОБИЛЬНОЕ МЕНЮ ==========
    document.querySelectorAll('.mobile-dropdown-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            trigger.nextElementSibling?.classList.toggle('active');
        });
    });

    // ========== ЗАКРЫТИЕ МОДАЛОК ПО КЛИКУ ВНЕ ==========
    window.addEventListener('click', (e) => {
        if (e.target === productModal) {
            productModal.style.display = 'none';
            document.body.style.overflow = '';
        }
        if (e.target === orderModal) {
            orderModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

});
