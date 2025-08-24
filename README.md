<h1 align="center">
    Sistema de Gerenciamento de Reservas para Hotéis
</h1>

Sistema de reservas que permite cadastrar, visualizar e gerenciar reservas de quartos de hotel.   

## Recursos Principais   

- Criar reservas para diferentes quartos e horários.   
- Validação para evitar conflitos de reservas.
- Interface amigável com **SweetAlert2** e **FullCalendar.js**.
- API REST em **PHP** para persistência no banco de dados.   

## Tecnologias Utilizadas   

**Frontend**   

- HTML5, CSS3, JavaScript.   
- Biblioteca FullCalendar.js para exibição do calendário.   
- Biblioteca SweetAlert2 para modal interativo.   

**Backend**   

- **PHP puro** (sem frameworks)   
- banco de dados **MySQL**.   

## Estrutura de Pastas   

```   
sistema-reservas/
│── backend/             # Código do servidor PHP
│   ├── config/          # Configurações do banco de dados
│   │   ├── database.php # Conexão com MySQL
│   │   ├── config.php   # Definições globais (CORS, JWT)
│   ├── controllers/     # Lógica das rotas
│   │   ├── ReservationController.php
│   ├── models/         # Modelos de banco de dados
│   │   ├── Reservation.php
│   ├── routes/         # Arquivo com todas as rotas
│   │   ├── api.php
│   ├── public/         # Raiz acessível pelo servidor (index.php)
│   │   ├── index.php
│   ├── .env            # Configuração do ambiente
│   ├── composer.json   # Dependências PHP (caso use Composer)
│   ├── .htaccess       # Configuração do Apache
│── frontend/           # Código do cliente
│   ├── assets/         # Arquivos estáticos
│   │   ├── css/
│   │   │   ├── styles.css
│   │   ├── js/
│   │   │   ├── main.js # Manipulação do DOM e chamadas à API
│   │   │   ├── api.js  # Funções de requisição AJAX
│   │   ├── img/        # Imagens e ícones
│   ├── index.html      # Página principal
│── Dockerfile          # Configuração Docker
├── README.md
│── .gitignore          # Arquivos ignorados pelo Git
```   

## Como Executar o Projeto  

A aplicação pode ser executada de duas formas:   

## Opção 1: Modo Tradicional

**1. Clone o Repositório**   

```   
git clone https://github.com/Gilvan-R-A/hotel-reservation-app
cd hotel-reservation-system
``` 

**2. Configure o Backend**   

1. Instale um servidor PHP local (XAMPP, LAMPP ou Docker).   
2. Configure o arquivo .env com as credenciais do MySQL.   
3. Crie o banco de dados   

```   
CREATE DATABASE sistema_reservas;
```   

4. Selecione o banco de dados para começar a criar as tabelas      

```   
USE sistema_reservas;
```   
5. Crie a tabela de reservas (reservations)   

```   
CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_number INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```   

**3. Execute o Backend**   

```   
php -S localhost:8000 -t public
```   
Acesse http://localhost:8000/reservations para testar o backend. 

**4. Execute o Frontend**  

**Opções para executar o frontend**:   

- **PHP**:   

```   
cd frontend
php -S localhost:3000
```   
Acesse: http://localhost:3000

- **Python 3**:   

```   
cd frontend
python3 -m http.server 3000
```   
Acesse: http://localhost:3000

- **Node.js (npx serve)**:   

```   
cd frontend
npx serve .
```   
Acesse: http://localhost:3000

- **VS Code (Live Server)**:   

  - Abra **index.html** dentro da pasta frontend e inicie o **Live Server**

## Opção 2 : Usando Docker   

1. Clone o repositório   

```   
git clone https://github.com/Gilvan-R-A/hotel-reservation-app
cd hotel-reservation-system
```   

2. Configure o .env   
  - Crie um arquivo .env na raiz do projeto
  - Ajuste as variáveis conforme necessário:   

3. Suba os containers   

```   
docker-compose up --build
```   
4. Acesse a aplicação   
 - **Frontend:** http://localhost:3000
 - **backend:** http://localhost:10000

## Exemplos de Uso da API   

**1. Criar uma reserva**   

```   
POST http://localhost:8000/reservations
Content-Type: application/json

{
  "room_number": 10,
  "start_time": "2025-02-16 15:48:00",
  "end_time": "2025-02-16 19:52:00",
  "customer_name": "Gilvan",
  "customer_email": "gilvan@email.com"
}
```   

**2. Listar todas as reservas**   

```   
GET http://localhost:8000/reservations
```   

**3. Cancelar uma reserva**   

```  
DELETE http://localhost:8000/reservations/34
```   



