const { error } = require('console');
const express = require('express');
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcrypt');
const fs = require('fs'); //leer archivos
const { totalmem } = require('os');
const path = require('path'); //manejar rutas
require("dotenv").config(); // Cargar variables de entorno en desarrollo
const app = express();
app.use(express.json());

//cargar json
const AseguradorasPath = path.join(__dirname, 'aseguradoras.json');
let aseguradoras = [];
const usersPath = path.join(__dirname, 'users.json');
let DBusers = [];

try {
    const data = fs.readFileSync(AseguradorasPath, 'utf-8');
    aseguradoras = JSON.parse(data);
    
}catch(error){
    console.error("Error cargando aseguradoras:", error);
    process.exit(1); 
}

//Creamos el json con los usuarios por defecto
try {
  const usersData = fs.readFileSync(usersPath, 'utf-8');
  DBusers = JSON.parse(usersData);
} catch (error) {
  console.error("Error cargando usuarios:", error);
  // Si el archivo no existe, lo creamos con los usuarios por defecto
  DBusers = [
      {username: 'Jcedano', hashedPassword: "$2b$10$LJnTZUIaHeSw77ZBr3NO9uhc8Cg.Wp0Kj.G43S2DAJT14hMj9DUfK"}, //!LJcedano$123
      {username: 'GBadmin', hashedPassword: "$2b$10$kLsFUl5PhCt7lo0AbrvVB.qopE988YpDh9cRLgSLHiEdapq4nS9S2"} //!GBadmin$321
  ];
  fs.writeFileSync(usersPath, JSON.stringify(DBusers, null, 2));
}




//variable de entorno para Json token
const secretKeyJW = process.env.JWT_SECRET;


//AUTENTICACION

app.post('/login', async (req,res)=> {
    const {username, password} = req.body;

    //buscar usuario en bd
    const user = DBusers.find(u => u.username === username);
    if(!user) return res.status(401).json({
        error:"Credenciales Invalidas",
    });


    //Verificar contrasena
    const isValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isValid) {
        returnres.status(401).json({error:"Credenciales Invalidas"})
    }

    //generar token JWT
    const token = jwt.sign({username:user.username}, secretKeyJW,{expiresIn: '1h'});

    //devolver token
    res.json({token});

});


//middleware auth

const authMiddleware = (req,res,next) => {
    //obtener el token del header 'Authorization'
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; //El formato: "Bearer <token>"

    if (!token) {
        return res.status(403).json({error:"Token no proporcionado"});
    }
    
    //verificar token

    jwt.verify(token, secretKeyJW, (err,decoded)=>{
        if (err) {
            return res.status(403).json({error:"Token invalido o expirado"});
        }

        //guardar user decodificado
        req.user = decoded
        next();

    });

};

app.get('/users',authMiddleware, (req, res) => {
  // Mapear para devolver solo los usernames
  const usernames = DBusers.map(user =>user.username);
  res.json(usernames)
});



//ENDPOINTS PUBLICOS

