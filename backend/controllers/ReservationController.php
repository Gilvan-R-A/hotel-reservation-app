<?php

require_once __DIR__ . '/../models/Reservation.php';

class ReservationController {

    public static function getAllReservations() {
        header('Content-Type: application/json; charset=utf-8');
        $reservations = Reservation::getAll();
        echo json_encode($reservations, JSON_UNESCAPED_UNICODE);
    }

    public static function createReservation() {
        header('Content-Type: application/json; charset=utf-8');
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['room_number'], $data['start_time'], $data['end_time'], $data['customer_name'], $data['customer_email'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Campos obrigatórios estão faltando.'], JSON_UNESCAPED_UNICODE);
            return;
        }

        if (strtotime($data['start_time']) >= strtotime($data['end_time'])) {
            http_response_code(400);
            echo json_encode(['error' => 'A data de início deve ser anterior à data de término.'], JSON_UNESCAPED_UNICODE);
            return;
        }

        $result =Reservation::create($data['room_number'], $data['start_time'], $data['end_time'], $data['customer_name'], $data['customer_email']);
        if ($result){
            http_response_code(201);
            echo json_encode(['message' => 'Reserva criada com sucesso.'], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao criar reserva.'], JSON_UNESCAPED_UNICODE);
        }
    }

    public static function updateReservation($id) {
        header('Content-Type: application/json; charset=utf-8');
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['room_number'], $data['start_time'], $data['end_time'], $data['customer_name'], $data['customer_email'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Campos obrigatórios estão faltando.'], JSON_UNESCAPED_UNICODE);
            return;
        }

        if (strtotime($data['start_time']) >= strtotime($data['end_time'])) {
            http_response_code(400);
            echo json_encode(['error' => 'A data de início deve ser anterior à data de término.'], JSON_UNESCAPED_UNICODE);
            return;
        }

        $result = Reservation::update($id, $data['room_number'], $data['start_time'], $data['end_time'], $data['customer_name'], $data['customer_email']);
        if ($result) {
            echo json_encode(['message' => 'Reserva atualizada com sucesso.'], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao atualizar reserva.'], JSON_UNESCAPED_UNICODE);
        }
    }

    public static function deleteReservation($id) {
        header('Content-Type: application/json; charset=utf-8');
        $result = Reservation::delete($id);
        if ($result) {
            echo json_encode(['message' => 'Reserva excluída com sucesso.'], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao excluir reserva.'], JSON_UNESCAPED_UNICODE);
        }
    }

}
