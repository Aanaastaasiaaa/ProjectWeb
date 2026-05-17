document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен');

    // ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
    let currentProduct = null;
    const API_URL = '/api.php';

    // ========== ДАННЫЕ МЕНЮ (ПОЛНЫЙ КАТАЛОГ) ==========
    const menuData = {
        pizza: [
            { name: "Маргарита", description: "Томатный соус, моцарелла, свежий базилик", price: 450, image: "margarita.webp" },
            { name: "Пепперони", description: "Томатный соус, моцарелла, пепперони", price: 550, image: "peporoni.webp" },
            { name: "Четыре сыра", description: "Моцарелла, горгонзола, пармезан, фета", price: 600, image: "4cheese.jfif" },
            { name: "Гавайская", description: "Томатный соус, моцарелла, ветчина, ананас", price: 520, image: "gavai.jpg" },
            { name: "Мясная", description: "Ветчина, бекон, пепперони, говядина", price: 650, image: "m.webp" },
            { name: "Вегетарианская", description: "Перец, грибы, лук, оливки", price: 500, image: "v.jpeg" }
        ],
        pasta: [
            { name: "Карбонара", description: "Спагетти, бекон, яйцо, пармезан, сливочный соус", price: 420, image: "carbonara.jpg" },
            { name: "Болоньезе", description: "Спагетти, мясной соус из говядины, пармезан", price: 450, image: "bolognese.jpg" },
            { name: "Альфредо", description: "Феттуччини, курица, грибы, сливочный соус", price: 480, image: "alfredo.jpg" }
        ],
        salads: [
            { name: "Цезарь с курицей", description: "Курица, пармезан, сухарики, соус Цезарь", price: 350, image: "caesar.jpg" },
            { name: "Греческий", description: "Овощи, фета, оливки, оливковое масло", price: 320, image: "greek.jpg" }
        ],
        drinks: [
            { name: "Coca-Cola", description: "0.5 л", price: 120, image: "coca.jpg" },
            { name: "Лимонад", description: "Домашний, 0.5 л", price: 150, image: "lemonade.jpg" }
        ],
        desserts: [
            { name: "Тирамису", description: "Классический итальянский десерт", price: 280, image: "tiramisu.jpg" },
            { name: "Чизкейк", description: "Нежный сливочный чизкейк", price: 250, image: "cheesecake.jpg" }
        ]
    };

    // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    // ========== КАРТОЧКА ТОВАРА (МОДАЛЬНОЕ ОКНО) ==========
    function showProductModal(product) {
        currentProduct = product;

        // Создаём модальное окно, если его ещё нет
        let modal = document.getElementById('productModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'productModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content product-modal">
                    <button id="closeProductModal" class="modal-close">×</button>
                    <img id="productImage" src="" alt="">
                    <h3 id="productName"></h3>
                    <div class="product-description" id="productDesc"></div>
                    <div class="product-price" id="productPrice"></div>
                    <button id="orderFromProductBtn" class="btn">Заказать</button>
                </div>
            `;
            document.body.appendChild(modal);

            // Закрытие по крестику
            document.getElementById('closeProductModal').addEventListener('click', () => {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            });

            // Кнопка "Заказать" из карточки
            document.getElementById('orderFromProductBtn').addEventListener('click', () => {
                modal.style.display = 'none';
                document.body.style.overflow = '';
                openOrderModal(currentProduct.name, currentProduct.price);
            });

            // Закрытие по клику вне окна
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    document.body.style.overflow = '';
                }
            });
        }

        // Заполняем карточку данными
        document.getElementById('productImage').src = `images/${product.image}`;
        document.getElementById('productImage').alt = product.name;
        document.getElementById('productName').innerText = product.name;
        document.getElementById('productDesc').innerText = product.description;
        document.getElementById('productPrice').innerHTML = `${product.price} ₽`;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // ========== ЗАГРУЗКА МЕНЮ ПО КАТЕГОРИЯМ ==========
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
                <img src="images/${item.image}" alt="${item.name}" onerror="this.src='images/placeholder.jpg'">
                <div class="menu-item-content">
                    <h3 class="menu-item-title">${escapeHtml(item.name)}</h3>
                    <p>${escapeHtml(item.description)}</p>
                    <div class="menu-item-price">${item.price} ₽</div>
                    <button class="btn view-product-btn" data-name="${escapeHtml(item.name)}" data-price="${item.price}" data-desc="${escapeHtml(item.description)}" data-img="${item.image}">Подробнее</button>
                </div>
            `;
            container.appendChild(menuItem);
        });

        // Назначаем обработчики на кнопки "Подробнее"
        document.querySelectorAll('.view-product-btn').forEach(btn => {
            btn.removeEventListener('click', productButtonHandler);
            btn.addEventListener('click', productButtonHandler);
        });
    }

    function productButtonHandler(e) {
        e.preventDefault();
        const btn = e.currentTarget;
        const product = {
            name: btn.getAttribute('data-name'),
            price: parseInt(btn.getAttribute('data-price')),
            description: btn.getAttribute('data-desc'),
            image: btn.getAttribute('data-img')
        };
        showProductModal(product);
    }

    function loadAllCategories() {
        loadCategory('pizza', 'pizza-grid');
        loadCategory('pasta', 'pasta-grid');
        loadCategory('salads', 'salads-grid');
        loadCategory('drinks', 'drinks-grid');
        loadCategory('desserts', 'desserts-grid');
    }

    // ========== МОДАЛЬНОЕ ОКНО ЗАКАЗА ==========
    function openOrderModal(pizzaName = '', pizzaPrice = null) {
        if (pizzaPrice) currentProduct = { name: pizzaName, price: pizzaPrice };
        const modal = document.getElementById('orderModal');
        const pizzaSelect = document.getElementById('modalPizza');

        if (pizzaName && pizzaSelect) {
            for (let opt of pizzaSelect.options) {
                if (opt.value === pizzaName || opt.text.includes(pizzaName)) {
                    pizzaSelect.value = opt.value;
                    break;
                }
            }
        }
        updateOrderTotal();
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    function updateOrderTotal() {
        const totalSpan = document.getElementById('orderTotal');
        const quantitySelect = document.getElementById('modalQuantity');
        let quantity = 1;
        if (quantitySelect) quantity = parseInt(quantitySelect.value) || 1;
        let price = 450;
        if (currentProduct && currentProduct.price) price = currentProduct.price;
        const total = price * quantity;
        if (totalSpan) totalSpan.textContent = total + ' ₽';
    }

    function updateAddressField() {
        const deliverySelect = document.getElementById('modalDelivery');
        const addressField = document.getElementById('addressField');
        const addressInput = document.getElementById('modalAddress');
        if (deliverySelect && deliverySelect.value === 'Самовывоз') {
            if (addressField) addressField.style.display = 'none';
            if (addressInput) {
                addressInput.required = false;
                addressInput.value = 'Самовывоз: г. Москва, ул. Пиццерийная, д. 15';
            }
        } else {
            if (addressField) addressField.style.display = 'block';
            if (addressInput) {
                addressInput.required = true;
                addressInput.value = '';
            }
        }
    }

    // ========== ОТПРАВКА ЗАКАЗА ЧЕРЕЗ API ==========
    async function submitOrderViaAPI(formData) {
        const payload = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email') || '',
            pizza: formData.get('pizza'),
            size: formData.get('size'),
            quantity: parseInt(formData.get('quantity')) || 1,
            delivery_method: formData.get('delivery_method'),
            address: formData.get('address') || '',
            delivery_date: formData.get('delivery_date'),
            delivery_time: formData.get('delivery_time'),
            comment: formData.get('comment') || '',
            agreement: formData.get('agreement') === 'on',
            total: document.getElementById('orderTotal')?.textContent || '0'
        };

        const response = await fetch(API_URL + '/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            const msgContainer = document.getElementById('orderMessageContainer');
            if (msgContainer) {
                msgContainer.innerHTML = '<div class="message success">✅ Заказ успешно оформлен!</div>';
            }
            if (result.login && result.password) {
                showCredentials(result.login, result.password);
            }
            document.getElementById('orderModalForm')?.reset();
            setTimeout(() => {
                const modal = document.getElementById('orderModal');
                if (modal) modal.style.display = 'none';
                document.body.style.overflow = '';
            }, 3000);
            return true;
        } else {
            if (result.errors) {
                showValidationErrors(result.errors);
            } else if (result.error) {
                const msgContainer = document.getElementById('orderMessageContainer');
                if (msgContainer) {
                    msgContainer.innerHTML = `<div class="message error">❌ ${escapeHtml(result.error)}</div>`;
                }
            }
            return false;
        }
    }

    function showValidationErrors(errors) {
        const msgContainer = document.getElementById('orderMessageContainer');
        let errorHtml = '<div class="message error"><ul>';
        for (const [field, msg] of Object.entries(errors)) {
            errorHtml += `<li>${escapeHtml(msg)}</li>`;
        }
        errorHtml += '</ul></div>';
        if (msgContainer) msgContainer.innerHTML = errorHtml;
    }

    function showCredentials(login, password) {
        const credsModal = document.getElementById('credentialsModal');
        const credsContent = document.getElementById('credentialsContent');
        if (credsContent) {
            credsContent.innerHTML = `
                <p><strong>Логин:</strong> ${escapeHtml(login)}</p>
                <p><strong>Пароль:</strong> ${escapeHtml(password)}</p>
                <p style="margin-top:15px; color:#666;">Сохраните эти данные! Они показываются только один раз.</p>
            `;
        }
        if (credsModal) {
            credsModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    // ========== АВТОРИЗАЦИЯ ==========
    async function loginUser(login, password) {
        const response = await fetch(API_URL + '/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, password })
        });

        const result = await response.json();

        if (response.ok) {
            alert('Добро пожаловать, ' + result.user.full_name + '!');
            document.getElementById('authModal').style.display = 'none';
            document.body.style.overflow = '';
            addLogoutButton();
            return true;
        } else {
            const authMsg = document.getElementById('authMessage');
            if (authMsg) {
                authMsg.innerHTML = '<div class="message error">❌ ' + escapeHtml(result.error) + '</div>';
            }
            return false;
        }
    }

    function addLogoutButton() {
        const navContainer = document.querySelector('.nav-container');
        if (navContainer && !document.getElementById('logoutBtn')) {
            const logoutBtn = document.createElement('a');
            logoutBtn.id = 'logoutBtn';
            logoutBtn.href = '#';
            logoutBtn.className = 'btn login-btn';
            logoutBtn.textContent = 'Выйти';
            logoutBtn.onclick = (e) => {
                e.preventDefault();
                window.location.href = '?logout=1';
            };
            navContainer.appendChild(logoutBtn);
            const loginNavBtn = document.getElementById('loginNavBtn');
            if (loginNavBtn) loginNavBtn.style.display = 'none';
        }
    }

    // ========== НАВИГАЦИЯ ПО КАТЕГОРИЯМ ==========
    function setupCategoryButtons() {
        const buttons = document.querySelectorAll('.category-btn');
        const categories = ['pizza', 'pasta', 'salads', 'drinks', 'desserts'];

        buttons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const targetId = categories[index] + '-section';
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    function setupDropdownLinks() {
        const dropdownLinks = document.querySelectorAll('.dropdown-menu a, .mobile-dropdown a');
        dropdownLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                if (targetId && targetId !== '#') {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        });
    }

    // ========== СЛАЙДЕР ==========
    const slides = [
        { image: "images/з.webp", caption: "Наша фирменная печь на дровах" },
        { image: "images/ing.jpg", caption: "Свежие ингредиенты высшего качества" },
        { image: "images/kor.webp", caption: "Идеальная хрустящая корочка" }
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

    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    loadAllCategories();
    setupCategoryButtons();
    setupDropdownLinks();

    // Форма заказа
    const orderForm = document.getElementById('orderModalForm');
    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(orderForm);
            await submitOrderViaAPI(formData);
        });
    }

    document.getElementById('closeOrderModal')?.addEventListener('click', () => {
        document.getElementById('orderModal').style.display = 'none';
        document.body.style.overflow = '';
    });

    document.getElementById('modalDelivery')?.addEventListener('change', updateAddressField);
    updateAddressField();
    document.getElementById('modalQuantity')?.addEventListener('change', updateOrderTotal);

    document.getElementById('authForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const login = document.getElementById('authLogin').value;
        const password = document.getElementById('authPassword').value;
        await loginUser(login, password);
    });

    const authModal = document.getElementById('authModal');
    const loginNavBtn = document.createElement('a');
    loginNavBtn.id = 'loginNavBtn';
    loginNavBtn.href = '#';
    loginNavBtn.className = 'btn login-btn';
    loginNavBtn.textContent = 'Войти';
    loginNavBtn.onclick = (e) => {
        e.preventDefault();
        if (authModal) authModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };
    const desktopMenu = document.querySelector('.desktop-menu');
    if (desktopMenu) desktopMenu.appendChild(loginNavBtn);

    document.getElementById('closeAuthModal')?.addEventListener('click', () => {
        if (authModal) authModal.style.display = 'none';
        document.body.style.overflow = '';
    });

    const credsModal = document.getElementById('credentialsModal');
    document.getElementById('closeCredsModal')?.addEventListener('click', () => {
        if (credsModal) credsModal.style.display = 'none';
        document.body.style.overflow = '';
    });

    document.getElementById('copyCredentialsBtn')?.addEventListener('click', () => {
        const text = document.getElementById('credentialsContent')?.innerText;
        if (text) {
            navigator.clipboard.writeText(text);
            alert('Данные скопированы!');
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === document.getElementById('orderModal')) {
            document.getElementById('orderModal').style.display = 'none';
            document.body.style.overflow = '';
        }
        if (event.target === authModal) {
            if (authModal) authModal.style.display = 'none';
            document.body.style.overflow = '';
        }
        if (event.target === credsModal) {
            if (credsModal) credsModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });

    document.querySelectorAll('.mobile-dropdown-trigger').forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const dropdown = this.nextElementSibling;
            this.classList.toggle('active');
            if (dropdown) dropdown.classList.toggle('active');
        });
    });

    console.log('Скрипт инициализирован');
});
