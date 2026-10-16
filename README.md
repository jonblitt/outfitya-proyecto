Outfiya
Plataforma e-commerce con probador biométrico 3D y persistencia en MariaDB.

Node
Express
MariaDB
License

Stack: HTML5 / CSS3 / Vanilla JS (desacoplado) + Node.js / Express + MariaDB (mysql2/promise)
Puerto: 5234
Estado: Conexión a BD verificada y guardando tickets (tickets_compra).

Características
Probador biométrico: Avatar que escala en tiempo real según altura (140-210cm) y peso (40-130kg). Cálculo de talla por IMC.
Catálogo por pisos térmicos: Cálido, Templado, Frío, Páramo. Filtros por piso, género y talla.
Carrito 4 pasos: Confirmación → Método de pago → Revisión → Ticket.
Chatbot: Respuestas desde tabla chatbot_lexico con fallbacks.
Separación de responsabilidades: Sin onclick en HTML. Todo evento vía addEventListener en outfiya.js.
Tecnologías
Frontend: HTML5, CSS3, JavaScript (SPA)
Backend: Node.js, Express 5.2.1, CORS
BD: MariaDB 12.3 / MySQL con mysql2/promise Pool
Tools: HeidiSQL, XAMPP/Laragon

Estructura
.
├── outfiya.html      # SPA 7 vistas
├── outfiya.css       # Estilos
├── outfiya.js        # Lógica desacoplada - API_BASE http://127.0.0.1:5000/api
├── server.js         # Backend Express puerto 5234
├── db.js             # Pool MariaDB
├── outfiya_mb.sql    # Schema 13 tablas
├── package.json
└── README.md
Instalación
1. Base de datos
mysql -u root -p < outfiya_mb.sql
# o importar outfiya_mb.sql desde HeidiSQL/phpMyAdmin
BD: outfitya_db - 13 tablas: usuarios, productos, tickets_compra, chatbot_lexico, etc.

2. Backend
npm install
node server.js
Servidor en:

http://localhost:5000
Logs esperados:

✅ Conexión establecida con éxito a MariaDB (outfitya_db).
🚀 Servidor backend corriendo en http://localhost:5000
3. Frontend
Abrir outfiya.html con Live Server o navegador. Hace fetch a http://127.0.0.1:5500/outfiya.html, con fallback a mock data si BD offline.

Configuración
Variables de entorno opcionales (.env):

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=outfitya_db
DB_PORT=3306
PORT=5234
API
Método	Endpoint	Descripción
GET	/api/productos?piso=CÁLIDO&genero=UNISEX	Listar productos
GET	/api/productos/:id	Detalle
POST	/api/chatbot	{ mensaje } → respuesta
POST	/api/tickets	{ email, prenda, altura, peso, id_usuario } → INSERT
Ejemplo POST /api/tickets:

{
  "email": "juan@correo.com",
  "prenda": "Camiseta Oversize Violet",
  "altura": 189,
  "peso": 85,
  "id_usuario": 1
}
Respuesta:

{ "success": true, "ticketId": 1 }
Verificación en BD:

SELECT * FROM tickets_compra;
Probador - Lógica
scaleY = altura / 170
scaleX = 1 + (peso - 65) / 110
IMC = peso / (altura/100)^2
Talla = S (<19), M (<25), L (<29), XL (>=29)
Licencia
MIT - Proyecto académico SENA ADSO 3186626.