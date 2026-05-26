const express = require('express');
const mariadb = require('mariadb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la conexión a MariaDB basada en tu script
const pool = mariadb.createPool({
     host: 'localhost', 
     user: 'root',              
     password: '',   // Vacío si usas XAMPP por defecto
     database: 'outfitya_db',   
     connectionLimit: 5
});

// ============================================================
// ENDPOINT: Cargar Perfil de Usuario Real
// ============================================================
app.get('/api/perfil', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        // Consultamos un usuario real de tu tabla 'usuarios' junto con el nombre de su rol
        const query = `
            SELECT u.id_usuario, u.nombre, u.apellido, u.correo, r.nombre_rol 
            FROM usuarios u 
            INNER JOIN roles r ON u.id_rol = r.id_rol 
            WHERE u.correo = 'juan@correo.com' LIMIT 1`; // Simulamos al usuario logueado Juan
        
        const rows = await conn.query(query);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: "No se encontraron usuarios en la tabla." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.end();
    }
});

// ============================================================
// ENDPOINT: Léxico del Chatbot de Asistente Virtual (RF13)
// ============================================================
app.post('/api/chatbot', async (req, res) => {
    const { mensaje, id_usuario } = req.body;
    let conn;
    
    try {
        conn = await pool.getConnection();
        const textoUsuario = mensaje.toLowerCase();
        let respuestaBot = "";

        // Lógica de respuesta automatizada por palabras clave
        if (textoUsuario.includes('talla') || textoUsuario.includes('medida')) {
            respuestaBot = "Tu avatar 3D procesa estaturas entre 140cm y 210cm para calcular tu talla ideal.";
        } else if (textoUsuario.includes('pago') || textoUsuario.includes('pse') || textoUsuario.includes('paypal')) {
            respuestaBot = "Soportamos pasarelas de pago seguras como PayPal, PayU, MercadoPago y PSE de forma encriptada.";
        } else if (textoUsuario.includes('creadores') || textoUsuario.includes('autores')) {
            respuestaBot = "Outfitya fue desarrollado por los tecnólogos Juan Gómez, Gino Giacometto, Julia López y Elvira Loaiza.";
        } else {
            respuestaBot = "Hola, soy el asistente virtual de Outfitya. ¿Deseas consultar sobre el probador 3D o los métodos de pago?";
        }

        // PERSISTENCIA: Registramos la interacción en tu tabla oficial 'mensajes_asistente'
        // Primero aseguramos una sesión activa en 'sesiones_asistente' (id_sesion = 1 para pruebas locales)
        const checkSesion = await conn.query("SELECT id_sesion FROM sesiones_asistente LIMIT 1");
        let idSesion = checkSesion.length > 0 ? checkSesion[0].id_sesion : null;

        if (!idSesion) {
            const createSesion = await conn.query("INSERT INTO sesiones_asistente (id_usuario, canal) VALUES (?, 'WEB')", [id_usuario || 2]);
            idSesion = Number(createSesion.insertId);
        }

        // Guardamos el mensaje del usuario y del bot
        await conn.query("INSERT INTO mensajes_asistente (id_sesion, emisor, contenido) VALUES (?, 'USER', ?)", [idSesion, mensaje]);
        await conn.query("INSERT INTO mensajes_asistente (id_sesion, emisor, contenido) VALUES (?, 'BOT', ?)", [idSesion, respuestaBot]);

        res.json({ respuesta: respuestaBot });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error en el procesamiento del mensaje en DB." });
    } finally {
        if (conn) conn.end();
    }
});

app.listen(5234, () => {
    console.log("Servidor de Outfitya corriendo en http://localhost:5234");
});
app.post('/api/chatbot', async (req, res) => {
    const { mensaje } = req.body;
    let conn;
    
    try {
        conn = await pool.getConnection();
        const textoUsuario = mensaje.toLowerCase();
        
        // Consultamos si existe alguna palabra clave en el mensaje enviado
        const query = "SELECT respuesta FROM chatbot_lexico WHERE ? LIKE CONCAT('%', palabra_clave, '%') LIMIT 1";
        const rows = await conn.query(query, [textoUsuario]);
        
        if (rows.length > 0) {
            res.json({ respuesta: rows[0].respuesta });
        } else {
            res.json({ respuesta: "Lo siento, aún estoy aprendiendo sobre ese tema. ¿Podrías intentar con palabras como: envíos, devoluciones o seguridad?" });
        }
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor del chatbot" });
    } finally {
        if (conn) conn.end();
    }
});
// Ejemplo conceptual usando una API de procesamiento de lenguaje natural
app.post('/api/chatbot-ia', async (req, res) => {
    const { mensaje } = req.body;

    // Aquí definirías las reglas estrictas de su personalidad ("Prompt Engineering")
    const contextoDePersonalidad = `
      Eres Outfitya AI, el asistente virtual oficial de la plataforma de moda Outfitya.
      Fuiste creado por los tecnólogos Juan Gómez, Gino Giacometto, Julia López y Elvira Loaiza de la ficha 3186626 del SENA.
      Solo debes responder preguntas asociadas a: tallas de ropa, el probador biométrico 3D, envíos y soporte técnico de la página.
      Si te preguntan cosas ajenas a la moda o al software de Outfitya, rechaza responder amablemente.
      Tu tono debe ser profesional, vanguardista y muy educado.
    `;

    // Código para enviar el (contextoDePersonalidad + mensaje) a la API elegida...
    // const response = await api.generateText({ prompt: contextoDePersonalidad + mensaje });
    
    // res.json({ respuesta: response.text });
});

app.get('/api/perfil', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        // Traemos el primer perfil disponible para la simulación
        const query = "SELECT nombre, email, membresia, ciudad FROM usuarios_perfil LIMIT 1";
        const rows = await conn.query(query);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: "Perfil no encontrado" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.end();
    }
});

// 2. Endpoint para crear un nuevo Ticket de Compra Integral
app.post('/api/tickets', async (req, res) => {
    const { email, prenda, altura, peso } = req.body;
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `INSERT INTO tickets_compra (usuario_email, prenda_seleccionada, altura_biometrica, peso_biometrico) 
                       VALUES (?, ?, ?, ?)`;
        const result = await conn.query(query, [email, prenda, altura, peso]);
        
        // Retornamos el ID del ticket generado automáticamente por MariaDB
        res.status(201).json({ 
            status: "success", 
            message: "Ticket de compra creado con éxito",
            ticketId: Number(result.insertId)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.end();
    }
});

// ============================================================
// INICIALIZACIÓN DEL SERVIDOR
// ============================================================
const PORT = 5234; // El mismo puerto que usas en el frontend
app.listen(PORT, () => {
    console.log(`🚀 Servidor de Outfitya corriendo con éxito en http://localhost:${PORT}`);
});
password: 'SU_CONTRASENA_LOCAL'