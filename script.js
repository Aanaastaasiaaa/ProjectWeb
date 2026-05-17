// Ожидание загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен');

    // ========== ДАННЫЕ МЕНЮ (ПОЛНЫЙ КАТАЛОГ) ==========
    const menuData = {
        pizza: [
            { name: "Маргарита", description: "Томатный соус, моцарелла, свежий базилик", price: 450, image: "margarita.webp" },
            { name: "Пепперони", description: "Томатный соус, моцарелла, пепперони", price: 550, image: "peporoni.webp" },
            { name: "Четыре сыра", description: "Моцарелла, горгонзола, пармезан, фета", price: 600, image: "4cheese.jfif" },
            { name: "Гавайская", description: "Томатный соус, моцарелла, ветчина, ананас", price: 520, image: "gavai.jpg" },
            { name: "Мясная", description: "Томатный соус, моцарелла, ветчина, бекон, пепперони, говядина", price: 650, image: "m.webp" },
            { name: "Вегетарианская", description: "Томатный соус, моцарелла, перец, грибы, лук, оливки", price: 500, image: "v.jpeg" }
        ],
        pasta: [
            { name: "Карбонара", description: "Спагетти, бекон, яйцо, пармезан, сливочный соус", price: 420, image: "carbonara.jpg" },
            { name: "Болоньезе", description: "Спагетти, мясной соус из говядины, пармезан", price: 450, image: "bolognese.jpg" },
            { name: "Альфредо", description: "Феттуччини, курица, грибы, сливочный соус", price: 480, image: "alfredo.jpg" },
            { name: "Морская", description: "Спагетти, креветки, мидии, томатный соус", price: 550, image: "seafood.jpg" }
        ],
        salads: [
            { name: "Цезарь с курицей", description: "Курица, пармезан, сухарики, соус Цезарь", price: 350, image: "caesar.jpg" },
            { name: "Греческий", description: "Овощи, фета, оливки, оливковое масло", price: 320, image: "greek.jpg" },
            { name: "Салат с тунцом", description: "Тунец, яйцо, оливки, микс салатов", price: 380, image: "tuna.jpg" }
        ],
        drinks: [
            { name: "Coca-Cola", description: "0.5 л", price: 120, image: "coca.jpg" },
            { name: "Спрайт", description: "0.5 л", price: 120, image: "sprite.jpg" },
            { name: "Морс клюквенный", description: "Домашний, 0.5 л", price: 150, image: "mors.jpg" },
            { name: "Лимонад", description: "Домашний, 0.5 л", price: 150, image: "lemonade.jpg" }
        ],
        desserts: [
            { name: "Тирамису", description: "Классический итальянский десерт", price: 280, image: "tiramisu.jpg" },
            { name: "Чизкейк", description: "Нежный сливочный чизкейк", price: 250, image: "cheesecake.jpg" },
            { name: "Брауни с мороженым", description: "Горячий брауни, ванильное мороженое", price: 300, image: "brownie.jpg" }
        ]
    };

    // ========== ЗАГРУЗКА МЕНЮ ==========
    function loadCategory(category, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        const items = menuData[category];
        if (!items) return;

        items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='placeholder.jpg'">
                <div class="menu-item-content">
                    <h3 class="menu-item-title">${item.name}</h3>
                    <p>${item.description}</p>
                    <div class="menu-item-price">${item.price} ₽</div>
                    <button class="btn order-trigger" data-pizza="${item.name}" data-price="${item.price}">Заказать</button>
                </div>
            `;
            container.appendChild(menuItem);
        });
    }

    function loadAllCategories() {
        loadCategory('pizza', 'pizzaGrid');
        loadCategory('pasta', 'pastaGrid');
        loadCategory('salads', 'saladsGrid');
        loadCategory('drinks', 'drinksGrid');
        loadCategory('desserts', 'dessertsGrid');
    }

    loadAllCategories();

    // ========== СЛАЙДЕР (оставляем как есть) ==========
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
            const slideElement = document.createElement('div');
            slideElement.className = 'slide';
            slideElement.innerHTML = `<img src="${slide.image}" alt="Slide ${index + 1}"><h3>${slide.caption}</h3>`;
            sliderTrack.appendChild(slideElement);
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
            const dropdown = this.nextElementSibling;
            document.querySelectorAll('.mobile-dropdown').forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove('active');
                    d.previousElementSibling?.classList.remove('active');
                }
            });
            this.classList.toggle('active');
            dropdown.classList.toggle('active');
        });
    });

    // ========== МОДАЛЬНОЕ ОКНО ЗАКАЗА ==========
    const orderModal = document.getElementById('orderModal');
    const closeOrderModal = document.getElementById('closeOrderModal');

    const pizzaPrices = {
        'Маргарита': 450, 'Пепперони': 550, 'Четыре сыра': 600,
        'Гавайская': 520, 'Мясная': 650, 'Вегетарианская': 500,
        'Карбонара': 420, 'Болоньезе': 450, 'Альфредо': 480, 'Морская': 550,
        'Цезарь с курицей': 350, 'Греческий': 320, 'Салат с тунцом': 380,
        'Coca-Cola': 120, 'Спрайт': 120, 'Морс клюквенный': 150, 'Лимонад': 150,
        'Тирамису': 280, 'Чизкейк': 250, 'Брауни с мороженым': 300
    };

    const modalPizzaSelect = document.getElementById('modalPizza');
    const modalQuantitySelect = document.getElementById('modalQuantity');
    const orderTotalElement = document.getElementById('orderTotal');
    const addressField = document.getElementById('addressField');
    const modalDeliverySelect = document.getElementById('modalDelivery');

    function openOrderModal(pizzaName = '') {
        if (orderModal) {
            document.getElementById('orderModalForm').reset();
            document.getElementById('orderMessageContainer').innerHTML = '';
            if (pizzaName && modalPizzaSelect) {
                for (let option of modalPizzaSelect.options) {
                    if (option.text.includes(pizzaName) || option.value === pizzaName) {
                        modalPizzaSelect.value = option.value;
                        break;
                    }
                }
            }
            orderModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            calculateOrderTotal();
            updateAddressField();
        }
    }

    function calculateOrderTotal() {
        const selectedOption = modalPizzaSelect?.options[modalPizzaSelect.selectedIndex];
        const pizzaName = selectedOption ? selectedOption.value : '';
        const pizzaPrice = pizzaPrices[pizzaName] || 450;
        const quantity = parseInt(modalQuantitySelect?.value) || 1;
        if (orderTotalElement) orderTotalElement.textContent = (pizzaPrice * quantity) + ' ₽';
    }

    function updateAddressField() {
        if (modalDeliverySelect?.value === 'Самовывоз') {
            if (addressField) addressField.style.display = 'none';
            const addr = document.getElementById('modalAddress');
            if (addr) { addr.required = false; addr.value = 'Самовывоз: г. Москва, ул. Пиццерийная, д. 15'; }
        } else {
            if (addressField) addressField.style.display = 'block';
            const addr = document.getElementById('modalAddress');
            if (addr) { addr.required = true; addr.value = ''; }
        }
    }

    modalPizzaSelect?.addEventListener('change', calculateOrderTotal);
    modalQuantitySelect?.addEventListener('change', calculateOrderTotal);
    modalDeliverySelect?.addEventListener('change', updateAddressField);

    document.querySelectorAll('.order-trigger').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            openOrderModal(e.target.getAttribute('data-pizza'));
        });
    });

    closeOrderModal?.addEventListener('click', () => {
        if (orderModal) { orderModal.style.display = 'none'; document.body.style.overflow = ''; }
    });

    window.addEventListener('click', (event) => {
        if (event.target === orderModal) {
            orderModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    // ========== ПЛАВНАЯ ПРОКРУТКА ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    console.log('Скрипт инициализирован');
});
