// Конфигурация
const CONFIG = {
    // ЗАМЕНИТЕ 'YOUR_FORM_ID' на ваш реальный ID с Formcarry
    FORM_API_URL: 'https://formcarry.com/s/YOUR_FORM_ID',
    LOCAL_STORAGE_KEY: 'pizza_roma_data',
    DELIVERY_PRICE: 200,
    FREE_DELIVERY_MIN: 1500
};

// Данные пицц
const pizzas = [
    {
        id: 1,
        name: "Маргарита",
        description: "Томатный соус, сыр моцарелла, свежие томаты, базилик",
        price: 450,
        image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        category: "classic",
        badges: ["Хит"],
        weight: "550г",
        cookingTime: "15 мин"
    },
    {
        id: 2,
        name: "Пепперони",
        description: "Томатный соус, моцарелла, острая колбаса пепперони",
        price: 550,
        image: "https://images.unsplash.com/photo-1620374645498-af6bd681a0bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        category: "spicy",
        badges: ["Хит", "Острая"],
        weight: "600г",
        cookingTime: "18 мин"
    },
    {
        id: 3,
        name: "Четыре сыра",
        description: "Сыр моцарелла, пармезан, горгонзола, эмменталь",
        price: 600,
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        category: "classic",
        badges: ["Хит"],
        weight: "580г",
        cookingTime: "20 мин"
    },
    {
        id: 4,
        name: "Гавайская",
        description: "Томатный соус, моцарелла, ветчина, ананасы",
        price: 500,
        image: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        category: "special",
        badges: ["NEW"],
        weight: "570г",
        cookingTime: "16 мин"
    },
    {
        id: 5,
        name: "Мясная",
        description: "Томатный соус, моцарелла, ветчина, бекон, пепперони, говядина",
        price: 650,
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        category: "special",
        badges: ["Хит"],
        weight: "650г",
        cookingTime: "22 мин"
    },
    {
        id: 6,
        name: "Вегетарианская",
        description: "Томатный соус, моцарелла, болгарский перец, грибы, оливки, кукуруза",
        price: 480,
        image: "https://images.unsplash.com/photo-1593246049226-ded77bf90326?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        category: "vegetarian",
        badges: ["Vegan"],
        weight: "520г",
        cookingTime: "17 мин"
    },
    {
        id: 7,
        name: "Карбонара",
        description: "Сливочный соус, моцарелла, бекон, яйцо, пармезан",
        price: 580,
        image: "https://images.unsplash.com/photo-1595708684082-a173bb3a06c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        category: "special",
        badges: ["NEW"],
        weight: "590г",
        cookingTime: "19 мин"
    },
    {
        id: 8,
        name: "Диабло",
        description: "Острый томатный соус, моцарелла, салями, перец чили, халапеньо",
        price: 570,
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        category: "spicy",
        badges: ["Острая"],
        weight: "610г",
        cookingTime: "20 мин"
    },
    {
        id: 9,
        name: "Кальцоне",
        description: "Томатный соус, моцарелла, ветчина, грибы",
        price: 590,
        image: "https://images.unsplash.com/photo-1593246049226-ded77bf90326?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        category: "special",
        badges: ["NEW"],
        weight: "640г",
        cookingTime: "25 мин"
    }
];

// Глобальные переменные
let cart = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY + '_cart')) || [];
let currentSlide = 0;
let slideInterval;
let currentCategory = 'all';

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initSlider();
    initCart();
    initForm();
    initCategoryButtons();
    renderPizzas();
    updateCartCount();

    // Восстановление данных формы из LocalStorage
    restoreFormData();

    console.log('Pizza Roma инициализирован!');
});

// ========== МОБИЛЬНОЕ МЕНЮ ==========
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');

    if (!mobileMenuBtn || !mobileMenu) return;

    mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
    });

    mobileMenuClose.addEventListener('click', function() {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = 'auto';
    });

    // Закрытие меню при клике на ссылку
    document.querySelectorAll('.mobile-menu a').forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('open');
            document.body.style.overflow = 'auto';
        });
    });
}

