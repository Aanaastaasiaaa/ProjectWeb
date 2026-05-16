// ========== ОЖИДАНИЕ ЗАГРУЗКИ DOM ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен');

    // ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
    let currentPizzaPrice = 450;
    const API_URL = '/api.php';

    // ========== ЗАГРУЗКА ПИЦЦ ИЗ БД ==========
    async function loadPizzasFromDB() {
        try {
            const response = await fetch(API_URL + '/pizzas');
            const pizzas = await response.json();
            
            const menuGrid = document.getElementById('menuGrid');
            const pizzaSelect = document.getElementById('modalPizza');
            if (!menuGrid) return;
            
            menuGrid.innerHTML = '';
            if (pizzaSelect) pizzaSelect.innerHTML = '<option value="">-- Выберите пиццу --</option>';
            
            pizzas.forEach(pizza => {
                // Добавляем карточку в меню
                const menuItem = document.createElement('div');
                menuItem.className = 'menu-item';
                menuItem.innerHTML = `
                    <img src="images/${pizza.image}" alt="${escapeHtml(pizza.name)}">
                    <div class="menu-item-content">
                        <h3 class="menu-item-title">${escapeHtml(pizza.name)}</h3>
                        <p>${escapeHtml(pizza.description)}</p>
                        <div class="menu-item-price">${pizza.price} ₽</div>
                        <button class="btn order-trigger" data-pizza="${escapeHtml(pizza.name)}" data-price="${pizza.price}">Заказать</button>
                    </div>
                `;
                menuGrid.appendChild(menuItem);
                
                // Добавляем в выпадающий список формы
                if (pizzaSelect) {
                    const option = document.createElement('option');
                    option.value = pizza.name;
                    option.textContent = `${pizza.name} - ${pizza.price} ₽`;
                    pizzaSelect.appendChild(option);
                }
            });
            
            // Переназначаем обработчики на кнопки "Заказать"
            document.querySelectorAll('.order-trigger').forEach(btn => {
                btn.removeEventListener('click', orderButtonHandler);
                btn.addEventListener('click', orderButtonHandler);
            });
        } catch (error) {
            console.error('Ошибка загрузки пицц:', error);
            // Если API не работает, используем статичные данные
            loadStaticPizzas();
        }
    }

    // Фолбек: если API не работает, грузим пиццы из статики
    function loadStaticPizzas() {
        const staticPizzas = [
            { name: "Маргарита", description: "Томатный соус, моцарелла, свежий базилик", price: 450, image: "margarita.webp" },
            { name: "Пепперони", description: "Томатный соус, моцарелла, пепперони", price: 550, image: "peporoni.webp" },
            { name: "Четыре сыра", description: "Моцарелла, горгонзола, пармезан, фета", price: 600, image: "4cheese.jfif" },
            { name: "Гавайская", description: "Томатный соус, моцарелла, ветчина, ананас", price: 520, image: "gavai.jpg" },
            { name: "Мясная", description: "Ветчина, бекон, пепперони, говядина", price: 650, image: "m.webp" },
            { name: "Вегетарианская", description: "Перец, грибы, лук, оливки", price: 500, image: "v.jpeg" }
        ];
        
        const menuGrid = document.getElementById('menuGrid');
        const pizzaSelect = document.getElementById('modalPizza');
        if (menuGrid) menuGrid.innerHTML = '';
        if (pizzaSelect) pizzaSelect.innerHTML = '<option value="">-- Выберите пиццу --</option>';
        
        staticPizzas.forEach(pizza => {
            if (menuGrid) {
                const menuItem = document.createElement('div');
                menuItem.className = 'menu-item';
                menuItem.innerHTML = `
                    <img src="images/${pizza.image}" alt="${pizza.name}">
                    <div class="menu-item-content">
                        <h3 class="menu-item-title">${pizza.name}</h3>
                        <p>${pizza.description}</p>
                        <div class="menu-item-price">${pizza.price} ₽</div>
                        <button class="btn order-trigger" data-pizza="${pizza.name}" data-price="${pizza.price}">Заказать</button>
                    </div>
                `;
                menuGrid.appendChild(menuItem);
            }
            if (pizzaSelect) {
                const option = document.createElement('option');
                option.value = pizza.name;
                option.textContent = `${pizza.name} - ${pizza.price} ₽`;
                pizzaSelect.appendChild(option);
            }
        });
        
        document.querySelectorAll('.order-trigger').forEach(btn => {
            btn.removeEventListener('click', orderButtonHandler);
            btn.addEventListener('click', orderButtonHandler);
        });
    }

    function orderButtonHandler(e) {
        e.preventDefault();
        const pizzaName = e.currentTarget.getAttribute('data-pizza');
        const pizzaPrice = parseInt(e.currentTarget.getAttribute('data-price'));
        openOrderModal(pizzaName, pizzaPrice);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    // ========== МОДАЛЬНОЕ ОКНО ЗАКАЗА ==========
    function openOrderModal(pizzaName = '', pizzaPrice = null) {
        if (pizzaPrice) currentPizzaPrice = pizzaPrice;
        
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
        const total = currentPizzaPrice * quantity;
        if (totalSpan) totalSpan.textContent = total + ' ₽';
    }

    // Показ адреса в зависимости от способа получения
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
            logoutBtn.style.background = '#ffd700';
            logoutBtn.style.color = '#333';
            logoutBtn.style.marginLeft = '15px';
            logoutBtn.onclick = (e) => {
                e.preventDefault();
                window.location.href = '?logout=1';
            };
            navContainer.appendChild(logoutBtn);
            
            // Скрываем кнопку "Войти", если есть
            const loginBtn = document.getElementById('loginNavBtn');
            if (loginBtn) loginBtn.style.display = 'none';
        }
    }

    // ========== СЛАЙДЕР (остаётся твой) ==========
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
            slideElement.innerHTML = `
                <img src="${slide.image}" alt="Slide ${index + 1}">
                <h3>${slide.caption}</h3>
            `;
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
        
        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            goToSlide(currentSlide);
        }
        
        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            goToSlide(currentSlide);
        }
        
        document.getElementById('sliderPrev')?.addEventListener('click', prevSlide);
        document.getElementById('sliderNext')?.addEventListener('click', nextSlide);
        goToSlide(0);
    }

    // ========== НАЗНАЧЕНИЕ ВСЕХ ОБРАБОТЧИКОВ ==========
    
    // Загружаем пиццы
    loadPizzasFromDB();
    
    // Форма заказа
    const orderForm = document.getElementById('orderModalForm');
    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(orderForm);
            await submitOrderViaAPI(formData);
        });
    }
    
    // Закрытие модалки заказа
    const closeOrderModal = document.getElementById('closeOrderModal');
    if (closeOrderModal) {
        closeOrderModal.addEventListener('click', () => {
            document.getElementById('orderModal').style.display = 'none';
            document.body.style.overflow = '';
        });
    }
    
    // Способ получения (адрес)
    const deliverySelect = document.getElementById('modalDelivery');
    if (deliverySelect) {
        deliverySelect.addEventListener('change', updateAddressField);
        updateAddressField();
    }
    
    // Обновление суммы при изменении количества
    const quantitySelect = document.getElementById('modalQuantity');
    if (quantitySelect) {
        quantitySelect.addEventListener('change', updateOrderTotal);
    }
    
    // Авторизация
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const login = document.getElementById('authLogin').value;
            const password = document.getElementById('authPassword').value;
            await loginUser(login, password);
        });
    }
    
    // Кнопка входа в меню
    const authModal = document.getElementById('authModal');
    const closeAuthModal = document.getElementById('closeAuthModal');
    
    const loginNavBtn = document.createElement('a');
    loginNavBtn.id = 'loginNavBtn';
    loginNavBtn.href = '#';
    loginNavBtn.className = 'btn login-btn';
    loginNavBtn.textContent = 'Войти';
    loginNavBtn.style.marginLeft = '15px';
    loginNavBtn.onclick = (e) => {
        e.preventDefault();
        if (authModal) authModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };
    
    const desktopMenu = document.querySelector('.desktop-menu');
    if (desktopMenu) {
        desktopMenu.appendChild(loginNavBtn);
    }
    
    if (closeAuthModal) {
        closeAuthModal.addEventListener('click', () => {
            if (authModal) authModal.style.display = 'none';
            document.body.style.overflow = '';
        });
    }
    
    // Модалка с креденшелами
    const credsModal = document.getElementById('credentialsModal');
    const closeCredsModal = document.getElementById('closeCredsModal');
    if (closeCredsModal) {
        closeCredsModal.addEventListener('click', () => {
            if (credsModal) credsModal.style.display = 'none';
            document.body.style.overflow = '';
        });
    }
    
    const copyBtn = document.getElementById('copyCredentialsBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = document.getElementById('credentialsContent')?.innerText;
            if (text) {
                navigator.clipboard.writeText(text);
                alert('Данные скопированы в буфер обмена!');
            }
        });
    }
    
    // Закрытие модалок по клику вне окна
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
    
    // Плавная прокрутка для якорей
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
    
    // Мобильное меню
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
