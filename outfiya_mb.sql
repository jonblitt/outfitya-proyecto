-- ============================================================
--  SCRIPT MARIADB - OUTFITYA
--  Evidencia: GA6-220501096-AA2-EV03
--  Programa: Analisis y Desarrollo de Software - Ficha 3186626
--  Autores: Juan David Gomez Lara, Gino Leonado Giacometto Tique,
--           Julia Maria Lopez Espinosa, Elvira Loaiza Arcilla
--  Instructor: Deivys Guillermo Morales Uribe
--  Año: 2026
-- ============================================================

DROP DATABASE IF EXISTS outfitya_db;
CREATE DATABASE outfitya_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE outfitya_db;

-- ============================================================
-- TABLA: roles
-- Gestiona los tipos de acceso del sistema
-- ============================================================
CREATE TABLE roles (
  id_rol      INT          NOT NULL AUTO_INCREMENT,
  nombre_rol  VARCHAR(50)  NOT NULL,
  descripcion VARCHAR(200),
  PRIMARY KEY (id_rol),
  UNIQUE KEY uq_nombre_rol (nombre_rol)
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: metodos_pago
-- Catalogo de pasarelas de pago disponibles
-- RF16 - PayPal, PayU, MercadoPago, PSE
-- ============================================================
CREATE TABLE metodos_pago (
  id_metodo   INT          NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(100) NOT NULL,
  descripcion VARCHAR(200),
  activo      TINYINT      NOT NULL DEFAULT 1,
  PRIMARY KEY (id_metodo)
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: usuarios
-- RF1 - Registro | RF2 - Inicio sesion | RF11 - Perfil
-- ============================================================
CREATE TABLE usuarios (
  id_usuario       INT          NOT NULL AUTO_INCREMENT,
  id_rol           INT          NOT NULL,
  nombre           VARCHAR(100) NOT NULL,
  apellido         VARCHAR(100) NOT NULL,
  correo           VARCHAR(150) NOT NULL,
  contrasena       VARCHAR(255) NOT NULL,
  telefono         VARCHAR(20),
  fecha_nacimiento DATE,
  fecha_registro   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultimo_acceso    DATETIME,
  activo           TINYINT      NOT NULL DEFAULT 1,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uq_correo (correo),
  CONSTRAINT fk_usuarios_rol FOREIGN KEY (id_rol) REFERENCES roles (id_rol)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: direcciones_usuario
-- ============================================================
CREATE TABLE direcciones_usuario (
  id_direccion   INT          NOT NULL AUTO_INCREMENT,
  id_usuario     INT          NOT NULL,
  alias          VARCHAR(50)  NOT NULL,
  calle          VARCHAR(200) NOT NULL,
  ciudad         VARCHAR(100) NOT NULL,
  departamento   VARCHAR(100) NOT NULL,
  codigo_postal  VARCHAR(20),
  pais           VARCHAR(80)  NOT NULL DEFAULT 'Colombia',
  predeterminada TINYINT      NOT NULL DEFAULT 0,
  PRIMARY KEY (id_direccion),
  CONSTRAINT fk_dir_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: medidas_usuario
-- RF6 - Probador 3D
-- ============================================================
CREATE TABLE medidas_usuario (
  id_medida        INT          NOT NULL AUTO_INCREMENT,
  id_usuario       INT          NOT NULL,
  estatura_cm      DECIMAL(5,2) NOT NULL,
  peso_kg          DECIMAL(5,2) NOT NULL,
  contorno_pecho   DECIMAL(5,2),
  contorno_cintura DECIMAL(5,2),
  contorno_cadera  DECIMAL(5,2),
  talla_prenda     VARCHAR(10),
  fecha_registro   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_medida),
  CONSTRAINT fk_medidas_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: categorias
-- RF4 - Filtro | RF19 - Busqueda avanzada
-- ============================================================
CREATE TABLE categorias (
  id_categoria INT          NOT NULL AUTO_INCREMENT,
  nombre       VARCHAR(100) NOT NULL,
  descripcion  VARCHAR(300),
  genero       VARCHAR(20)  NOT NULL DEFAULT 'UNISEX',
  id_padre     INT,
  PRIMARY KEY (id_categoria),
  CONSTRAINT fk_cat_padre FOREIGN KEY (id_padre) REFERENCES categorias (id_categoria)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: colecciones
-- ============================================================
CREATE TABLE colecciones (
  id_coleccion INT          NOT NULL AUTO_INCREMENT,
  nombre       VARCHAR(150) NOT NULL,
  descripcion  TEXT,
  temporada    VARCHAR(50),
  anio         YEAR,
  activa       TINYINT      NOT NULL DEFAULT 1,
  fecha_inicio DATE,
  fecha_fin    DATE,
  PRIMARY KEY (id_coleccion)
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: productos
-- RF3 - Busqueda | RF4 - Filtro | RF5 - Visualizacion
-- ============================================================
CREATE TABLE productos (
  id_producto    INT           NOT NULL AUTO_INCREMENT,
  id_categoria   INT           NOT NULL,
  id_coleccion   INT,
  nombre         VARCHAR(200)  NOT NULL,
  descripcion    TEXT,
  precio         DECIMAL(10,2) NOT NULL,
  precio_oferta  DECIMAL(10,2),
  material       VARCHAR(150),
  marca          VARCHAR(100),
  activo         TINYINT       NOT NULL DEFAULT 1,
  fecha_creacion DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_producto),
  CONSTRAINT fk_prod_categoria FOREIGN KEY (id_categoria) REFERENCES categorias (id_categoria)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_prod_coleccion FOREIGN KEY (id_coleccion) REFERENCES colecciones (id_coleccion)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: inventario_producto
-- ============================================================
CREATE TABLE inventario_producto (
  id_inventario INT          NOT NULL AUTO_INCREMENT,
  id_producto   INT          NOT NULL,
  talla         VARCHAR(10)  NOT NULL,
  color         VARCHAR(80)  NOT NULL,
  stock         INT          NOT NULL DEFAULT 0,
  sku           VARCHAR(100),
  PRIMARY KEY (id_inventario),
  UNIQUE KEY uq_prod_talla_color (id_producto, talla, color),
  CONSTRAINT fk_inv_producto FOREIGN KEY (id_producto) REFERENCES productos (id_producto)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: imagenes_producto
-- ============================================================
CREATE TABLE imagenes_producto (
  id_imagen   INT          NOT NULL AUTO_INCREMENT,
  id_producto INT          NOT NULL,
  url_imagen  VARCHAR(500) NOT NULL,
  tipo        VARCHAR(20)  NOT NULL DEFAULT 'FOTO',
  orden       INT          NOT NULL DEFAULT 1,
  PRIMARY KEY (id_imagen),
  CONSTRAINT fk_img_producto FOREIGN KEY (id_producto) REFERENCES productos (id_producto)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: carritos
-- RF7 - Carrito de compras
-- ============================================================
CREATE TABLE carritos (
  id_carrito          INT         NOT NULL AUTO_INCREMENT,
  id_usuario          INT         NOT NULL,
  fecha_creacion      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME,
  estado              VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
  PRIMARY KEY (id_carrito),
  CONSTRAINT fk_carrito_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: detalle_carrito
-- ============================================================
CREATE TABLE detalle_carrito (
  id_detalle_carrito INT           NOT NULL AUTO_INCREMENT,
  id_carrito         INT           NOT NULL,
  id_inventario      INT           NOT NULL,
  cantidad           INT           NOT NULL DEFAULT 1,
  precio_unitario    DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id_detalle_carrito),
  CONSTRAINT fk_dc_carrito    FOREIGN KEY (id_carrito)    REFERENCES carritos (id_carrito)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_dc_inventario FOREIGN KEY (id_inventario) REFERENCES inventario_producto (id_inventario)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: pedidos
-- RF8 - Pago | RF9 - Confirmacion | RF10 - Cancelacion
-- ============================================================
CREATE TABLE pedidos (
  id_pedido          INT           NOT NULL AUTO_INCREMENT,
  id_usuario         INT           NOT NULL,
  id_direccion       INT           NOT NULL,
  id_metodo_pago     INT           NOT NULL,
  fecha_pedido       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total              DECIMAL(10,2) NOT NULL,
  estado             VARCHAR(20)   NOT NULL DEFAULT 'PENDIENTE',
  numero_seguimiento VARCHAR(100),
  notas              TEXT,
  PRIMARY KEY (id_pedido),
  CONSTRAINT fk_pedido_usuario   FOREIGN KEY (id_usuario)     REFERENCES usuarios (id_usuario)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_pedido_direccion FOREIGN KEY (id_direccion)   REFERENCES direcciones_usuario (id_direccion)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_pedido_metodo    FOREIGN KEY (id_metodo_pago) REFERENCES metodos_pago (id_metodo)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: detalle_pedido
-- ============================================================
CREATE TABLE detalle_pedido (
  id_detalle_pedido INT           NOT NULL AUTO_INCREMENT,
  id_pedido         INT           NOT NULL,
  id_inventario     INT           NOT NULL,
  cantidad          INT           NOT NULL,
  precio_unitario   DECIMAL(10,2) NOT NULL,
  subtotal          DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id_detalle_pedido),
  CONSTRAINT fk_dp_pedido     FOREIGN KEY (id_pedido)     REFERENCES pedidos (id_pedido)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_dp_inventario FOREIGN KEY (id_inventario) REFERENCES inventario_producto (id_inventario)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: reembolsos
-- RF10 - Cancelacion | RF15 - Reembolsos | RF18 - Politica
-- ============================================================
CREATE TABLE reembolsos (
  id_reembolso     INT           NOT NULL AUTO_INCREMENT,
  id_pedido        INT           NOT NULL,
  fecha_solicitud  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  monto            DECIMAL(10,2) NOT NULL,
  motivo           TEXT          NOT NULL,
  estado           VARCHAR(20)   NOT NULL DEFAULT 'SOLICITADO',
  fecha_resolucion DATETIME,
  PRIMARY KEY (id_reembolso),
  CONSTRAINT fk_reembolso_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos (id_pedido)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: programa_fidelidad
-- RF17 - Programa de fidelidad
-- ============================================================
CREATE TABLE programa_fidelidad (
  id_fidelidad        INT         NOT NULL AUTO_INCREMENT,
  id_usuario          INT         NOT NULL,
  puntos_totales      INT         NOT NULL DEFAULT 0,
  puntos_usados       INT         NOT NULL DEFAULT 0,
  nivel               VARCHAR(50) NOT NULL DEFAULT 'BRONCE',
  fecha_actualizacion DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_fidelidad),
  UNIQUE KEY uq_fidelidad_usuario (id_usuario),
  CONSTRAINT fk_fidelidad_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: notificaciones
-- RF12 - Notificaciones
-- ============================================================
CREATE TABLE notificaciones (
  id_notificacion INT          NOT NULL AUTO_INCREMENT,
  id_usuario      INT          NOT NULL,
  tipo            VARCHAR(30)  NOT NULL,
  titulo          VARCHAR(200) NOT NULL,
  mensaje         TEXT         NOT NULL,
  leida           TINYINT      NOT NULL DEFAULT 0,
  fecha_envio     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_notificacion),
  CONSTRAINT fk_notif_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: resenas_producto
-- ============================================================
CREATE TABLE resenas_producto (
  id_resena    INT      NOT NULL AUTO_INCREMENT,
  id_usuario   INT      NOT NULL,
  id_producto  INT      NOT NULL,
  calificacion TINYINT  NOT NULL,
  comentario   TEXT,
  fecha_resena DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_resena),
  UNIQUE KEY uq_resena (id_usuario, id_producto),
  CONSTRAINT chk_calificacion CHECK (calificacion BETWEEN 1 AND 5),
  CONSTRAINT fk_resena_usuario  FOREIGN KEY (id_usuario)  REFERENCES usuarios (id_usuario)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_resena_producto FOREIGN KEY (id_producto) REFERENCES productos (id_producto)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: sesiones_asistente
-- RF13 - Asistente Virtual
-- ============================================================
CREATE TABLE sesiones_asistente (
  id_sesion    INT         NOT NULL AUTO_INCREMENT,
  id_usuario   INT,
  fecha_inicio DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_fin    DATETIME,
  canal        VARCHAR(10) NOT NULL DEFAULT 'WEB',
  PRIMARY KEY (id_sesion),
  CONSTRAINT fk_sesion_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: mensajes_asistente
-- ============================================================
CREATE TABLE mensajes_asistente (
  id_mensaje    INT         NOT NULL AUTO_INCREMENT,
  id_sesion     INT         NOT NULL,
  emisor        VARCHAR(10) NOT NULL,
  contenido     TEXT        NOT NULL,
  fecha_mensaje DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_mensaje),
  CONSTRAINT fk_mensaje_sesion FOREIGN KEY (id_sesion) REFERENCES sesiones_asistente (id_sesion)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE registros_biometricos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    altura INT NOT NULL,
    peso INT NOT NULL,
    prenda VARCHAR(100) NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=INNODB;

CREATE TABLE chatbot_lexico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    palabra_clave VARCHAR(50) NOT NULL,
    respuesta TEXT NOT NULL,
    categoria VARCHAR(30)
)ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS tickets_compra (
  id_ticket           INT NOT NULL AUTO_INCREMENT,
  usuario_email       VARCHAR(150) NOT NULL,
  prenda_seleccionada VARCHAR(100) NOT NULL,
  altura_biometrica   DECIMAL(5,2) NOT NULL,
  peso_biometrico     DECIMAL(5,2) NOT NULL,
  fecha_creacion      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_ticket)
) ENGINE=INNODB;

-- "Entrenamos" la base de datos insertando el léxico expandido de Outfitya
INSERT INTO chatbot_lexico (palabra_clave, respuesta, categoria) VALUES
('envio', 'Los envíos en Bogotá tardan de 24 a 48 horas. A nivel nacional de 3 a 5 días hábiles.', 'logistica'),
('devolucion', 'Tienes hasta 30 días para realizar cambios en tus prendas sin costo adicional.', 'soporte'),
('seguridad', 'Outfitya no almacena tus datos bancarios; usamos cifrado SSL de extremo a extremo.', 'seguridad'),
('creadores', 'Esta plataforma fue desarrollada por Juan Gómez, Gino Giacometto, Julia López y Elvira Loaiza.', 'institucional');
-- ============================================================
-- DATOS INICIALES
-- ============================================================

INSERT INTO roles (nombre_rol, descripcion) VALUES
  ('ADMINISTRADOR', 'Control total del sistema'),
  ('CLIENTE',       'Usuario comprador registrado'),
  ('SOPORTE',       'Agente de atencion al cliente');

INSERT INTO metodos_pago (nombre, descripcion) VALUES
  ('PayPal',             'Pago mediante cuenta PayPal'),
  ('PayU',               'Pasarela de pagos PayU Latam'),
  ('MercadoPago',        'Pago mediante MercadoPago'),
  ('PSE',                'Pagos Seguros en Linea - Colombia'),
  ('Tarjeta de credito', 'Visa, MasterCard, American Express');

INSERT INTO categorias (nombre, descripcion, genero) VALUES
  ('Camisas',    'Camisas y blusas',        'UNISEX'),
  ('Pantalones', 'Pantalones y jeans',       'UNISEX'),
  ('Vestidos',   'Vestidos y faldas',        'MUJER'),
  ('Accesorios', 'Bolsos, cinturones, etc.', 'UNISEX'),
  ('Calzado',    'Zapatos y sandalias',      'UNISEX');

INSERT INTO colecciones (nombre, temporada, anio) VALUES
  ('Primavera Outfitya 2026', 'Primavera',   2026),
  ('Noche en Bogota',         'Todo el ano', 2026);

INSERT INTO usuarios (id_rol, nombre, apellido, correo, contrasena) VALUES
  (1, 'Admin', 'Outfitya', 'admin@outfitya.com', 'hash_admin_001'),
  (2, 'Juan',  'Gomez',    'juan@correo.com',     'hash_cliente_002'),
  (2, 'Maria', 'Lopez',    'maria@correo.com',    'hash_cliente_003');

INSERT INTO productos (id_categoria, id_coleccion, nombre, precio, marca) VALUES
  (1, 1, 'Camisa Lino Premium',    89900.00, 'Outfitya'),
  (2, 1, 'Jean Slim Fit',         129900.00, 'Outfitya'),
  (3, 2, 'Vestido Noche Clasico', 199900.00, 'Outfitya');

INSERT INTO inventario_producto (id_producto, talla, color, stock, sku) VALUES
  (1, 'S',  'Blanco', 20, 'CAM-LIN-S-BLA'),
  (1, 'M',  'Blanco', 15, 'CAM-LIN-M-BLA'),
  (2, '30', 'Azul',   25, 'JEA-SLM-30-AZU'),
  (3, 'M',  'Negro',  10, 'VES-NOC-M-NEG');

-- ============================================================
-- FIN DEL SCRIPT - outfitya_db.sql
-- ============================================================