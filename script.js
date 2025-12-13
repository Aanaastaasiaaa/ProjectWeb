// Ожидание загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен');

    // Данные для меню с ценами
    const menuItems = [
        {
            name: "Маргарита",
            description: "Томатный соус, моцарелла, свежий базилик",
            price: 450,
            image: "margarita.webp"
        },
        {
            name: "Пепперони",
            description: "Томатный соус, моцарелла, пепперони",
            price: 550,
            image: "peporoni.webp"
        },
        {
            name: "Четыре сыра",
            description: "Моцарелла, горгонзола, пармезан, фета",
            price: 600,
            image: "4cheese.jfif"
        },
        {
            name: "Гавайская",
            description: "Томатный соус, моцарелла, ветчина, ананас",
            price: 520,
            image: "gavai.jpg"
        },
        {
            name: "Мясная",
            description: "Томатный соус, моцарелла, ветчина, бекон, пепперони, говядина",
            price: 650,
            image: "m.webp"
        },
        {
            name: "Вегетарианская",
            description: "Томатный соус, моцарелла, перец, грибы, лук, оливки",
            price: 500,
            image: "v.jpeg"
        }
    ];

    // Данные для слайдера с РАБОЧИМИ изображениями
    const slides = [
        {
            image: "з.webp",
            caption: "Наша фирменная печь на дровах"
        },
        {
            image: "ing.jpg",
            caption: "Свежие ингредиенты высшего качества"
        },
        {
            image: "kor.webp",
            caption: "Идеальная хрустящая корочка"
        }
    ];

    // АЛЬТЕРНАТИВНЫЕ изображения для слайдера (если основные не работают)
    const fallbackSlides = [
        {
            image: "з.webp",
            caption: "Наша фирменная печь на дровах"
        },
        {
            image: "ing.jpg",
            caption: "Свежие ингредиенты высшего качества"
        },
        {
            image: "kor.webp",
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
                <img src="${item.image}" alt="${item.name}" loading="lazy">
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
    let slidesToUse = slides; // Используем основные слайды

    if (sliderTrack && sliderDots) {
        // Функция для проверки загрузки изображений
        function checkImageLoad(url) {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                img.src = url;
            });
        }

        // Проверяем загрузку первого изображения
        checkImageLoad(slides[0].image).then((loaded) => {
            // Если первое изображение не загрузилось, используем запасные
            if (!loaded) {
                console.log('Основные изображения не загружаются, используем запасные...');
                slidesToUse = fallbackSlides;
            }

            // Создаем слайды
            createSlides();
        }).catch(() => {
            // В случае ошибки используем запасные
            slidesToUse = fallbackSlides;
            createSlides();
        });

        function createSlides() {
            // Очищаем трек если что-то уже было
            sliderTrack.innerHTML = '';
            sliderDots.innerHTML = '';

            slidesToUse.forEach((slide, index) => {
                const slideElement = document.createElement('div');
                slideElement.className = 'slide';
                slideElement.innerHTML = `
                    <img src="${slide.image}" alt="Slide ${index + 1}" loading="lazy" onerror="this.onerror=null; this.src='https://via.placeholder.com/800x500/FF6B6B/FFFFFF?text=Pizza+Placeholder'">
                    <h3>${slide.caption}</h3>
                `;
                sliderTrack.appendChild(slideElement);

                // Создаем точки
                const dot = document.createElement('div');
                dot.className = index === 0 ? 'slider-dot active' : 'slider-dot';
                dot.addEventListener('click', () => goToSlide(index));
                sliderDots.appendChild(dot);
            });

            // Показываем первый слайд
            goToSlide(0);
        }
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
        currentSlide = (currentSlide + 1) % slidesToUse.length;
        goToSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slidesToUse.length) % slidesToUse.length;
        goToSlide(currentSlide);
    }

    // Управление слайдером
    const sliderPrev = document.getElementById('sliderPrev');
    const sliderNext = document.getElementById('sliderNext');

    if (sliderPrev) {
        sliderPrev.addEventListener('click', prevSlide);
    }

    if (sliderNext) {
        sliderNext.addEventListener('click', nextSlide);
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

    // Модальное окно заказа (форма Formcarry)
    const orderModal = document.getElementById('orderModal');
    const closeOrderModal = document.getElementById('closeOrderModal');

    // Цены для разных пицц
    const pizzaPrices = {
        'Маргарита': 450,
        'Пепперони': 550,
        'Четыре сыра': 600,
        'Гавайская': 520,
        'Мясная': 650,
        'Вегетарианская': 500
    };

    // Элементы формы
    const modalPizzaSelect = document.getElementById('modalPizza');
    const modalQuantitySelect = document.getElementById('modalQuantity');
    const orderTotalElement = document.getElementById('orderTotal');
    const addressField = document.getElementById('addressField');
    const modalDeliverySelect = document.getElementById('modalDelivery');

    // Функция для открытия модального окна
    function openOrderModal(pizzaName = '') {
        if (orderModal) {
            // Сброс формы
            document.getElementById('orderModalForm').reset();
            document.getElementById('orderMessageContainer').innerHTML = '';

            // Если передано название пиццы (при клике на "Заказать" в карточке)
            if (pizzaName) {
                // Находим соответствующий option
                for (let option of modalPizzaSelect.options) {
                    if (option.text.includes(pizzaName) || option.value === pizzaName) {
                        modalPizzaSelect.value = option.value;
                        break;
                    }
                }
            }

            // Показываем модальное окно
            orderModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            // Пересчитываем сумму
            calculateOrderTotal();

            // Управление полем адреса
            updateAddressField();
        }
    }

    // Расчет суммы заказа
    function calculateOrderTotal() {
        const selectedOption = modalPizzaSelect.options[modalPizzaSelect.selectedIndex];
        const pizzaName = selectedOption ? selectedOption.value : '';
        const pizzaPrice = pizzaPrices[pizzaName] || 450;
        const quantityValue = modalQuantitySelect.value;
        const quantity = parseInt(quantityValue) || 1;
        const total = pizzaPrice * quantity;
        orderTotalElement.textContent = total + ' ₽';
    }

    // Обновление поля адреса
    function updateAddressField() {
        if (modalDeliverySelect.value === 'Самовывоз') {
            addressField.style.display = 'none';
            document.getElementById('modalAddress').required = false;
            document.getElementById('modalAddress').value = 'Самовывоз: г. Москва, ул. Пиццерийная, д. 15';
        } else {
            addressField.style.display = 'block';
            document.getElementById('modalAddress').required = true;
            document.getElementById('modalAddress').value = '';
        }
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
        modalDeliverySelect.addEventListener('change', updateAddressField);
    }

    // Обработчики для ВСЕХ кнопок, открывающих форму
    document.querySelectorAll('.order-trigger').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();

            // Получаем данные о пицце, если кнопка на карточке
            const pizzaName = e.target.getAttribute('data-pizza');

            // Открываем модальное окно
            openOrderModal(pizzaName);
        });
    });

    // Закрытие модального окна
    if (closeOrderModal) {
        closeOrderModal.addEventListener('click', () => {
            if (orderModal) {
                orderModal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }

    // Закрытие модального окна при клике вне его
    window.addEventListener('click', (event) => {
        if (event.target === orderModal) {
            orderModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    // Обработка формы заказа
    const orderModalForm = document.getElementById('orderModalForm');
    if (orderModalForm) {
        orderModalForm.addEventListener('submit', async function(e) {
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

            // Показываем загрузку
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Отправка...';

            // Имитация отправки (для тестирования на GitHub)
            setTimeout(() => {
                // Показываем успешное сообщение
                messageContainer.innerHTML = `
                    <div class="message success">
                        ✅ Заказ успешно отправлен!<br>
                        <strong>Номер заказа: #${Math.floor(1000 + Math.random() * 9000)}</strong><br>
                        Ожидайте звонка от нашего оператора в течение 5 минут.<br>
                        Итоговая сумма: ${orderTotalElement.textContent}
                    </div>
                `;

                // Очищаем форму
                orderModalForm.reset();

                // Закрываем модальное окно через 5 секунд
                setTimeout(() => {
                    if (orderModal) {
                        orderModal.style.display = 'none';
                        document.body.style.overflow = '';
                    }
                    messageContainer.innerHTML = '';
                }, 5000);

                // Восстанавливаем кнопку
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Оформить заказ';
            }, 1500);
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