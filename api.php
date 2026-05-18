<?php
header('Content-Type: application/json');

session_start();

// Подключение к БД (как в задании 5)
$host = 'localhost';
$dbname = 'u82277';
$user = 'u82277';
$pass = '1452026';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die(json_encode(['error' => 'DB connection failed']));
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// POST /api.php/orders - создание заказа
if ($method === 'POST' && $path === '/api.php/orders') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Простейшая валидация
    if (empty($data['name']) || empty($data['phone'])) {
        echo json_encode(['error' => 'Имя и телефон обязательны']);
        exit;
    }
    
    $pdo->beginTransaction();
    
    // Проверяем, есть ли пользователь в сессии (авторизован)
    if (isset($_SESSION['user_id'])) {
        $userId = $_SESSION['user_id'];
    } else {
        // Генерация логина и пароля (как в задании 5)
        $login = 'user_' . bin2hex(random_bytes(4));
        $password = bin2hex(random_bytes(8));
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        
        $stmt = $pdo->prepare("INSERT INTO users (full_name, phone, email, address, login, password_hash) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$data['name'], $data['phone'], $data['email'] ?? '', $data['address'] ?? '', $login, $passwordHash]);
        $userId = $pdo->lastInsertId();
        
        $_SESSION['new_credentials'] = ['login' => $login, 'password' => $password];
    }
    
    // Сохраняем заказ
    $itemsJson = json_encode($data['items']);
    $stmt = $pdo->prepare("INSERT INTO orders (user_id, items, total_price, status) VALUES (?, ?, ?, 'new')");
    $stmt->execute([$userId, $itemsJson, $data['total']]);
    $orderId = $pdo->lastInsertId();
    
    $pdo->commit();
    
    $response = ['success' => true, 'order_id' => $orderId];
    if (isset($_SESSION['new_credentials'])) {
        $response['login'] = $_SESSION['new_credentials']['login'];
        $response['password'] = $_SESSION['new_credentials']['password'];
        unset($_SESSION['new_credentials']);
    }
    
    echo json_encode($response);
    exit;
}

// POST /api.php/login - авторизация
if ($method === 'POST' && $path === '/api.php/login') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("SELECT * FROM users WHERE login = ?");
    $stmt->execute([$data['login']]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($data['password'], $user['password_hash'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['full_name'];
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Неверный логин или пароль']);
    }
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Not found']);
