# Claude Initial Demo API

API REST desarrollada con NestJS siguiendo los principios de Clean Architecture (Hexagonal Architecture).

## Tabla de Contenidos

- [Descripcion](#descripcion)
- [Tecnologias](#tecnologias)
- [Arquitectura](#arquitectura)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requerimientos](#requerimientos)
- [Instalacion](#instalacion)
- [Configuracion de Variables de Entorno](#configuracion-de-variables-de-entorno)
- [Levantamiento en Desarrollo](#levantamiento-en-desarrollo)
- [Ambientes Disponibles](#ambientes-disponibles)
- [Endpoints de la API](#endpoints-de-la-api)
- [Scripts Disponibles](#scripts-disponibles)

## Descripcion

Este proyecto es una API REST que implementa un sistema de autenticacion y gestion de usuarios. Incluye:

- Registro y autenticacion de usuarios (JWT)
- Refresh tokens para sesiones persistentes
- CRUD de usuarios
- Estructura de respuestas estandarizada
- Validacion de datos con class-validator
- Manejo global de excepciones

## Tecnologias

### Core

| Tecnologia | Version | Descripcion |
|------------|---------|-------------|
| Node.js | >= 18.x | Entorno de ejecucion |
| NestJS | 11.0.1 | Framework backend |
| TypeScript | 5.7.3 | Lenguaje de programacion |
| PostgreSQL | 15+ | Base de datos relacional |

### Dependencias Principales

| Libreria | Version | Descripcion |
|----------|---------|-------------|
| @nestjs/common | 11.0.1 | Modulo comun de NestJS |
| @nestjs/core | 11.0.1 | Nucleo de NestJS |
| @nestjs/config | 4.0.2 | Gestion de configuracion |
| @nestjs/jwt | 11.0.2 | Manejo de JSON Web Tokens |
| @nestjs/passport | 11.0.5 | Integracion con Passport.js |
| @nestjs/typeorm | 11.0.0 | Integracion con TypeORM |
| @nestjs/platform-express | 11.0.1 | Plataforma Express |
| typeorm | 0.3.28 | ORM para TypeScript |
| pg | 8.17.2 | Driver de PostgreSQL |
| bcrypt | 6.0.0 | Hash de contrasenas |
| class-validator | 0.14.3 | Validacion de DTOs |
| class-transformer | 0.5.1 | Transformacion de objetos |
| passport | 0.7.0 | Middleware de autenticacion |
| passport-jwt | 4.0.1 | Estrategia JWT para Passport |
| uuid | 9.0.1 | Generacion de UUIDs |
| rxjs | 7.8.1 | Programacion reactiva |

### Dependencias de Desarrollo

| Libreria | Version | Descripcion |
|----------|---------|-------------|
| @nestjs/cli | 11.0.0 | CLI de NestJS |
| @nestjs/testing | 11.0.1 | Utilidades de testing |
| jest | 29.7.0 | Framework de testing |
| supertest | 7.0.0 | Testing de HTTP |
| eslint | 9.18.0 | Linter de codigo |
| prettier | 3.4.2 | Formateador de codigo |
| ts-jest | 29.2.5 | Jest para TypeScript |
| cross-env | 10.1.0 | Variables de entorno multiplataforma |

## Arquitectura

El proyecto sigue la **Arquitectura Hexagonal (Ports & Adapters)** con la siguiente organizacion:

```
src/
├── config/                 # Configuraciones (database, jwt)
├── shared/                 # Codigo compartido
│   ├── constants/         # Tokens de inyeccion
│   ├── domain/            # Entidades base
│   ├── infrastructure/    # Filtros, interceptors, decorators
│   └── interfaces/        # Interfaces de respuesta API
└── modules/
    ├── auth/              # Modulo de autenticacion
    │   ├── application/   # DTOs, Servicios
    │   ├── domain/        # Entidades, Puertos
    │   └── infrastructure/# Controllers, Guards, Strategies
    └── users/             # Modulo de usuarios
        ├── application/   # DTOs, Servicios
        ├── domain/        # Entidades, Value Objects, Puertos
        └── infrastructure/# Controllers, Repositorios, Mappers
```

### Capas de la Arquitectura

| Capa | Descripcion |
|------|-------------|
| **Domain** | Entidades de negocio, Value Objects, interfaces de puertos |
| **Application** | Casos de uso, DTOs, servicios de aplicacion |
| **Infrastructure** | Controladores, repositorios, adaptadores externos |

## Estructura del Proyecto

```
claude-initial-demo/
├── environment/            # Archivos de configuracion por ambiente
│   ├── .env.dev           # Desarrollo
│   ├── .env.stg           # Staging
│   ├── .env.uat           # UAT
│   ├── .env.prod          # Produccion
│   └── .env.example       # Plantilla de ejemplo
├── src/
│   ├── config/            # Configuraciones
│   ├── modules/           # Modulos de la aplicacion
│   ├── shared/            # Codigo compartido
│   ├── app.module.ts      # Modulo principal
│   └── main.ts            # Punto de entrada
├── test/                  # Tests e2e
├── docker-compose.yml     # Configuracion de Docker
├── tsconfig.json          # Configuracion de TypeScript
├── package.json           # Dependencias y scripts
└── README.md              # Este archivo
```

## Requerimientos

### Software Requerido

| Software | Version Minima | Descripcion |
|----------|----------------|-------------|
| Node.js | 18.x | Entorno de ejecucion JavaScript |
| npm | 9.x | Gestor de paquetes |
| Docker | 20.x | Contenedores (para PostgreSQL) |
| Docker Compose | 2.x | Orquestacion de contenedores |

### Verificar Instalacion

```bash
# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar Docker
docker --version

# Verificar Docker Compose
docker compose version
```

## Instalacion

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd claude-initial-demo
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp environment/.env.example environment/.env.dev

# Editar con tus configuraciones
nano environment/.env.dev
```

## Configuracion de Variables de Entorno

### Variables Disponibles

| Variable | Descripcion | Ejemplo |
|----------|-------------|---------|
| `DB_HOST` | Host de la base de datos | `localhost` |
| `DB_PORT` | Puerto de la base de datos | `5432` |
| `DB_USERNAME` | Usuario de la base de datos | `postgres` |
| `DB_PASSWORD` | Contrasena de la base de datos | `postgres` |
| `DB_NAME` | Nombre de la base de datos | `claude_demo` |
| `JWT_ACCESS_SECRET` | Secreto para access tokens | `your-secret-key` |
| `JWT_REFRESH_SECRET` | Secreto para refresh tokens | `your-refresh-secret` |
| `JWT_ACCESS_EXPIRES_IN` | Expiracion de access token | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Expiracion de refresh token | `7d` |
| `NODE_ENV` | Ambiente de ejecucion | `development` |
| `PORT` | Puerto de la aplicacion | `3000` |

### Ejemplo de archivo .env

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=claude_demo

# JWT
JWT_ACCESS_SECRET=your-access-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# App
NODE_ENV=development
PORT=3000
```

## Levantamiento en Desarrollo

### 1. Iniciar la base de datos con Docker

```bash
# Iniciar PostgreSQL
docker compose up -d

# Verificar que el contenedor este corriendo
docker ps
```

### 2. Iniciar la aplicacion

```bash
# Modo desarrollo con hot-reload
npm run start:dev
```

### 3. Verificar que la aplicacion este corriendo

```bash
# La aplicacion estara disponible en:
# http://localhost:3000/api

# Probar con curl
curl http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!","firstName":"John","lastName":"Doe"}'
```

## Ambientes Disponibles

| Ambiente | Comando | Puerto | Archivo de Config |
|----------|---------|--------|-------------------|
| Development | `npm run start:dev` | 3000 | `.env.dev` |
| Staging | `npm run start:stg` | 3001 | `.env.stg` |
| UAT | `npm run start:uat` | 3002 | `.env.uat` |
| Production | `npm run start:prod` | 3000 | `.env.prod` |

### Cambiar de Ambiente

```bash
# Desarrollo
npm run start:dev

# Staging
npm run start:stg

# UAT
npm run start:uat

# Produccion (requiere build previo)
npm run build
npm run start:prod
```

## Endpoints de la API

Base URL: `http://localhost:3000/api`

### Autenticacion (`/auth`)

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Registrar nuevo usuario | No |
| POST | `/auth/login` | Iniciar sesion | No |
| POST | `/auth/refresh` | Refrescar tokens | No |
| POST | `/auth/logout` | Cerrar sesion | JWT |
| POST | `/auth/logout-all` | Cerrar todas las sesiones | JWT |

### Usuarios (`/users`)

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/users/me` | Obtener perfil actual | JWT |
| PATCH | `/users/me` | Actualizar perfil actual | JWT |
| GET | `/users/:id` | Obtener usuario por ID | JWT |
| GET | `/users` | Listar todos los usuarios | JWT |

### Estructura de Respuesta

**Exito:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Data retrieved successfully",
  "data": { ... },
  "timestamp": "2026-01-23T15:00:00.000Z",
  "path": "/api/users/me"
}
```

**Error:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "email must be an email" }
  ],
  "timestamp": "2026-01-23T15:00:00.000Z",
  "path": "/api/auth/register"
}
```

## Scripts Disponibles

| Script | Descripcion |
|--------|-------------|
| `npm run start` | Iniciar en modo normal |
| `npm run start:dev` | Iniciar en desarrollo (hot-reload) |
| `npm run start:stg` | Iniciar en staging |
| `npm run start:uat` | Iniciar en UAT |
| `npm run start:prod` | Iniciar en produccion |
| `npm run start:debug` | Iniciar en modo debug |
| `npm run build` | Compilar el proyecto |
| `npm run lint` | Ejecutar linter |
| `npm run format` | Formatear codigo con Prettier |
| `npm run test` | Ejecutar tests unitarios |
| `npm run test:watch` | Ejecutar tests en modo watch |
| `npm run test:cov` | Ejecutar tests con cobertura |
| `npm run test:e2e` | Ejecutar tests end-to-end |

## Docker

### Comandos Utiles

```bash
# Iniciar contenedores
docker compose up -d

# Ver logs
docker compose logs -f

# Detener contenedores
docker compose down

# Detener y eliminar volumenes
docker compose down -v

# Reiniciar contenedores
docker compose restart
```

## Contribucion

1. Crear una rama desde `develop`
2. Realizar los cambios
3. Ejecutar `npm run lint` y `npm run test`
4. Crear un Pull Request

## Licencia

Este proyecto es privado y de uso interno.
