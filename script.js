document.addEventListener('DOMContentLoaded', function() {

    // ========== ДАННЫЕ МЕНЮ ==========
    const menuData = {
        pizza: [
            { name: "Маргарита", desc: "Томатный соус, моцарелла, свежий базилик", price: 450, image: "margarita.webp" },
            { name: "Пепперони", desc: "Томатный соус, моцарелла, пепперони", price: 550, image: "peporoni.webp" },
            { name: "Четыре сыра", desc: "Моцарелла, горгонзола, пармезан, фета", price: 600, image: "4cheese.jfif" },
            { name: "Гавайская", desc: "Томатный соус, моцарелла, ветчина, ананас", price: 520, image: "gavai.jpg" },
            { name: "Мясная", desc: "Ветчина, бекон, пепперони, говядина", price: 650, image: "m.webp" },
            { name: "Вегетарианская", desc: "Перец, грибы, лук, оливки", price: 500, image: "v.jpeg" }
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

    // ========== СОСТОЯНИЕ ==========
    let cart = [];
    let isLoggedIn = false;
    let currentUser = null;

    // ========== РЕНДЕР КАРТОЧЕК ==========
    function renderCategory(category, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        menuData[category].forEach(item => {
            const card = document.createElement('div');
            card.className = 'menu-item';
            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="menu-item-content">
                    <h3 class="menu-item-title">${item.name}</h3>
                    <p>${item.desc}</p>
                    <div class="menu-item-price">${item.price} ₽</div>
                    <button class="btn view-product-btn" data-name="${item.name}" data-price="${item.price}" data-desc="${item.desc}" data-img="${item.image}">Подробнее</button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    renderCategory('pizza', 'pizzaGrid');
    renderCategory('pasta', 'pastaGrid');
    renderCategory('salads', 'saladsGrid');
    renderCategory('drinks', 'drinksGrid');
    renderCategory('desserts', 'dessertsGrid');

    // ========== КОРЗИНА ==========
    function addToCart(name, price) {
        const existing = cart.find(i => i.name === name);
        if (existing) existing.qty++;
        else cart.push({ name, price, qty: 1 });
        renderCartDisplay();
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        renderCartDisplay();
    }

    function renderCartDisplay() {
        const container = document.getElementById('cartItems');
        const totalSpan = document.getElementById('orderTotal');
        if (!container) return;
        if (cart.length === 0) {
            container.innerHTML = 'Корзина пуста';
            if (totalSpan) totalSpan.innerText = '0';
            return;
        }
        let html = '', total = 0;
        cart.forEach((item, idx) => {
            total += item.price * item.qty;
            html += `<div class="cart-item"><span>${item.name} x${item.qty} = ${item.price * item.qty} ₽</span><button class="remove-item" data-index="${idx}">Удалить</button></div>`;
        });
        container.innerHTML = html;
        if (totalSpan) totalSpan.innerText = total;
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.index)));
        });
    }

    function renderModalMenu() {
        const container = document.getElementById('modalMenuList');
        if (!container) return;
        container.innerHTML = '';
        const allItems = [
            ...menuData.pizza.map(i => ({ name: i.name, price: i.price })),
            ...menuData.pasta.map(i => ({ name: i.name, price: i.price })),
            ...menuData.salads.map(i => ({ name: i.name, price: i.price })),
            ...menuData.drinks.map(i => ({ name: i.name, price: i.price })),
            ...menuData.desserts.map(i => ({ name: i.name, price: i.price }))
        ];
        allItems.forEach(item => {
            const row = document.createElement('div');
            row.className = 'menu-item-row';
            row.innerHTML = `<span>${item.name} - ${item.price} ₽</span><button class="add-to-cart-btn" data-name="${item.name}" data-price="${item.price}">+</button>`;
            container.appendChild(row);
        });
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', () => addToCart(btn.dataset.name, parseInt(btn.dataset.price)));
        });
    }

    // ========== МОДАЛЬНЫЕ ОКНА ==========
    const productModal = document.getElementById('productModal');
    const orderModal = document.getElementById('orderModal');
    const registerModal = document.getElementById('registerModal');
    const authModal = document.getElementById('authModal');
    const credsModal = document.getElementById('credsModal');

    // Показать товар
    document.querySelectorAll('.view-product-btn').forEach(btn => {
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

    document.getElementById('closeProductModal')?.addEventListener('click', () => {
        productModal.style.display = 'none';
        document.body.style.overflow = '';
    });

    document.getElementById('orderFromProductBtn')?.addEventListener('click', () => {
        productModal.style.display = 'none';
        if (!isLoggedIn) { alert('Сначала зарегистрируйтесь и войдите'); registerModal.style.display = 'flex'; return; }
        openOrderModal();
        addToCart(window.currentProduct.name, window.currentProduct.price);
    });

    function openOrderModal() {
        renderModalMenu();
        renderCartDisplay();
        orderModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    document.querySelectorAll('.order-trigger-main').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!isLoggedIn) { 
                registerModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                return;
            }
            openOrderModal();
        });
    });

    // ========== РЕГИСТРАЦИЯ ==========
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const phone = document.getElementById('regPhone').value;
        const email = document.getElementById('regEmail').value;
        const address = document.getElementById('regAddress').value;

        if (!name || !phone) {
            document.getElementById('registerMessage').innerHTML = '<div class="error">Заполните имя и телефон</div>';
            return;
        }

        try {
            const res = await fetch('/api.php/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, email, address })
            });
            const data = await res.json();
            if (res.ok) {
                document.getElementById('credsLogin').innerText = data.login;
                document.getElementById('credsPassword').innerText = data.password;
                registerModal.style.display = 'none';
                credsModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            } else {
                document.getElementById('registerMessage').innerHTML = `<div class="error">${data.error}</div>`;
            }
        } catch(err) {
            document.getElementById('registerMessage').innerHTML = '<div class="error">Ошибка соединения</div>';
        }
    });

    // ========== ВХОД ==========
    document.getElementById('authForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const login = document.getElementById('authLogin').value;
        const password = document.getElementById('authPassword').value;

        try {
            const res = await fetch('/api.php/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, password })
            });
            const data = await res.json();
            if (res.ok) {
                isLoggedIn = true;
                currentUser = data.user;
                document.getElementById('userDisplay').innerHTML = `👋 ${data.user.full_name}`;
                document.getElementById('orderBtn').style.display = 'inline-block';
                document.getElementById('mobileOrderBtn').style.display = 'inline-block';
                document.getElementById('loginBtn').style.display = 'none';
                document.getElementById('mobileLoginBtn').style.display = 'none';
                authModal.style.display = 'none';
                document.body.style.overflow = '';
                alert('Добро пожаловать!');
            } else {
                document.getElementById('authMessage').innerHTML = `<div class="error">${data.error}</div>`;
            }
        } catch(err) {
            document.getElementById('authMessage').innerHTML = '<div class="error">Ошибка соединения</div>';
        }
    });

    // ========== ОФОРМЛЕНИЕ ЗАКАЗА ==========
    document.getElementById('orderModalForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('orderName').value;
        const phone = document.getElementById('orderPhone').value;
        const email = document.getElementById('orderEmail').value;
        const address = document.getElementById('orderAddress').value;

        if (!name || !phone) { alert('Заполните имя и телефон'); return; }
        if (cart.length === 0) { alert('Добавьте позиции в корзину'); return; }

        const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
        const res = await fetch('/api.php/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, email, address, items: cart, total })
        });
        const data = await res.json();
        if (res.ok) {
            alert(`Заказ оформлен! Сумма: ${total} ₽`);
            cart = []; renderCartDisplay();
            orderModal.style.display = 'none';
            document.body.style.overflow = '';
        } else {
            alert('Ошибка: ' + (data.error || 'Неизвестно'));
        }
    });

    // ========== КНОПКИ ПЕРЕКЛЮЧЕНИЯ МОДАЛОК ==========
    document.getElementById('loginBtn').addEventListener('click', () => {
        authModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
    document.getElementById('mobileLoginBtn').addEventListener('click', () => {
        authModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
    document.getElementById('showRegFromLogin').addEventListener('click', (e) => {
        e.preventDefault();
        authModal.style.display = 'none';
        registerModal.style.display = 'flex';
    });
    document.getElementById('showLoginFromReg').addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.style.display = 'none';
        authModal.style.display = 'flex';
    });
    document.getElementById('goToLoginBtn').addEventListener('click', () => {
        credsModal.style.display = 'none';
        authModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    document.getElementById('closeRegisterModal')?.addEventListener('click', () => {
        registerModal.style.display = 'none';
        document.body.style.overflow = '';
    });
    document.getElementById('closeAuthModal')?.addEventListener('click', () => {
        authModal.style.display = 'none';
        document.body.style.overflow = '';
    });
    document.getElementById('closeCredsModal')?.addEventListener('click', () => {
        credsModal.style.display = 'none';
        document.body.style.overflow = '';
    });
    document.getElementById('closeOrderModal')?.addEventListener('click', () => {
        orderModal.style.display = 'none';
        document.body.style.overflow = '';
    });

    document.getElementById('copyCredsBtn')?.addEventListener('click', () => {
        const login = document.getElementById('credsLogin').innerText;
        const pass = document.getElementById('credsPassword').innerText;
        navigator.clipboard.writeText(`Логин: ${login}\nПароль: ${pass}`);
        alert('Данные скопированы!');
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
        slides.forEach((s, i) => {
            const div = document.createElement('div');
            div.className = 'slide';
            div.innerHTML = `<img src="${s.image}"><h3>${s.caption}</h3>`;
            sliderTrack.appendChild(div);
            const dot = document.createElement('div');
            dot.className = i === 0 ? 'slider-dot active' : 'slider-dot';
            dot.addEventListener('click', () => goToSlide(i));
            sliderDots.appendChild(dot);
        });
        function goToSlide(i) {
            currentSlide = i;
            sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
            document.querySelectorAll('.slider-dot').forEach((d, idx) => d.classList.toggle('active', idx === currentSlide));
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

    document.querySelectorAll('.mobile-dropdown-trigger').forEach(tr => {
        tr.addEventListener('click', e => {
            e.preventDefault();
            tr.nextElementSibling?.classList.toggle('active');
        });
    });
    document.querySelectorAll('.dropdown-menu a, .mobile-dropdown a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href?.startsWith('#')) {
                e.preventDefault();
                document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    window.addEventListener('click', (e) => {
        if (e.target === productModal) { productModal.style.display = 'none'; document.body.style.overflow = ''; }
        if (e.target === orderModal) { orderModal.style.display = 'none'; document.body.style.overflow = ''; }
        if (e.target === registerModal) { registerModal.style.display = 'none'; document.body.style.overflow = ''; }
        if (e.target === authModal) { authModal.style.display = 'none'; document.body.style.overflow = ''; }
        if (e.target === credsModal) { credsModal.style.display = 'none'; document.body.style.overflow = ''; }
    });
});
