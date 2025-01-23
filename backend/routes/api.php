<?php

require_once __DIR__ . '/../controllers/ReservationController.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];
$matches = [];

if ($uri === '/reservations' && $method === 'GET') {
    ReservationController::getAllReservations();
} elseif ($uri === '/reservations' && $method === 'POST'){
    ReservationController::createReservation();
} elseif (preg_match('/\/reservations\/(\d+)/', $uri, $matches) && $method === 'PUT') {
    ReservationController::updateReservation($matches[1]);
} elseif (preg_match('/\/reservations\/(\d+)/', $uri, $matches) && $method === 'DELETE') {
    ReservationController::deleteReservation($matches[1]);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Rota não encontrada'], JSON_UNESCAPED_UNICODE);
}
