<?php 

require_once '../controllers/ReservationController.php';

$uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

if ($uri === '/reservations' && $method === 'GET'){
    ReservationController::index();
} elseif ($uri === '/reservations' && $method === 'POST'){
    ReservationController::store();
}