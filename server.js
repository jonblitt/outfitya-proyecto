// server.js - Outfiya Backend
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const SESION_DURACION_MS = 8 * 60 * 60 * 1000;
const sesiones = new Map();

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const ROLES_PERSONAL = ['ADMINISTRADOR', 'PLANTA', 'PUNTO'];

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false;
  if (!stored.startsWith('scrypt$')) return String(password) === stored;
  const parts = stored.split('$');
  if (parts.length !== 3) return false;
  try {
    const actual = crypto.scryptSync(String(password), parts[1], 64);
    const expected = Buffer.from(parts[2], 'hex');
    return expected.length === actual.length && crypto.timingSafeEqual(actual, expected);
  } catch (_) {
    return false;
  }
}

function nombreYApellido(nombreCompleto) {
  const piezas = String(nombreCompleto || '').trim().split(/\s+/).filter(Boolean);
  return { nombre: piezas.shift() || '', apellido: piezas.join(' ') };
}

function requireWorker(req, res, next) {
  (async () => {
    const auth = String(req.headers.authorization || '');
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    const sesion = sesiones.get(token);
    if (!token || !sesion || sesion.expiresAt < Date.now()) {
      if (token) sesiones.delete(token);
      return res.status(401).json({ error: 'Sesión vencida. Inicia sesión de nuevo.' });
    }

    const [rows] = await db.execute(`
      SELECT U.id_usuario, U.nombre, U.apellido, U.correo, U.activo, R.nombre_rol AS role
      FROM usuarios U JOIN roles R ON R.id_rol = U.id_rol
      WHERE U.id_usuario = ? LIMIT 1
    `, [sesion.id_usuario]);

    const user = rows[0];
    if (!user || Number(user.activo) !== 1 || !ROLES_PERSONAL.includes(user.role)) {
      sesiones.delete(token);
      return res.status(403).json({ error: 'Acceso no autorizado.' });
    }
    req.worker = { id_usuario: user.id_usuario, nombre: user.nombre, apellido: user.apellido, email: user.correo, role: user.role };
    return next();
  })().catch(err => res.status(500).json({ error: 'Error al validar sesión.' }));
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.worker || !roles.includes(req.worker.role)) {
      return res.status(403).json({ error: 'Permisos insuficientes.' });
    }
    return next();
  };
}

// Subir imagen
app.post('/api/upload', upload.single('imagen'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo.' });
  res.json({ success: true, url: `http://localhost:3000/uploads/${req.file.filename}` });
});

// Login
app.post('/api/trabajadores/login', async (req, res) => {
  const correo = String(req.body?.correo || '').trim().toLowerCase();
  const contrasena = String(req.body?.contrasena || '');
  try {
    const [rows] = await db.execute(`
      SELECT U.id_usuario, U.nombre, U.apellido, U.correo, U.contrasena, U.activo, R.nombre_rol AS role
      FROM usuarios U JOIN roles R ON R.id_rol = U.id_rol
      WHERE LOWER(U.correo) = ? LIMIT 1
    `, [correo]);
    const user = rows[0];
    if (!user || Number(user.activo) !== 1 || !ROLES_PERSONAL.includes(user.role) || !verifyPassword(contrasena, user.contrasena)) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    sesiones.set(token, { id_usuario: user.id_usuario, expiresAt: Date.now() + SESION_DURACION_MS });
    res.json({ token, usuario: { id_usuario: user.id_usuario, nombre: user.nombre, apellido: user.apellido, email: user.correo, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: 'Error de servidor.' });
  }
});

app.get('/api/trabajadores/sesion', requireWorker, (req, res) => res.json({ usuario: req.worker }));

app.get('/api/trabajadores', requireWorker, requireRoles('ADMINISTRADOR'), async (req, res) => {
  const [rows] = await db.execute(`
    SELECT U.id_usuario, U.nombre, U.apellido, U.correo, U.activo, R.nombre_rol AS role
    FROM usuarios U JOIN roles R ON R.id_rol = U.id_rol
    WHERE R.nombre_rol IN ('ADMINISTRADOR', 'PLANTA', 'PUNTO')
  `);
  res.json(rows);
});

// Obtener inventario
app.get('/api/trabajadores/inventario', requireWorker, requireRoles(...ROLES_PERSONAL), async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT I.id_inventario AS id, I.id_inventario, I.id_producto,
             P.nombre AS producto_nombre, I.talla, I.color, I.stock,
             COALESCE(I.sku, CONCAT('OUT-', I.id_producto, '-', I.talla, '-', I.color)) AS sku
      FROM inventario_producto I
      JOIN productos P ON P.id_producto = I.id_producto
      WHERE P.activo = 1
      ORDER BY P.id_producto DESC, I.talla
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Error al consultar inventario.' });
  }
});

