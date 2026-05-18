<?php
// HTTP-авторизация (как в задании 6)
$admin_user = 'admin';
$admin_pass = 'admin123';

if (!isset($_SERVER['PHP_AUTH_USER']) || $_SERVER['PHP_AUTH_USER'] != $admin_user || $_SERVER['PHP_AUTH_PW'] != $admin_pass) {
    header('WWW-Authenticate: Basic realm="Admin Panel"');
    header('HTTP/1.0 401 Unauthorized');
    echo 'Доступ запрещён';
    exit;
}

$host = 'localhost';
$dbname = 'u82277';
$user = 'u82277';
$pass = '1452026';

$pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
$orders = $pdo->query("SELECT * FROM orders ORDER BY id DESC")->fetchAll();
?>

<!DOCTYPE html>
<html>
<head>
    <title>Админ-панель</title>
    <style>
        table { width:100%; border-collapse: collapse; }
        th, td { border:1px solid #ddd; padding:8px; text-align:left; }
        th { background:#dc3545; color:white; }
    </style>
</head>
<body>
    <h1>Заказы</h1>
    <table>
        <thead>
            <tr><th>ID</th><th>Пользователь</th><th>Товары</th><th>Сумма</th><th>Статус</th><th>Дата</th></tr>
        </thead>
        <tbody>
            <?php foreach ($orders as $order): ?>
            <tr>
                <td><?= $order['id'] ?></td>
                <td><?= htmlspecialchars($order['user_id']) ?></td>
                <td><?= htmlspecialchars($order['items']) ?></td>
                <td><?= $order['total_price'] ?> ₽</td>
                <td><?= $order['status'] ?></td>
                <td><?= $order['created_at'] ?></td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</body>
</html>