app.get('/', (req, res) => {

    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API de Aseguradoras Dominicanas</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f9;
          color: #333;
          margin: 0;
          padding: 20px;
        }
        h1 {
          color: #2c3e50;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .endpoint {
          margin: 15px 0;
          padding: 10px;
          background: #e9f5ff;
          border-left: 4px solid #3498db;
          border-radius: 4px;
        }
        .endpoint h3 {
          margin: 0;
          color: #3498db;
        }
        .endpoint p {
          margin: 5px 0;
        }
        .endpoint .method {
          font-weight: bold;
          color: #e67e22;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Bienvenido a la API de Aseguradoras Dominicanas</h1>
        <p>Esta API permite gestionar información sobre aseguradoras de salud en República Dominicana.</p>
        <h2>Endpoints Disponibles</h2>
        
        <div class="endpoint">
          <h3>Obtener todas las aseguradoras</h3>
          <p><span class="method">GET</span> <code>/aseguradoras</code></p>
          <p>Devuelve una lista completa de todas las aseguradoras registradas.</p>
        </div>

        <div class="endpoint">
          <h3>Buscar una aseguradora por nombre</h3>
          <p><span class="method">GET</span> <code>/aseguradoras/:nombre</code></p>
          <p>Ejemplo: <code>/aseguradoras/ARS Humano</code></p>
        </div>

        <div class="endpoint">
          <h3>Agregar una nueva aseguradora</h3>
          <p><span class="method">POST</span> <code>/aseguradoras</code></p>
          <p>Requiere autenticación. Envía un JSON con los datos de la nueva aseguradora.</p>
        </div>

        <div class="endpoint">
          <h3>Actualizar una aseguradora</h3>
          <p><span class="method">PUT</span> <code>/aseguradoras/:nombre</code></p>
          <p>Requiere autenticación. Envía un JSON con los campos a actualizar.</p>
        </div>

        <div class="endpoint">
          <h3>Eliminar una aseguradora</h3>
          <p><span class="method">DELETE</span> <code>/aseguradoras/:nombre</code></p>
          <p>Requiere autenticación. Elimina la aseguradora especificada.</p>
        </div>

        <div class="endpoint">
          <h3>Autenticación</h3>
          <p><span class="method">POST</span> <code>/login</code></p>
          <p>Envía un JSON con <code>username</code> y <code>password</code> para obtener acceso.</p>
        </div>
      </div>
      <div class="endpoint">
           <h3>Agregar nuevo usuario</h3>
            <p><span class="method">POST</span> <code>/users</code></p>
           <p>Requiere autenticación. Envía un JSON con <code>username</code> y <code>password</code>.</p>
      </div>
    </body>
    </html>
  `;
  res.send(html);
});

//obtener aseguradoras

app.get('/aseguradoras', (req,res)=>{
    res.json(aseguradoras);
})

//buscar por nombre

app.get('/aseguradoras/:nombre', (req,res)=>{
    const nombreNormal = req.params.nombre.toLowerCase();
    const SearchAseguradora = aseguradoras.find(a => a.nombre.toLowerCase() === nombreNormal);

    if(!SearchAseguradora) return res.status(404).json({
        error:"No encontrada",
        sugerencia: "Verifica el nombre o usa GET /aseguradoras para listar todas"
    });

    res.json(SearchAseguradora);
});

//ENDPOINTS PROTEGIDOS

// AGREGAR ASEGURADORA

app.post('/aseguradoras', authMiddleware, (req,res)=> {
    const nueva = req.body;

    if(!nueva.nombre || !nueva.descripcion){
        return res.status(400).json({
            error:"Datos incompletos",
            campos_requeridos: ["nombre","descripcion"]
        });

    }

    aseguradoras.push(nueva)
    fs.writeFileSync(AseguradorasPath, JSON.stringify(aseguradoras,null,2));  // Guardar en el archivo
    res.status(201).json({
        mensaje:"Aseguradora agregada",
        total: aseguradoras.length
    });
});

//ACTUALIZAR ASEGURADORA

app.put('/aseguradoras/:nombre', authMiddleware, (req,res) =>{
    const nombre = req.params.nombre;
    const index = aseguradoras.findIndex(a => a.nombre === nombre);

    if (index === -1)return res.status(404).json
    ({
    error:"No existe",
    solucion: "Usa POST /aseguradoras para crear una nueva."    
    });

    aseguradoras[index] = {...aseguradoras[index], ...req.body};
    fs.writeFileSync(AseguradorasPath, JSON.stringify(aseguradoras,null,2)); //guardar en el archivo
    res.json({mensaje: "Actualizado correctamente", data: aseguradoras[index]});

});


//ELIMINAR ASEGURADORA

app.delete('/aseguradoras/:nombre', authMiddleware, (req,res)=>{
    const nombre = req.params.nombre;
    aseguradoras = aseguradoras.filter(a => a.nombre !== nombre);
    fs.writeFileSync(AseguradorasPath, JSON.stringify(aseguradoras, null, 2));

    res.json({
        mensaje: "Eliminada si existia",
        nuevas_total: aseguradoras.length
      });

});

//AGREGAR USUARIOS

// Ruta para agregar nuevos usuarios (protegida por autenticación)
app.post('/users', authMiddleware, async (req, res) => {
  const { username, password } = req.body;

  // Validación básica
  if (!username || !password) {
      return res.status(400).json({ 
          error: "Datos incompletos",
          campos_requeridos: ["username", "password"] 
      });
  }

  // Verificar si el usuario ya existe
  const userExists = DBusers.some(u => u.username === username);
  if (userExists) {
      return res.status(400).json({ error: "El usuario ya existe" });
  }

  try {
      // Hash de la contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Crear nuevo usuario
      const newUser = {
          username,
          hashedPassword
      };

      // Agregar a la base de datos
      DBusers.push(newUser);
      
      // Guardar en el archivo JSON
      fs.writeFileSync(usersPath, JSON.stringify(DBusers, null, 2));

      res.status(201).json({ 
          mensaje: "Usuario creado exitosamente",
          username: newUser.username
      });

  } catch (error) {
      console.error("Error al crear usuario:", error);
      res.status(500).json({ error: "Error interno del servidor" });
  }
});


//Iniciar servidor

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log(`API ARS Dominicanas corriendo en puerto ${PORT}`))