// ========== СЛАЙДЕР ==========
function initSlider() {
    const slides = document.querySelector('.slider-slides');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    const totalSlides = document.querySelectorAll('.slider-slide').length;

    if (!slides || totalSlides === 0) return;

    function showSlide(index) {
        if (index >= totalSlides) {
            currentSlide = 0;
        } else if (index < 0) {
            currentSlide = totalSlides - 1;
        } else {
            currentSlide = index;
        }

        slides.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    function startSlider() {
        stopSlider();
        slideInterval = setInterval(nextSlide, 5000);
    }

    function stopSlider() {
        if (slideInterval) {
            clearInterval(slideInterval);
        }
    }

    // Обработчики кнопок
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            stopSlider();
            prevSlide();
            startSlider();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            stopSlider();
            nextSlide();
            startSlider();
        });
    }

    // Останавливаем автопрокрутку при наведении
    const slider = document.querySelector('.slider');
    if (slider) {
        slider.addEventListener('mouseenter', stopSlider);
        slider.addEventListener('mouseleave', startSlider);
    }

    // Запускаем слайдер
    startSlider();
}

// ========== КАТЕГОРИИ ==========
function initCategoryButtons() {
    const categoryButtons = document.querySelectorAll('.category-btn');

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;

            // Обновляем активную кнопку
            categoryButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Фильтруем пиццы
            filterPizzas(category);
        });
    });
}

function filterPizzas(category) {
    currentCategory = category;
    renderPizzas();
}

