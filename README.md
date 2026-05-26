# 👔 Outfitya - Plataforma de Ajuste Biométrico

Este proyecto corresponde al entregable oficial de la **Evidencia GA6-220501096-AA4-EV03** para la tecnología en **Análisis y Desarrollo de Software (ADSO)** - Ficha 3186626.

## 🚀 Características del Proyecto
- **Probador Biométrico 3D:** Simulación adaptativa en tiempo real basada en parámetros de altura y peso.
- **Asistente Virtual con IA:** Widget de chatbot flotante integrado con el ecosistema backend para resolver dudas del usuario.
- **Persistencia de Datos:** Conexión e inyección de datos estructurados directamente en un servidor local MariaDB.

## 🛠️ Tecnologías Utilizadas
- **Front-End:** HTML5, CSS3, JavaScript (Vanilla)
- **Back-End:** Node.js (Express framework)
- **Base de Datos:** MariaDB / MySQL (mediante conector nativo `mariadb`)
- **Seguridad:** Middleware `cors` para intercambio de recursos de origen cruzado

## 💻 Instrucciones de Instalación Local

Para que el equipo de desarrollo pueda ejecutar este proyecto localmente, siga estos pasos:

1. **Clonar el repositorio** en su máquina local.
2. Asegurarse de tener instalado **Node.js** (Versión LTS >= 20.0.0).
3. Iniciar su servidor local de base de datos (**XAMPP** o **Laragon**) y montar el script de la base de datos `outfitya_db`.
4. Abrir una terminal en la raíz del backend y ejecutar el comando para instalar las dependencias:
   ```bash
   npm install