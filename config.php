<?php
// config.php
ini_set('display_errors', 0);
error_reporting(E_ALL);

define('DB_HOST', 'localhost');
define('DB_USER', 'u82277');      // твой логин
define('DB_PASS', 'твой_пароль');  // твой пароль
define('DB_NAME', 'u82277');       // твоя БД

function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER,
                DB_PASS,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
        } catch (PDOException $e) {
            error_log($e->getMessage());
            die("Сервер временно недоступен");
        }
    }
    return $pdo;
}