// MODIFICAR STOCK (ESTE ENDPOINT FALTABA Y CAUSABA EL ERROR 404)
app.patch('/api/trabajadores/inventario/:id', requireWorker, requireRoles('ADMINISTRADOR', 'PLANTA'), async (req, res) => {
  const idInventario = Number(req.params.id);
  const { delta, stock, precio } = req.body;
  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // 1. Actualizar stock si se envió
    if (stock !== undefined) {
      await conn.execute('UPDATE inventario_producto SET stock = ? WHERE id_inventario = ?', [Number(stock), idInventario]);
    } else if (delta !== undefined) {
      await conn.execute('UPDATE inventario_producto SET stock = GREATEST(0, stock + ?) WHERE id_inventario = ?', [Number(delta), idInventario]);
    }

    // 2. Actualizar precio si se envió (afecta a la tabla productos)
    if (precio !== undefined && !isNaN(Number(precio))) {
      await conn.execute(`
        UPDATE productos P 
        JOIN inventario_producto I ON P.id_producto = I.id_producto 
        SET P.precio = ? 
        WHERE I.id_inventario = ?
      `, [Number(precio), idInventario]);
    }

    await conn.commit();
    res.json({ success: true, mensaje: 'Modificaciones guardadas en MariaDB.' });
  } catch (e) {
    if (conn) await conn.rollback();
    res.status(500).json({ error: 'Error al actualizar: ' + e.message });
  } finally {
    if (conn) conn.release();
  }
});

// Insertar Producto
app.post('/api/trabajadores/productos', requireWorker, requireRoles('ADMINISTRADOR', 'PLANTA'), async (req, res) => {
  const b = req.body || {};
  const nombre = String(b.nombre || '').trim();
  const descripcion = String(b.descripcion || '').trim().slice(0, 1000);
  const material = String(b.material || 'Algodón').trim().slice(0, 255);
  const categoria = String(b.categoria || 'General').trim();
  const piso = String(b.piso_termico || 'PÁRAMO').trim().toUpperCase();
  const genero = String(b.genero || 'UNISEX').trim().toUpperCase();
  const talla = String(b.talla || 'M').trim().toUpperCase();
  const color = String(b.color || 'Negro').trim();
  const imagenUrl = String(b.imagen_url || '').trim();
  const precio = Number(b.precio);
  const stock = Number(b.stock);

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    let idCategoria = 1;
    const [cats] = await conn.execute('SELECT id_categoria FROM categorias WHERE LOWER(nombre) = LOWER(?) LIMIT 1', [categoria]);
    if (cats.length) {
      idCategoria = cats[0].id_categoria;
    } else {
      const [catRes] = await conn.execute('INSERT INTO categorias (nombre, descripcion, genero, piso_termico) VALUES (?, ?, ?, ?)', [categoria, categoria, genero, piso]);
      idCategoria = catRes.insertId;
    }

    const [prodRes] = await conn.execute(`
      INSERT INTO productos (id_categoria, id_coleccion, nombre, descripcion, precio, material, piso_termico, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `, [idCategoria, b.id_coleccion ? Number(b.id_coleccion) : null, nombre, descripcion, precio, material, piso]);
    const idProducto = prodRes.insertId;

    const sku = b.sku || `OUT-${idProducto}-${talla}-${color.replace(/\s+/g, '')}`.toUpperCase();
    await conn.execute('INSERT INTO inventario_producto (id_producto, talla, color, stock, sku) VALUES (?, ?, ?, ?, ?)', [idProducto, talla, color, stock || 0, sku]);

    if (imagenUrl) {
      await conn.execute("INSERT INTO imagenes_producto (id_producto, url_imagen, tipo, orden) VALUES (?, ?, 'FOTO', 1)", [idProducto, imagenUrl]);
    }

    await conn.commit();
    res.status(201).json({ success: true, id_producto: idProducto });
  } catch (e) {
    if (conn) await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    if (conn) conn.release();
  }
});

// Catálogo público
app.get('/api/productos', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT P.*, C.nombre AS categoria_nombre,
             COALESCE(I.url_imagen, 'http://localhost:3000/uploads/Camiseta Oversize Violet.jpg') AS url_imagen
      FROM productos P
      JOIN categorias C ON C.id_categoria = P.id_categoria
      LEFT JOIN imagenes_producto I ON P.id_producto = I.id_producto AND I.tipo = 'FOTO' AND I.orden = 1
      WHERE P.activo = 1
      ORDER BY P.id_producto DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Error al consultar productos' });
  }
});

app.get('/api/colecciones', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM colecciones WHERE activa = 1 ORDER BY id_coleccion DESC');
  res.json(rows);
});

app.listen(PORT, () => console.log(`Backend corriendo en http://127.0.0.1:${PORT}`));