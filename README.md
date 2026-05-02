# API-AseguradorasRD
# API RESTful Segura – Gestión de Aseguradoras Dominicanas

## 📌 Descripción
API sobre las aseguradoras de la República Dominicana, para que la información esté lo más rápido posible a su alcance.

## 🔗 API en producción
[https://api-aseguradorasrd.onrender.com](https://api-aseguradorasrd.onrender.com)

## 🛠️ Tecnologías
- Node.js + Express
- Postman
- JSON Web Token (JWT)
- bcrypt (hashing de contraseñas)
- File system como almacenamiento (JSON)
- Render (despliegue)

## 🔐 Seguridad implementada
- Autenticación JWT (expiración 1 hora)
- Contraseñas hasheadas (bcrypt)
- Protección de rutas con middleware
- Variables de entorno para `JWT_SECRET`
- Validación de inputs

## 📍 Endpoints principales

| Método | Ruta | Protección | Descripción |
|--------|------|------------|-------------|
| POST | `/login` | No | Autenticación → devuelve token |
| GET | `/aseguradoras` | No | Listar aseguradoras |
| POST | `/aseguradoras` | JWT | Agregar aseguradora |
| PUT | `/aseguradoras/:nombre` | JWT | Actualizar |
| DELETE | `/aseguradoras/:nombre` | JWT | Eliminar |
| GET | `/users` | JWT | Listar usuarios (solo usernames) |
| POST | `/users` | JWT | Crear usuario |

## 🧪 Ejemplo rápido (login)
curl -X POST https://api-aseguradorasrd.onrender.com/login
-H "Content-Type: application/json"
-d '{"username":"john","password":"jcedano"}'


## 📄 Documentación completa
[Ver Documentación](docs/Laboratorio%20Seguridad%20en%20API's.pdf)

## 👥 Autor
Proyecto académico – ITLA  
Javier Cedano (Jcedano)
