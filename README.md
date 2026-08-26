# Gestor de Tareas INDE

Aplicacion full stack para gestionar tareas y etiquetas. El repositorio contiene una API REST desarrollada con .NET 8, una base de datos PostgreSQL y una interfaz web desarrollada con React y Vite.

> Estado actual: el backend ya dispone de operaciones para tareas y etiquetas. El frontend se encuentra en desarrollo y actualmente utiliza un mock para simular el inicio de sesion, el registro y la recuperacion de contrasena.

## Tecnologias

### Frontend

- React 19
- Vite 8
- React Router
- Zustand para el estado de la autenticacion
- Axios para futuras llamadas HTTP
- React Hook Form para formularios
- Tailwind CSS y Material Tailwind para estilos
- Lucide React y Heroicons para iconos

### Backend

- .NET 8 / ASP.NET Core Web API
- Entity Framework Core para el acceso a datos
- PostgreSQL como base de datos
- FluentValidation para validar DTOs
- JWT Bearer para autenticacion
- Swagger/OpenAPI para probar la API
- Serilog para registrar eventos y peticiones
- NetEscapades Security Headers para cabeceras de seguridad

## Requisitos previos

Instala las siguientes herramientas antes de ejecutar el proyecto:

- [.NET SDK 8](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) compatible con el proyecto
- [pnpm](https://pnpm.io/installation)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git, de forma opcional, para clonar el repositorio

Puedes comprobar las instalaciones con:

```bash
dotnet --version
node --version
pnpm --version
docker --version
```

## Estructura del proyecto

```text
GestorTareas-INDE/
├── INDE-frontend/                 # Aplicacion web React
│   ├── src/app/                   # Composicion principal y rutas
│   ├── src/features/auth/         # Componentes y estado de autenticacion
│   ├── src/shared/apis/            # Comunicacion simulada con la API
│   └── src/style/                 # Estilos globales
├── task-manager-INDE/
│   ├── pg_db/                     # Configuracion de PostgreSQL con Docker
│   └── task-service/
│       ├── TaskService.sln        # Solucion .NET
│       └── src/
│           ├── TaskService.Api/         # HTTP, controladores y middlewares
│           ├── TaskService.Application/# DTOs, validadores y casos de uso
│           ├── TaskService.Domain/     # Entidades, enums e interfaces
│           └── TaskService.Persistence/# EF Core, repositorios y migraciones
└── README.md
```

El backend sigue una separacion por capas:

1. **Domain:** contiene las reglas y modelos centrales, como `TaskItem`, `Tag` y `TaskStatus`.
2. **Application:** define los DTOs, validaciones, interfaces y servicios de aplicacion.
3. **Persistence:** conecta la aplicacion con PostgreSQL mediante `AppDbContext`, repositorios y migraciones.
4. **Api:** recibe las peticiones HTTP, aplica middlewares y publica los controladores.

## Puesta en marcha

Abre tres terminales en la carpeta raiz del repositorio.

### 1. Iniciar PostgreSQL

```bash
cd task-manager-INDE/pg_db
docker compose up -d
```

La base de datos queda disponible en `localhost:5435`. El contenedor usa el nombre `task_container` y crea la base `task_DB`.

Para detenerla:

```bash
docker compose down
```

### 2. Iniciar la API

```bash
cd task-manager-INDE/task-service
dotnet restore
dotnet run --project src/TaskService.Api
```

Al arrancar, la API aplica automaticamente las migraciones pendientes y ejecuta la carga inicial de datos. En entorno de desarrollo, Swagger se sirve en la raiz de la API.

La URL exacta se muestra en la terminal. El endpoint de comprobacion es:

```text
GET /health
```

Tambien existe la ruta compatible `GET /api/v1/health`.

### 3. Iniciar el frontend

```bash
cd INDE-frontend
pnpm install
pnpm dev
```

Vite mostrara la URL local, normalmente `http://localhost:5173`. Las rutas disponibles actualmente son:

- `/login`
- `/register`
- `/forgot-password`

Cualquier otra ruta redirige a `/login`.

## Endpoints de la API

La API usa JSON y devuelve identificadores `guid` para las entidades.

### Tareas

| Metodo | Ruta | Funcion |
| --- | --- | --- |
| `GET` | `/api/tasks` | Obtiene todas las tareas |
| `GET` | `/api/tasks/{id}` | Obtiene una tarea por su identificador |
| `POST` | `/api/tasks` | Crea una tarea y valida su DTO |
| `PUT` | `/api/tasks/{id}` | Actualiza una tarea |
| `DELETE` | `/api/tasks/{id}` | Elimina una tarea |
| `POST` | `/api/tasks/{id}/tags/{tagId}` | Asigna una etiqueta |
| `DELETE` | `/api/tasks/{id}/tags/{tagId}` | Quita una etiqueta |

### Etiquetas

| Metodo | Ruta | Funcion |
| --- | --- | --- |
| `GET` | `/api/tags` | Obtiene todas las etiquetas |
| `GET` | `/api/tags/{id}` | Obtiene una etiqueta por su identificador |
| `POST` | `/api/tags` | Crea una etiqueta y valida su DTO |
| `DELETE` | `/api/tags/{id}` | Elimina una etiqueta |

Los errores de validacion responden con `400 Bad Request`. Si no se encuentra una tarea o etiqueta, la API responde con `404 Not Found`. Una eliminacion correcta responde con `204 No Content`.

## Autenticacion del frontend

Mientras se integra la API de autenticacion, `src/shared/apis/authMock.js` simula respuestas del servidor:

- Usuario de prueba: `admin`
- Contrasena de prueba: `admin123`
- El mock devuelve un token JWT ficticio y datos de usuario.

Estos datos solo sirven para desarrollo local. No deben utilizarse como mecanismo de autenticacion en produccion.

## Migraciones y base de datos

Las migraciones de Entity Framework Core se encuentran en `TaskService.Persistence/Migrations`. Para crear una nueva migracion desde la carpeta `task-service`:

```bash
dotnet ef migrations add NombreDeLaMigracion --project src/TaskService.Persistence --startup-project src/TaskService.Api
```

La aplicacion ejecuta `Database.MigrateAsync()` al iniciar, por lo que aplica las migraciones existentes automaticamente.

## Buenas practicas para colaborar

1. Crea una rama para cada funcionalidad o correccion.
2. Mantén las reglas de negocio en `TaskService.Domain` y `TaskService.Application`.
3. No conectes los controladores directamente con la base de datos: utiliza servicios y repositorios.
4. No guardes contrasenas, tokens reales ni secretos en el repositorio.
5. Prueba el endpoint de salud y las operaciones afectadas antes de abrir un pull request.

## Explicacion didactica de este README

- **Titulo y descripcion:** indican que problema resuelve el proyecto y que partes lo forman.
- **Estado actual:** evita confundir funcionalidades planificadas con funcionalidades ya terminadas.
- **Tecnologias:** permite saber que herramientas hay que estudiar o instalar.
- **Requisitos previos:** lista las dependencias externas necesarias para trabajar.
- **Estructura:** funciona como un mapa del repositorio y muestra la responsabilidad de cada carpeta.
- **Puesta en marcha:** contiene los comandos en el orden correcto para levantar base de datos, API y frontend.
- **Endpoints:** documenta el contrato HTTP que debe respetar el frontend al comunicarse con la API.
- **Autenticacion:** explica que el login es temporalmente simulado y evita usar el mock como una solucion real.
- **Migraciones:** describe como evoluciona el esquema de la base de datos sin modificarlo manualmente.
- **Buenas practicas:** establece reglas sencillas para mantener el proyecto ordenado y seguro.

## Licencia

Consulta el archivo [LICENSE](LICENSE) para conocer las condiciones de uso del proyecto.
