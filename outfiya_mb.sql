-- ============================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS MARIADB - OUTFITYA
-- ============================================================

DROP DATABASE IF EXISTS outfitya_db;
CREATE DATABASE outfitya_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE outfitya_db;

-- 1. TABLA: roles
CREATE TABLE roles (
    id_rol INT NOT NULL AUTO_INCREMENT,
    nombre_rol VARCHAR(50) NOT NULL,
    descripcion VARCHAR(200),
    PRIMARY KEY (id_rol),
    UNIQUE KEY uq_nombre_rol (nombre_rol)
) ENGINE=InnoDB;

-- 2. TABLA: usuarios
CREATE TABLE usuarios (
    id_usuario INT NOT NULL AUTO_INCREMENT,
    id_rol INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso DATETIME,
    activo TINYINT NOT NULL DEFAULT 1,
    PRIMARY KEY (id_usuario),
    UNIQUE KEY uq_correo (correo),
    CONSTRAINT fk_usuarios_rol FOREIGN KEY (id_rol) REFERENCES roles (id_rol)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 3. TABLA: programa_fidelidad (Puntos de Altura)
CREATE TABLE programa_fidelidad (
    id_fidelidad INT NOT NULL AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    puntos_altura INT NOT NULL DEFAULT 0,
    nivel_altitud VARCHAR(50) NOT NULL DEFAULT 'MAR', -- MAR, BOSQUE, NIEBLA, PÁRAMO, CUMBRE
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_fidelidad),
    UNIQUE KEY uq_fidelidad_usuario (id_usuario),
    CONSTRAINT fk_fidelidad_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. TABLA: direcciones_usuario
CREATE TABLE direcciones_usuario (
    id_direccion INT NOT NULL AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    alias VARCHAR(50) NOT NULL,
    calle VARCHAR(200) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(20),
    pais VARCHAR(80) NOT NULL DEFAULT 'Colombia',
    predeterminada TINYINT NOT NULL DEFAULT 0,
    PRIMARY KEY (id_direccion),
    CONSTRAINT fk_dir_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. TABLA: medidas_usuario (Biometría para el Probador 3D)
CREATE TABLE medidas_usuario (
    id_medida INT NOT NULL AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    estatura_cm DECIMAL(5,2) NOT NULL,
    peso_kg DECIMAL(5,2) NOT NULL,
    contorno_pecho DECIMAL(5,2),
    contorno_cintura DECIMAL(5,2),
    contorno_cadera DECIMAL(5,2),
    talla_prenda VARCHAR(10),
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_medida),
    CONSTRAINT fk_medidas_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. TABLA: categorias
CREATE TABLE categorias (
    id_categoria INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(300),
    genero VARCHAR(20) NOT NULL DEFAULT 'UNISEX',
    piso_termico VARCHAR(50) DEFAULT 'CÁLIDO', -- CÁLIDO, TEMPLADO, FRÍO, PÁRAMO, NEVADO
    id_padre INT,
    PRIMARY KEY (id_categoria),
    CONSTRAINT fk_cat_padre FOREIGN KEY (id_padre) REFERENCES categorias (id_categoria)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- 7. TABLA: colecciones
CREATE TABLE colecciones (
    id_coleccion INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    temporada VARCHAR(50),
    anio YEAR,
    activa TINYINT NOT NULL DEFAULT 1,
    PRIMARY KEY (id_coleccion)
) ENGINE=InnoDB;

-- 8. TABLA: productos
CREATE TABLE productos (
    id_producto INT NOT NULL AUTO_INCREMENT,
    id_categoria INT NOT NULL,
    id_coleccion INT,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    precio_oferta DECIMAL(10,2),
    material VARCHAR(150),
    piso_termico VARCHAR(50) NOT NULL DEFAULT 'CÁLIDO',
    activo TINYINT NOT NULL DEFAULT 1,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_producto),
    CONSTRAINT fk_prod_categoria FOREIGN KEY (id_categoria) REFERENCES categorias (id_categoria)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_prod_coleccion FOREIGN KEY (id_coleccion) REFERENCES colecciones (id_coleccion)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- 9. TABLA: inventario_producto
CREATE TABLE inventario_producto (
    id_inventario INT NOT NULL AUTO_INCREMENT,
    id_producto INT NOT NULL,
    talla VARCHAR(10) NOT NULL,
    color VARCHAR(80) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    sku VARCHAR(100),
    PRIMARY KEY (id_inventario),
    UNIQUE KEY uq_prod_talla_color (id_producto, talla, color),
    CONSTRAINT fk_inv_producto FOREIGN KEY (id_producto) REFERENCES productos (id_producto)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. TABLA: imagenes_producto
CREATE TABLE imagenes_producto (
    id_imagen INT NOT NULL AUTO_INCREMENT,
    id_producto INT NOT NULL,
    url_imagen VARCHAR(500) NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'FOTO',
    orden INT NOT NULL DEFAULT 1,
    PRIMARY KEY (id_imagen),
    CONSTRAINT fk_img_producto FOREIGN KEY (id_producto) REFERENCES productos (id_producto)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. TABLA: metodos_pago
CREATE TABLE metodos_pago (
    id_metodo INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(200),
    activo TINYINT NOT NULL DEFAULT 1,
    PRIMARY KEY (id_metodo)
) ENGINE=InnoDB;

-- 12. TABLA: tickets_compra (Registros de compra/sesión del Probador 3D)
CREATE TABLE tickets_compra (
    id_ticket INT NOT NULL AUTO_INCREMENT,
    id_usuario INT,
    usuario_email VARCHAR(150) NOT NULL,
    prenda_seleccionada VARCHAR(100) NOT NULL,
    altura_biometrica DECIMAL(5,2) NOT NULL,
    peso_biometrico DECIMAL(5,2) NOT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_ticket),
    CONSTRAINT fk_ticket_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;

-- 13. TABLA: chatbot_lexico
CREATE TABLE chatbot_lexico (
    id_lexico INT NOT NULL AUTO_INCREMENT,
    palabra_clave VARCHAR(50) NOT NULL,
    respuesta TEXT NOT NULL,
    categoria VARCHAR(30) DEFAULT 'general',
    PRIMARY KEY (id_lexico)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- DATOS SEMILLA DE PRUEBA (SEED DATA)
-- ------------------------------------------------------------
INSERT INTO roles (nombre_rol, descripcion) VALUES
  ('ADMINISTRADOR', 'Acceso total a la plataforma'),
  ('CLIENTE', 'Cliente comprador');

INSERT INTO categorias (nombre, descripcion, genero, piso_termico) VALUES
  ('Chaqueta Urban Cyber', 'Chaqueta de abrigo urbano', 'UNISEX', 'FRÍO'),
  ('Camiseta Oversize Violet', 'Camiseta estilo confort', 'UNISEX', 'CÁLIDO'),
  ('Hoodie Dark Neon', 'Sudadera con capota', 'UNISEX', 'TEMPLADO');

INSERT INTO productos (id_categoria, nombre, precio, descripcion, piso_termico) VALUES
  (1, 'Chaqueta Urban Cyber', 129900.00, 'Chaqueta estilo urbano vanguardista', 'FRÍO'),
  (2, 'Camiseta Oversize Violet', 89900.00, 'Camiseta confort de algodón', 'CÁLIDO'),
  (3, 'Hoodie Dark Neon', 149900.00, 'Sudadera con capota estilo dark', 'TEMPLADO');

INSERT INTO chatbot_lexico (palabra_clave, respuesta, categoria) VALUES
  ('hola', '¡Hola! Bienvenido a Outfitya. ¿En qué puedo ayudarte hoy?', 'saludo'),
  ('envio', 'Realizamos envíos a toda Colombia en un lapso de 2 a 4 días hábiles.', 'logistica'),
  ('medidas', 'Puedes ajustar tu altura y peso en el Probador 3D para probar la prenda en tiempo real.', 'probador');