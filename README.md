Commission Backend

API RESTful para la gestión de participantes y cálculo de comisiones en un sistema jerárquico de tres niveles.

Tabla de Contenidos

Tecnologías

Funcionalidades

Instalación

Configuración

Endpoints

Estructura de la Base de Datos

Autenticación

Ejemplos

Licencia

Tecnologías

Node.js 20+

NestJS

TypeORM

PostgreSQL

JWT para autenticación

Swagger/OpenAPI para documentación

Funcionalidades

CRUD de participantes

Registro de transacciones de ventas

Cálculo de comisiones por jerarquía:

Nivel 1: 10%

Nivel 2: 5%

Nivel 3: 2.5%

Autenticación y autorización vía JWT

API segura y estructurada

Instalación

# Clonar el repositorio

git clone https://github.com/bichozx/commission-backend.git
cd commission-backend

# Instalar dependencias

npm install

# Crear archivo de variables de entorno

cp .env.example .env

# Ejecutar migraciones

npm run typeorm migration:run

# Iniciar servidor en modo desarrollo

npm run start:dev

Configuración

En el archivo .env debes configurar:

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=tu_usuario
DATABASE_PASSWORD=tu_password
DATABASE_NAME=commission_db

JWT_SECRET=mi_secreto_jwt
JWT_EXPIRATION=3600s

Endpoints principales
Participantes
Método Ruta Descripción
POST /auth/register Registrar un usuario/participante
POST /auth/login Autenticación y obtención de token JWT
GET /participants Listar todos los participantes (protegido)
GET /participants/:id Obtener participante por ID (protegido)
POST /participants Crear participante (protegido)
PUT /participants/:id Actualizar participante (protegido)
DELETE /participants/:id Eliminar participante (protegido)
Comisiones
Método Ruta Descripción
GET /participants/:id/commissions Calcular y obtener comisiones jerárquicas del participante (protegido)
Estructura de la Base de Datos
Tabla participants
Columna Tipo Descripción
id UUID Identificador único
name string Nombre del participante
level integer Nivel jerárquico (1, 2 o 3)
parent_id UUID ID del participante superior (opcional)
Tabla transactions
Columna Tipo Descripción
id UUID Identificador único
participant_id UUID Relación con participante
amount decimal Monto de la venta
created_at timestamp Fecha de la transacción
Relaciones

Un participante puede tener un padre (nivel superior)

Las comisiones se calculan siguiendo la jerarquía:
Nivel 1 → 10%, Nivel 2 → 5%, Nivel 3 → 2.5%

Autenticación

Todas las rutas que manipulan datos requieren token JWT

Se obtiene mediante login:

POST /auth/login
{
"email": "usuario@email.com",
"password": "tu_contraseña"
}

Respuesta:

{
"access_token": "jwt_token_aquí"
}

Para acceder a rutas protegidas:

Authorization: Bearer jwt_token_aquí

Ejemplos
Crear participante
POST /participants
Authorization: Bearer <JWT>
{
"name": "Juan",
"level": 1,
"parent_id": null
}

Registrar transacción
POST /transactions
Authorization: Bearer <JWT>
{
"participant_id": "uuid_participante",
"amount": 1000
}

Consultar comisiones
GET /participants/:id/commissions
Authorization: Bearer <JWT>

Respuesta:

{
"level_1": 100,
"level_2": 50,
"level_3": 25
}
