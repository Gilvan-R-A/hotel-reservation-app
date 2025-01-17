<?php

require_once '../models/Reservation.php';

class ReservationController {

    public static function index () {
        $reservation = new Reservation();
        echo json_encode($reservation->getAllReservations());
    }

    public static function store() {
       $data = json_decode(file_get_contents('php://input'), true);
       $reservation = new Reservation();

       if ($reservation->checkConflict($data['start_time'], $data['end_time'], $data['room_number'] )){
            http_response_code(409);
            echo json_encode(['error' => 'Conflito de horário detectado.']);
            return;
       }

       if ($reservation->createReservation($data)){
            echo json_encode(['message' => 'Reserva criada com sucesso.']);
       } else {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao criar reserva.']);
       }
    }
}

