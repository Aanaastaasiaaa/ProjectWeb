<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();

// ========== ПОДКЛЮЧЕНИЕ К БД ==========
$host = 'localhost';
$dbname = 'u82277';      // ЗАМЕНИ НА СВОЮ БД
$username = 'u82277';     // ЗАМЕНИ НА СВОЙ ЛОГИН
$password = '1452026';    // ЗАМЕНИ НА СВОЙ ПАРОЛЬ

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['error' => 'Ошибка подключения к базе данных']);
    exit;
}

// ========== ФУНКЦИИ ==========
function generateCredentials() {
    return [
        'login' => 'user_' . bin2hex(random_bytes(4)),
        'password' => bin2hex(random_bytes(8))
    ];
}

// ========== ОБРАБОТЧИКИ ==========
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// РЕГИСТРАЦИЯ
if ($method === 'POST' && strpos($path, '/register') !== false) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['name']) || empty($data['phone'])) {
        echo json_encode(['error' => 'Имя и телефон обязательны']);
        exit;
    }
    
    $creds = generateCredentials();
    $login = $creds['login'];
    $passwordHash = password_hash($creds['password'], PASSWORD_DEFAULT);
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO users (full_name, phone, email, address, login, password_hash) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['name'],
            $data['phone'],
            $data['email'] ?? '',
            $data['address'] ?? '',
            $login,
            $passwordHash
        ]);
        
        echo json_encode([
            'success' => true,
            'login' => $login,
            'password' => $creds['password']
        ]);
    } catch(PDOException $e) {
        echo json_encode(['error' => 'Пользователь с таким телефоном уже существует']);
    }
    exit;
}

// ВХОД
if ($method === 'POST' && strpos($path, '/login') !== false) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE login = ?");
    $stmt->execute([$data['login']]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($data['password'], $user['password_hash'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['full_name'];
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'full_name' => $user['full_name'],
                'phone' => $user['phone'],
                'email' => $user['email'],
                'address' => $user['address']
            ]
        ]);
    } else {
        echo json_encode(['error' => 'Неверный логин или пароль']);
    }
    exit;
}

// ЗАКАЗ (только для авторизованных)
if ($method === 'POST' && strpos($path, '/orders') !== false) {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['error' => 'Не авторизован']);
        exit;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['name']) || empty($data['phone'])) {
        echo json_encode(['error' => 'Имя и телефон обязательны']);
        exit;
    }
    
    $itemsJson = json_encode($data['items'] ?? []);
    $total = $data['total'] ?? 0;
    
    $stmt = $pdo->prepare("
        INSERT INTO orders (user_id, items, total_price, status) 
        VALUES (?, ?, ?, 'new')
    ");
    $stmt->execute([$_SESSION['user_id'], $itemsJson, $total]);
    
    echo json_encode(['success' => true, 'order_id' => $pdo->lastInsertId()]);
    exit;
}

echo json_encode(['error' => 'Неизвестный запрос']);
