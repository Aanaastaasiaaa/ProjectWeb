<?php
// functions.php
require_once 'config.php';

function validateOrderData($data) {
    $errors = [];
    
    if (empty($data['name'])) {
        $errors['name'] = 'Введите ваше имя';
    } elseif (strlen($data['name']) > 150) {
        $errors['name'] = 'Слишком длинное имя';
    }
    
    if (empty($data['phone'])) {
        $errors['phone'] = 'Введите телефон';
    } elseif (!preg_match('/^[\+\d\s\-\(\)]{10,20}$/', $data['phone'])) {
        $errors['phone'] = 'Неверный формат телефона';
    }
    
    if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Неверный email';
    }
    
    if (empty($data['pizza'])) {
        $errors['pizza'] = 'Выберите пиццу';
    }
    
    if (empty($data['agreement'])) {
        $errors['agreement'] = 'Подтвердите согласие';
    }
    
    return $errors;
}

function generateCredentials() {
    return [
        'login' => 'user_' . bin2hex(random_bytes(4)),
        'password' => bin2hex(random_bytes(8))
    ];
}
