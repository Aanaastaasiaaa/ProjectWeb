// Ожидание загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен');

    // Данные для меню с ценами
    const menuItems = [
        {
            name: "Маргарита",
            description: "Томатный соус, моцарелла, свежий базилик",
            price: 450,
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80"
        },
        {
            name: "Пепперони",
            description: "Томатный соус, моцарелла, пепперони",
            price: 550,
            image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80"
        },
        {
            name: "Четыре сыра",
            description: "Моцарелла, горгонзола, пармезан, фета",
            price: 600,
            image: "https://images.unsplash.com/photo-1559978137-8c560d91e9e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80"
        },
        {
            name: "Гавайская",
            description: "Томатный соус, моцарелла, ветчина, ананас",
            price: 520,
            image: "https://images.unsplash.com/photo-1595703013566-db085ae93c04?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80"
        },
        {
            name: "Мясная",
            description: "Томатный соус, моцарелла, ветчина, бекон, пепперони, говядина",
            price: 650,
            image: "https://images.unsplash.com/photo-1552539618-7eec9f4e1556?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80"
        },
        {
            name: "Вегетарианская",
            description: "Томатный соус, моцарелла, перец, грибы, лук, оливки",
            price: 500,
            image: "https://images.unsplash.com/photo-1593246049226-ded77bf90326?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80"
        }
    ];

    // Данные для слайдера
    const slides = [
        {
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=500&q=80",
            caption: "Наша фирменная печь на дровах"
        },
        {
            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=500&q=80",
            caption: "Свежие ингредиенты высшего качества"
        },
        {
            image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=500&q=80",
            caption: "Идеальная хрустящая корочка"
        }
    ];

    // Инициализация меню
    const menuGrid = document.getElementById('menuGrid');
    if (menuGrid) {
        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="menu-item-content">
                    <h3 class="menu-item-title">${item.name}</h3>
                    <p>${item.description}</p>
                    <div class="menu-item-price">${item.price} ₽</div>
                    <button class="btn order-trigger" data-pizza="${item.name}" data-price="${item.price}">Заказать</button>
                </div>
            `;
            menuGrid.appendChild(menuItem);
        });
    }

    // Инициализация слайдера
    const sliderTrack = document.getElementById('sliderTrack');
    const sliderDots = document.getElementById('sliderDots');
    let currentSlide = 0;
    let slideInterval;

    if (sliderTrack && sliderDots) {
        // Создаем слайды
        slides.forEach((slide, index) => {
            const slideElement = document.createElement('div');
            slideElement.className = 'slide';
            slideElement.innerHTML = `
                <img src="${slide.image}" alt="Slide ${index + 1}">
                <h3>${slide.caption}</h3>
            `;
            sliderTrack.appendChild(slideElement);

            // Создаем точки
            const dot = document.createElement('div');
            dot.className = index === 0 ? 'slider-dot active' : 'slider-dot';
            dot.addEventListener('click', () => goToSlide(index));
            sliderDots.appendChild(dot);
        });

        // Запускаем автоматическое переключение
        slideInterval = setInterval(nextSlide, 4000);
    }

    // Функции слайдера
    function goToSlide(index) {
        if (!sliderTrack) return;

        currentSlide = index;
        sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

        // Обновляем активные точки
        document.querySelectorAll('.slider-dot').forEach((dot, i) => {
            if (i === currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
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

    // Управление слайдером
    const sliderPrev = document.getElementById('sliderPrev');
    const sliderNext = document.getElementById('sliderNext');

    if (sliderPrev) {
        sliderPrev.addEventListener('click', () => {
            prevSlide();
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 4000);
        });
    }

    if (sliderNext) {
        sliderNext.addEventListener('click', () => {
            nextSlide();
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 4000);
        });
    }

    // Раскрытие/скрытие выпадающего меню в мобильной версии
    document.querySelectorAll('.mobile-dropdown-trigger').forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const dropdown = this.nextElementSibling;

            // Закрываем другие открытые меню
            document.querySelectorAll('.mobile-dropdown').forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove('active');
                    d.previousElementSibling.classList.remove('active');
                }
            });

            // Переключаем текущее меню
            this.classList.toggle('active');
            dropdown.classList.toggle('active');
        });
    });

    // Эффект навигации при прокрутке
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Модальное окно заказа
    const orderModal = document.getElementById('orderModal');
    const closeOrderModal = document.getElementById('closeOrderModal');
    const orderTriggers = document.querySelectorAll('.order-trigger');
    const modalPizzaSelect = document.getElementById('modalPizza');
    const modalQuantitySelect = document.getElementById('modalQuantity');
    const orderTotalElement = document.getElementById('orderTotal');
    const addressField = document.getElementById('addressField');
    const modalDeliverySelect = document.getElementById('modalDelivery');

    // Цены для разных пицц
    const pizzaPrices = {
        'margarita': 450,
        'pepperoni': 550,
        'four_cheese': 600,
        'hawaii': 520,
        'meat': 650,
        'vegetarian': 500
    };

    // Расчет суммы заказа
    function calculateOrderTotal() {
        const pizzaPrice = pizzaPrices[modalPizzaSelect.value] || 450;
        const quantity = parseInt(modalQuantitySelect.value) || 1;
        const total = pizzaPrice * quantity;
        orderTotalElement.textContent = total + ' ₽';
    }

    // Обновление суммы при изменении выбора
    if (modalPizzaSelect) {
        modalPizzaSelect.addEventListener('change', calculateOrderTotal);
    }

    if (modalQuantitySelect) {
        modalQuantitySelect.addEventListener('change', calculateOrderTotal);
    }

    // Управление полем адреса в зависимости от способа получения
    if (modalDeliverySelect) {
        modalDeliverySelect.addEventListener('change', function() {
            const addressInput = document.getElementById('modalAddress');
            if (this.value === 'pickup') {
                addressField.style.display = 'none';
                addressInput.required = false;
                addressInput.value = 'Самовывоз: г. Москва, ул. Пиццерийная, д. 15';
            } else {
                addressField.style.display = 'block';
                addressInput.required = true;
                addressInput.value = '';
            }
        });
    }

    // Открытие модального окна заказа
    orderTriggers.forEach(button => {
        button.addEventListener('click', (e) => {
            // Если у кнопки есть данные о пицце (из карточки меню)
            const pizzaName = e.target.getAttribute('data-pizza');
            const pizzaPrice = e.target.getAttribute('data-price');

            if (orderModal) {
                // Сброс формы
                document.getElementById('orderModalForm').reset();
                document.getElementById('orderMessageContainer').innerHTML = '';

                // Если пицца выбрана из меню
                if (pizzaName) {
                    // Находим соответствующий option
                    for (let option of modalPizzaSelect.options) {
                        if (option.text.includes(pizzaName)) {
                            modalPizzaSelect.value = option.value;
                            break;
                        }
                    }
                }

                // Показываем модальное окно
                orderModal.style.display = 'flex';
                document.body.style.overflow = 'hidden'; // Блокируем скролл

                // Пересчитываем сумму
                calculateOrderTotal();

                // Управление полем адреса
                const deliverySelect = document.getElementById('modalDelivery');
                if (deliverySelect.value === 'pickup') {
                    addressField.style.display = 'none';
                    document.getElementById('modalAddress').required = false;
                    document.getElementById('modalAddress').value = 'Самовывоз: г. Москва, ул. Пиццерийная, д. 15';
                } else {
                    addressField.style.display = 'block';
                    document.getElementById('modalAddress').required = true;
                    document.getElementById('modalAddress').value = '';
                }
            }
        });
    });

    // Закрытие модального окна
    if (closeOrderModal) {
        closeOrderModal.addEventListener('click', () => {
            if (orderModal) {
                orderModal.style.display = 'none';
                document.body.style.overflow = ''; // Разблокируем скролл
            }
        });
    }

    // Закрытие модального окна при клике вне его
    window.addEventListener('click', (event) => {
        if (event.target === orderModal) {
            orderModal.style.display = 'none';
            document.body.style.overflow = ''; // Разблокируем скролл
        }
    });

    // Обработка формы заказа
    const orderModalForm = document.getElementById('orderModalForm');
    if (orderModalForm) {
        orderModalForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const messageContainer = document.getElementById('orderMessageContainer');
            const submitBtn = document.getElementById('modalSubmitBtn');

            // Проверка согласия с обработкой данных
            const agreeCheckbox = document.getElementById('modalAgree');
            if (!agreeCheckbox.checked) {
                messageContainer.innerHTML = `
                    <div class="message error">
                        ❌ Пожалуйста, согласитесь на обработку персональных данных
                    </div>
                `;
                return;
            }

            // Собираем данные заказа
            const orderData = {
                name: document.getElementById('modalName').value,
                phone: document.getElementById('modalPhone').value,
                email: document.getElementById('modalEmail').value,
                pizza: document.getElementById('modalPizza').value,
                size: document.getElementById('modalSize').value,
                quantity: document.getElementById('modalQuantity').value,
                delivery: document.getElementById('modalDelivery').value,
                address: document.getElementById('modalAddress').value,
                date: document.getElementById('modalDate').value,
                time: document.getElementById('modalHour').value,
                comments: document.getElementById('modalComments').value,
                total: orderTotalElement.textContent
            };

            console.log('Данные заказа:', orderData);

            // Показываем загрузку
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Оформление заказа...';

            // Имитируем отправку на сервер
            setTimeout(() => {
                // Показываем успешное сообщение
                messageContainer.innerHTML = `
                    <div class="message success">
                        ✅ Заказ успешно оформлен!<br>
                        <strong>Номер заказа: #${Math.floor(1000 + Math.random() * 9000)}</strong><br>
                        Ожидайте звонка от нашего оператора в течение 5 минут.<br>
                        Итоговая сумма: ${orderData.total}
                    </div>
                `;

                // Восстанавливаем кнопку
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Оформить заказ';

                // Очищаем форму
                orderModalForm.reset();

                // Закрываем модальное окно через 5 секунд
                setTimeout(() => {
                    if (orderModal) {
                        orderModal.style.display = 'none';
                        document.body.style.overflow = ''; // Разблокируем скролл
                    }
                    messageContainer.innerHTML = '';
                }, 5000);
            }, 2000);
        });
    }

    // Плавная прокрутка для всех ссылок с якорями
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

    console.log('Скрипт инициализирован');
});