// ========== РЕНДЕР ПИЦЦ ==========
function renderPizzas() {
    const grid = document.getElementById('pizzasGrid');
    if (!grid) return;

    // Фильтруем пиццы по категории
    const filteredPizzas = currentCategory === 'all'
        ? pizzas
        : pizzas.filter(pizza => pizza.category === currentCategory);

    grid.innerHTML = filteredPizzas.map(pizza => `
        <div class="pizza-card">
            <div class="pizza-image">
                <img src="${pizza.image}" alt="${pizza.name}">
                ${pizza.badges ? `<div class="pizza-badges">${renderBadges(pizza.badges)}</div>` : ''}
            </div>
            <div class="pizza-info">
                <h3>${pizza.name}</h3>
                <p>${pizza.description}</p>
                <div class="pizza-meta">
                    <span><i class="fas fa-weight"></i> ${pizza.weight}</span>
                    <span><i class="fas fa-clock"></i> ${pizza.cookingTime}</span>
                </div>
                <div class="pizza-footer">
                    <span class="pizza-price">${pizza.price} ₽</span>
                    <button class="btn-add-to-cart" onclick="addToCart(${pizza.id})">
                        <i class="fas fa-plus"></i> В корзину
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderBadges(badges) {
    if (!badges) return '';

    return badges.map(badge => {
        let badgeClass = 'pizza-badge';
        if (badge === 'Хит') badgeClass += ' hit';
        if (badge === 'NEW') badgeClass += ' new';
        if (badge === 'Острая') badgeClass += ' spicy';
        if (badge === 'Vegan') badgeClass += ' vegetarian';

        return `<span class="${badgeClass}">${badge}</span>`;
    }).join('');
}

// ========== КОРЗИНА ==========
function initCart() {
    const cartIcon = document.querySelector('.cart-icon');
    const mobileCart = document.querySelector('.mobile-cart');
    const cartClose = document.querySelector('.cart-close');

    // Открытие корзины
    if (cartIcon) cartIcon.addEventListener('click', toggleCart);
    if (mobileCart) mobileCart.addEventListener('click', toggleCart);

    // Закрытие корзины
    if (cartClose) cartClose.addEventListener('click', toggleCart);

    // Закрытие при клике вне корзины
    document.addEventListener('click', function(event) {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartIcon = document.querySelector('.cart-icon');
        const mobileCart = document.querySelector('.mobile-cart');

        if (cartSidebar && cartSidebar.classList.contains('active')) {
            if (!cartSidebar.contains(event.target) &&
                !cartIcon.contains(event.target) &&
                !mobileCart.contains(event.target)) {
                toggleCart();
            }
        }
    });
}

function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    if (!cartSidebar) return;

    cartSidebar.classList.toggle('active');
    document.body.style.overflow = cartSidebar.classList.contains('active') ? 'hidden' : 'auto';

    if (cartSidebar.classList.contains('active')) {
        renderCartItems();
    }
}

function addToCart(pizzaId, size = '30') {
    const pizza = pizzas.find(p => p.id === pizzaId);
    if (!pizza) return;

    const existingItem = cart.find(item => item.id === pizzaId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: pizza.id,
            name: pizza.name,
            price: pizza.price,
            size: size,
            quantity: 1,
            image: pizza.image
        });
    }

    saveCart();
    updateCartCount();
    renderCartItems();

    // Показать уведомление
    showNotification(`Добавлена пицца "${pizza.name}"`);

    // Анимация добавления в корзину
    animateCartAdd();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartCount();
    renderCartItems();
}

function updateCartItem(index, change) {
    cart[index].quantity += change;

    if (cart[index].quantity <= 0) {
        removeFromCart(index);
    } else {
        saveCart();
        renderCartItems();
    }
}

function saveCart() {
    localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY + '_cart', JSON.stringify(cart));
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    document.querySelectorAll('.cart-count, .cart-count-mobile').forEach(el => {
        el.textContent = totalItems;
        el.style.display = totalItems > 0 ? 'flex' : 'none';
    });
}

function renderCartItems() {
    const cartItems = document.getElementById('cartItems');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const orderSummary = document.getElementById('orderSummary');
    const orderTotal = document.getElementById('orderTotal');

    if (!cartItems || !cartTotalPrice) return;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>Корзина пуста</p>
                <a href="#menu" class="btn-empty" onclick="toggleCart()">Посмотреть меню</a>
            </div>
        `;
        cartTotalPrice.textContent = '0 ₽';
        if (orderSummary) orderSummary.innerHTML = '<p class="empty-order">Добавьте пиццу в корзину</p>';
        if (orderTotal) orderTotal.textContent = '0 ₽';
        return;
    }

    let total = 0;
    let itemsHTML = '';
    let summaryHTML = '';

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        itemsHTML += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.size}см • ${item.price}₽</p>
                    <div class="cart-item-controls">
                        <button class="btn-quantity" onclick="updateCartItem(${index}, -1)">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="btn-quantity" onclick="updateCartItem(${index}, 1)">+</button>
                        <button class="btn-remove" onclick="removeFromCart(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="cart-item-price">
                    ${itemTotal} ₽
                </div>
            </div>
        `;

        summaryHTML += `
            <div class="summary-item">
                <span>${item.name} × ${item.quantity}</span>
                <span>${itemTotal} ₽</span>
            </div>
        `;
    });

    // Добавляем доставку
    const deliveryPrice = total >= CONFIG.FREE_DELIVERY_MIN ? 0 : CONFIG.DELIVERY_PRICE;
    const grandTotal = total + deliveryPrice;

    itemsHTML += `
        <div class="cart-delivery">
            <span>Доставка:</span>
            <span>${deliveryPrice === 0 ? 'Бесплатно' : deliveryPrice + ' ₽'}</span>
        </div>
    `;

    summaryHTML += `
        <div class="summary-item">
            <span>Доставка:</span>
            <span>${deliveryPrice === 0 ? 'Бесплатно' : deliveryPrice + ' ₽'}</span>
        </div>
    `;

    cartItems.innerHTML = itemsHTML;
    cartTotalPrice.textContent = grandTotal + ' ₽';

    if (orderSummary) orderSummary.innerHTML = summaryHTML;
    if (orderTotal) orderTotal.textContent = grandTotal + ' ₽';
}

function animateCartAdd() {
    const cartIcon = document.querySelector('.cart-icon');
    if (!cartIcon) return;

    cartIcon.style.transform = 'scale(1.2)';
    setTimeout(() => {
        cartIcon.style.transform = 'scale(1)';
    }, 300);
}

// ========== КОНТАКТЫ ==========
function toggleContacts() {
    const buttons = document.querySelectorAll('.nav-contacts-button');
    buttons.forEach(button => {
        button.classList.toggle('opened');
    });
}

// Закрытие при клике вне кнопки
document.addEventListener('click', function(event) {
    const buttons = document.querySelectorAll('.nav-contacts-button');
    buttons.forEach(button => {
        if (!button.contains(event.target)) {
            button.classList.remove('opened');
        }
    });
});

// ========== ФОРМА ЗАКАЗА ==========
function initForm() {
    const orderForm = document.getElementById('orderForm');
    const deliveryTimeSelect = document.getElementById('deliveryTime');
    const closeBtn = document.querySelector('.close-btn');
    const orderModal = document.getElementById('orderModal');

    if (!orderForm) return;

    // Показ поля для точного времени
    if (deliveryTimeSelect) {
        deliveryTimeSelect.addEventListener('change', function() {
            const specificTimeGroup = document.getElementById('specificTimeGroup');
            if (specificTimeGroup) {
                specificTimeGroup.style.display = this.value === 'specific' ? 'block' : 'none';
            }
        });
    }

    // Сохранение данных формы
    orderForm.addEventListener('input', saveFormData);

    // Отправка формы
    orderForm.addEventListener('submit', handleOrderSubmit);

    // Закрытие модального окна
    if (closeBtn) {
        closeBtn.addEventListener('click', closeOrderModal);
    }

    // Закрытие при клике вне модального окна
    if (orderModal) {
        orderModal.addEventListener('click', function(e) {
            if (e.target === orderModal) {
                closeOrderModal();
            }
        });
    }

    // Закрытие по ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && orderModal.style.display === 'block') {
            closeOrderModal();
        }
    });
}

function openOrderModal() {
    const orderModal = document.getElementById('orderModal');
    if (!orderModal) return;

    // Проверяем, есть ли товары в корзине
    if (cart.length === 0) {
        showNotification('Добавьте пиццу в корзину перед оформлением заказа');
        return;
    }

    // Обновляем итоговую сумму в форме
    renderCartItems();

    // Показываем модальное окно
    orderModal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Анимация появления с requestAnimationFrame
    animateModalOpen(orderModal.querySelector('.modal-content'));
}

function closeOrderModal() {
    const orderModal = document.getElementById('orderModal');
    if (!orderModal) return;

    // Анимация закрытия с requestAnimationFrame
    animateModalClose(orderModal.querySelector('.modal-content'), () => {
        orderModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
}

function saveFormData() {
    const form = document.getElementById('orderForm');
    if (!form) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY + '_form', JSON.stringify(data));
}

function restoreFormData() {
    const savedData = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY + '_form'));
    if (!savedData) return;

    const form = document.getElementById('orderForm');
    if (!form) return;

    Object.keys(savedData).forEach(key => {
        const element = form.elements[key];
        if (element) {
            if (element.type === 'checkbox' || element.type === 'radio') {
                element.checked = savedData[key] === element.value;
            } else {
                element.value = savedData[key];
            }
        }
    });

    // Обновляем видимость поля точного времени
    const deliveryTimeSelect = document.getElementById('deliveryTime');
    const specificTimeGroup = document.getElementById('specificTimeGroup');
    if (deliveryTimeSelect && specificTimeGroup) {
        specificTimeGroup.style.display = deliveryTimeSelect.value === 'specific' ? 'block' : 'none';
    }
}

async function handleOrderSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    const responseMessage = document.getElementById('responseMessage');

    // Валидация формы
    if (!validateForm(form)) {
        return;
    }

    // Блокировка кнопки и показ loader
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';

    // Сбор данных формы
    const formData = new FormData(form);
    const data = {
        ...Object.fromEntries(formData.entries()),
        cart: cart,
        total: document.getElementById('orderTotal').textContent,
        timestamp: new Date().toLocaleString('ru-RU'),
        orderNumber: 'PZ-' + Date.now().toString().slice(-6)
    };

    try {
        // Отправка на Formcarry
        const response = await fetch(CONFIG.FORM_API_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            // Успешная отправка
            showFormMessage('Заказ успешно оформлен! Мы свяжемся с вами для подтверждения.', 'success', responseMessage);

            // Очистка корзины
            cart = [];
            saveCart();
            updateCartCount();
            renderCartItems();

            // Сброс формы
            setTimeout(() => {
                form.reset();
                closeOrderModal();
                clearFormData();
                showNotification('Спасибо за заказ! Менеджер свяжется с вами в течение 10 минут.');
            }, 2000);

        } else {
            throw new Error('Ошибка сервера при отправке формы');
        }

    } catch (error) {
        // Обработка ошибки
        showFormMessage('Ошибка при отправке заказа. Пожалуйста, попробуйте еще раз или позвоните нам.', 'error', responseMessage);
        console.error('Order submission error:', error);

    } finally {
        // Разблокировка кнопки
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
    }
}

function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');

    // Сброс предыдущих ошибок
    clearFormErrors(form);

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'Это поле обязательно для заполнения');
            isValid = false;
        }

        // Валидация телефона
        if (field.type === 'tel' && field.value) {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
            if (!phoneRegex.test(field.value.replace(/\s/g, ''))) {
                showFieldError(field, 'Введите корректный номер телефона');
                isValid = false;
            }
        }
    });

    return isValid;
}

function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;

    // Удаляем старую ошибку если есть
    const existingError = formGroup.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }

    // Добавляем новую ошибку
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = 'color: var(--error-color); font-size: 12px; margin-top: 5px;';

    formGroup.appendChild(errorElement);
    field.style.borderColor = 'var(--error-color)';

    // Убираем ошибку при вводе
    field.addEventListener('input', function() {
        errorElement.remove();
        this.style.borderColor = '';
    }, { once: true });
}

function clearFormErrors(form) {
    form.querySelectorAll('.field-error').forEach(el => el.remove());
    form.querySelectorAll('input, textarea, select').forEach(el => {
        el.style.borderColor = '';
    });
}

function clearFormData() {
    localStorage.removeItem(CONFIG.LOCAL_STORAGE_KEY + '_form');
}

function showFormMessage(text, type, container) {
    if (!container) return;

    container.textContent = text;
    container.className = 'message ' + type;
    container.style.display = 'block';

    // Автоматическое скрытие сообщения через 5 секунд
    setTimeout(() => {
        container.style.display = 'none';
    }, 5000);
}

// ========== АНИМАЦИИ С REQUESTANIMATIONFRAME ==========
function animateModalOpen(element) {
    if (!element) return;

    let startTime = null;
    const duration = 300;

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);

        // Эффект easeOutBack
        const easing = (t) => {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        };

        const scale = easing(percentage);
        const opacity = percentage;

        element.style.transform = `scale(${scale})`;
        element.style.opacity = opacity;

        if (progress < duration) {
            requestAnimationFrame(animate);
        }
    }

    element.style.transform = 'scale(0.8)';
    element.style.opacity = '0';
    requestAnimationFrame(animate);
}

function animateModalClose(element, callback) {
    if (!element) return;

    let startTime = null;
    const duration = 200;

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);

        const scale = 1 - percentage * 0.2;
        const opacity = 1 - percentage;

        element.style.transform = `scale(${scale})`;
        element.style.opacity = opacity;

        if (progress < duration) {
            requestAnimationFrame(animate);
        } else {
            if (callback) callback();
        }
    }

    requestAnimationFrame(animate);
}

// ========== УВЕДОМЛЕНИЯ ==========
function showNotification(message) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: var(--primary-red);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 5px 15px rgba(230, 57, 70, 0.4);
        animation: slideInRight 0.3s ease-out, fadeOut 0.3s ease-out 2.7s forwards;
        max-width: 300px;
        font-weight: 500;
    `;

    document.body.appendChild(notification);

    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);

    // Добавляем CSS анимации
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ========== ПЛАВНАЯ ПРОКРУТКА ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const targetElement = document.querySelector(href);
        if (targetElement) {
            e.preventDefault();
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// ========== HISTORY API ==========
window.addEventListener('popstate', function(e) {
    // Обработка кнопки "Назад"
    const orderModal = document.getElementById('orderModal');
    if (orderModal && orderModal.style.display === 'block') {
        closeOrderModal();
    }
});

// Обновление URL при открытии модального окна
function updateHistoryState(state) {
    history.pushState({ modalOpen: true }, '', '#order');
}

// ========== ЗАГРУЗКА ИЗОБРАЖЕНИЙ ==========
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

// Предзагрузка изображений
async function preloadImages() {
    const imageUrls = pizzas.map(pizza => pizza.image);
    const promises = imageUrls.map(url => loadImage(url).catch(() => null));
    await Promise.all(promises);
}

// Запускаем предзагрузку после загрузки страницы
window.addEventListener('load', preloadImages);

// ========== АДАПТИВНОСТЬ ==========
function checkMobile() {
    return window.innerWidth <= 768;
}

// Обновление интерфейса при изменении размера окна
window.addEventListener('resize', function() {
    const isMobile = checkMobile();

    // Показываем/скрываем мобильную корзину
    const mobileCart = document.querySelector('.mobile-cart');
    const cartIcon = document.querySelector('.cart-icon');

    if (mobileCart && cartIcon) {
        if (isMobile) {
            cartIcon.style.display = 'none';
            mobileCart.style.display = 'flex';
        } else {
            cartIcon.style.display = 'flex';
            mobileCart.style.display = 'none';
        }
    }
});

// Инициализация адаптивности при загрузке
window.addEventListener('load', function() {
    window.dispatchEvent(new Event('resize'));
});