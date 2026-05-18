document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен');

    // ========== ДАННЫЕ МЕНЮ ==========
    const menuData = {
        pizza: [
            { name: "Маргарита", price: 450, image: "margarita.webp" },
            { name: "Пепперони", price: 550, image: "peporoni.webp" },
            { name: "Четыре сыра", price: 600, image: "4cheese.jfif" },
            { name: "Гавайская", price: 520, image: "gavai.jpg" },
            { name: "Мясная", price: 650, image: "m.webp" },
            { name: "Вегетарианская", price: 500, image: "v.jpeg" }
        ],
        pasta: [
            { name: "Карбонара", price: 420, image: "carbonara.jpg" },
            { name: "Болоньезе", price: 450, image: "bolognese.jpg" }
        ],
        salads: [
            { name: "Цезарь", price: 350, image: "caesar.jpg" },
            { name: "Греческий", price: 320, image: "greek.jpg" }
        ],
        drinks: [
            { name: "Coca-Cola", price: 120, image: "coca.jpg" },
            { name: "Лимонад", price: 150, image: "lemonade.jpg" }
        ],
        desserts: [
            { name: "Тирамису", price: 280, image: "tiramisu.jpg" },
            { name: "Чизкейк", price: 250, image: "cheesecake.jpg" }
        ]
    };

    // ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
    let cart = [];

    // ========== РЕНДЕР МЕНЮ ==========
    function renderMainMenu() {
        const container = document.getElementById('menuGrid');
        if (!container) return;
        container.innerHTML = '';
        
        const allItems = [
            ...menuData.pizza.map(i => ({ ...i, cat: 'pizza' })),
            ...menuData.pasta.map(i => ({ ...i, cat: 'pasta' })),
            ...menuData.salads.map(i => ({ ...i, cat: 'salads' })),
            ...menuData.drinks.map(i => ({ ...i, cat: 'drinks' })),
            ...menuData.desserts.map(i => ({ ...i, cat: 'desserts' }))
        ];
        
        allItems.forEach(item => {
            const div = document.createElement('div');
            div.className = 'menu-item';
            div.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="menu-item-content">
                    <h3 class="menu-item-title">${item.name}</h3>
                    <div class="menu-item-price">${item.price} ₽</div>
                    <button class="btn add-to-main" data-name="${item.name}" data-price="${item.price}">В корзину</button>
                </div>
            `;
            container.appendChild(div);
        });
        
        document.querySelectorAll('.add-to-main').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.dataset.name;
                const price = parseInt(btn.dataset.price);
                addToCart(name, price);
                alert(`✅ ${name} добавлена в корзину`);
            });
        });
    }

    // ========== КОРЗИНА ==========
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
            const div = document.createElement('div');
            div.className = 'menu-item-row';
            div.innerHTML = `
                <span>${item.name} - ${item.price} ₽</span>
                <button class="add-to-cart-btn" data-name="${item.name}" data-price="${item.price}">+</button>
            `;
            container.appendChild(div);
        });
        
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.dataset.name;
                const price = parseInt(btn.dataset.price);
                addToCart(name, price);
                renderCartDisplay();
            });
        });
    }

    function addToCart(name, price) {
        const existing = cart.find(i => i.name === name);
        if (existing) {
            existing.qty++;
        } else {
            cart.push({ name, price, qty: 1 });
        }
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
        
        let html = '';
        let total = 0;
        cart.forEach((item, idx) => {
            total += item.price * item.qty;
            html += `
                <div class="cart-item">
                    <span>${item.name} x${item.qty} = ${item.price * item.qty} ₽</span>
                    <button class="remove-item" data-idx="${idx}">Удалить</button>
                </div>
            `;
        });
        container.innerHTML = html;
        if (totalSpan) totalSpan.innerText = total;
        
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                cart.splice(idx, 1);
                renderCartDisplay();
            });
        });
    }

    // ========== МОДАЛЬНОЕ ОКНО ЗАКАЗА ==========
    const orderModal = document.getElementById('orderModal');
    const closeOrderModal = document.getElementById('closeOrderModal');
    
    function openOrderModal() {
        renderModalMenu();
        renderCartDisplay();
        orderModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
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
        const name = document.getElementById('orderName').value;
        const phone = document.getElementById('orderPhone').value;
        
        if (!name || !phone) {
            alert('Заполните имя и телефон');
            return;
        }
        if (cart.length === 0) {
            alert('Добавьте хотя бы одну позицию');
            return;
        }
        
        const totalSpan = document.getElementById('orderTotal');
        alert(`Заказ оформлен!\n${cart.map(i => `${i.name} x${i.qty} = ${i.price * i.qty}₽`).join('\n')}\nИТОГО: ${totalSpan.innerText} ₽`);
        
        cart = [];
        renderCartDisplay();
        orderModal.style.display = 'none';
        document.body.style.overflow = '';
    });

    // ========== СЛАЙДЕР (твой, без изменений) ==========
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
            slideDiv.innerHTML = `<img src="${slide.image}"><h3>${slide.caption}</h3>`;
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
    
    // ========== МОБИЛЬНОЕ МЕНЮ ==========
    document.querySelectorAll('.mobile-dropdown-trigger').forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            this.nextElementSibling?.classList.toggle('active');
        });
    });
    
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
    
    // Инициализация
    renderMainMenu();
});
