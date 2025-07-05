<?php
try{
    $pdo = new PDO("sqlite:" . __DIR__ . "/database/reservas.db");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = "
    CREATE TABLE IF NOT EXISTS reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_number INTEGER NOT NULL, 
        start_time TEXT NOT NULL, 
        end_time TEXT NOT NULL, 
        customer_name TEXT NOT NULL, 
        customer_email TEXT NOT NULL, 
        created_at TEXT DEFAULT CURRENT_TIMESTAMP, 
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        ";

        $pdo->exec($sql);
        echo "Banco de dados e tabela criados com sucesso!";
} catch (PDOException $e) {
    echo "Erro ao criar o banco de dados: " . $e->getMessage();
}

