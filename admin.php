<?php
// admin.php
$admin_login = 'admin';
$admin_password = 'admin123';

if (!isset($_SERVER['PHP_AUTH_USER']) || 
    $_SERVER['PHP_AUTH_USER'] !== $admin_login || 
    $_SERVER['PHP_AUTH_PW'] !== $admin_password) {
    header('WWW-Authenticate: Basic realm="Admin Panel"');
    header('HTTP/1.0 401 Unauthorized');
    exit;
}

require_once 'functions.php';
$pdo = getDB();

// Обновление статуса
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['order_id'])) {
    $stmt = $pdo->prepare("UPDATE pizza_orders SET status = ? WHERE id = ?");
    $stmt->execute([$_POST['status'], $_POST['order_id']]);
}

// Получаем заказы
$orders = $pdo->query("
    SELECT o.*, u.full_name, u.phone, u.address 
    FROM pizza_orders o
    JOIN pizza_users u ON o.user_id = u.id
    ORDER BY o.id DESC
")->fetchAll();

// Статистика
$stats = $pdo->query("
    SELECT pizza_name, COUNT(*) as total, SUM(total_price) as revenue
    FROM pizza_orders
    GROUP BY pizza_name
    ORDER BY total DESC
")->fetchAll();
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Админ-панель PizzaMania</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        h1 { color: #dc3545; margin-bottom: 20px; }
        h2 { margin: 20px 0 10px; color: #333; }
        table { width: 100%; border-collapse: collapse; background: white; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #dc3545; color: white; }
        tr:hover { background: #f9f9f9; }
        select { padding: 5px; }
        button { background: #28a745; color: white; border: none; padding: 5px 15px; cursor: pointer; }
        .stats { display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
        .stat-card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); min-width: 150px; }
        .stat-card .number { font-size: 2em; font-weight: bold; color: #dc3545; }
    </style>
</head>
<body>
    <h1>🍕 Админ-панель PizzaMania</h1>
    
    <div class="stats">
        <div class="stat-card">
            <div class="number"><?= count($orders) ?></div>
            <div>Всего заказов</div>
        </div>
    </div>
    
    <h2>Статистика по пиццам</h2>
    <table>
        <tr><th>Пицца</th><th>Заказов</th><th>Выручка</th></tr>
        <?php foreach ($stats as $s): ?>
        <tr><td><?= htmlspecialchars($s['pizza_name']) ?></td><td><?= $s['total'] ?></td><td><?= $s['revenue'] ?> ₽</td></tr>
        <?php endforeach; ?>
    </table>
    
    <h2>Все заказы</h2>
    <table>
        <tr><th>ID</th><th>Клиент</th><th>Телефон</th><th>Пицца</th><th>Кол-во</th><th>Сумма</th><th>Статус</th><th>Действие</th></tr>
        <?php foreach ($orders as $order): ?>
        <tr>
            <td><?= $order['id'] ?></td>
            <td><?= htmlspecialchars($order['full_name']) ?></td>
            <td><?= htmlspecialchars($order['phone']) ?></td>
            <td><?= htmlspecialchars($order['pizza_name']) ?></td>
            <td><?= $order['quantity'] ?></td>
            <td><?= $order['total_price'] ?> ₽</td>
            <td><?= $order['status'] ?></td>
            <td>
                <form method="POST">
                    <input type="hidden" name="order_id" value="<?= $order['id'] ?>">
                    <select name="status">
                        <option value="new">Новый</option>
                        <option value="processing">В обработке</option>
                        <option value="delivered">Доставлен</option>
                        <option value="cancelled">Отменён</option>
                    </select>
                    <button type="submit">Обновить</button>
                </form>
            </td>
        </tr>
        <?php endforeach; ?>
    </table>
</body>
</html>
