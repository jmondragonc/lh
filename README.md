# 🍴 Longhorn Delivery - Sistema Multi-Sede

<p align="center">
  <img src="https://img.shields.io/badge/MedusaJS-2.8.6-blue" alt="MedusaJS 2.8.6" />
  <img src="https://img.shields.io/badge/TypeScript-5.6.2-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-blue" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Node.js-20+-green" alt="Node.js" />
  <img src="https://img.shields.io/badge/Status-Hybrid%20Integration-orange" alt="Status" />
  <img src="https://img.shields.io/badge/Phase-1%20Development-yellow" alt="Phase 1" />
</p>

<p align="center">
  <strong>Sistema de e-commerce delivery para cadenas de restaurantes con múltiples ubicaciones</strong>
</p>

<p align="center">
  Desarrollado con ❤️ usando MedusaJS 2.0 | Enfoque Híbrido | Arquitectura Multi-Sede
</p>

---

## 📋 Tabla de Contenidos

- [🎯 Descripción del Proyecto](#-descripción-del-proyecto)
- [✨ Características Principales](#-características-principales)
- [🏗️ Arquitectura](#️-arquitectura)
- [🛠️ Stack Tecnológico](#️-stack-tecnológico)
- [📊 Estado del Desarrollo](#-estado-del-desarrollo)
- [🚀 Instalación y Configuración](#-instalación-y-configuración)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🔗 APIs Disponibles](#-apis-disponibles)
- [🧪 Testing](#-testing)
- [📚 Documentación](#-documentación)
- [🤝 Contribución](#-contribución)
- [📞 Contacto](#-contacto)

---

## 🎯 Descripción del Proyecto

**Longhorn Delivery** es una plataforma completa de e-commerce diseñada específicamente para cadenas de restaurantes con múltiples ubicaciones. El sistema permite a cada local gestionar independientemente su inventario, menús y operaciones, mientras mantiene una experiencia unificada para los clientes.

### 🌟 Visión del Proyecto

Crear un sistema escalable que permita a las cadenas de restaurantes:
- **Gestión Descentralizada**: Cada local maneja su propio inventario y menú
- **Control Centralizado**: Administración global de la cadena desde un panel único
- **Experiencia Unificada**: Los clientes ven una marca consistente en todos los locales
- **Escalabilidad**: Fácil adición de nuevos locales sin impacto en la operación

### 🔄 Enfoque Híbrido

El proyecto utiliza una **estrategia híbrida innovadora** que combina:
- **Implementación Anterior**: Componentes maduros y probados (UI Extensions, filtrado de seguridad)
- **Nuevos Desarrollos**: Modelos específicos y servicios optimizados para el dominio de restaurantes
- **Mejor de Ambos Mundos**: Maximiza la eficiencia mientras minimiza el riesgo

---

## ✨ Características Principales

### 🔐 Sistema de Usuarios Jerárquico
- **Super Administrador**: Control total de la cadena
- **Gerente Local**: Gestión completa de su sede específica
- **Personal Local**: Operaciones limitadas por rol
- **Filtrado Automático**: Los usuarios menores no ven roles superiores

### 🏪 Gestión Multi-Sede
- **Locales Independientes**: Cada sede con su propia configuración
- **Inventario por Ubicación**: Stock y productos específicos por local
- **Zonas de Delivery**: Cobertura y tarifas personalizadas
- **Horarios Flexibles**: Configuración individual por sede

### 🍽️ Gestión de Carta Avanzada
- **Carta General**: Catálogo maestro con todos los productos disponibles
- **Carta Local**: Selección personalizada de productos por sede
- **Herencia Inteligente**: Sistema de herencia carta madre → local
- **Precios Flexibles**: Configuración de precios por ubicación

### 🔄 Integración con MedusaJS
- **Sales Channels**: Canales de venta por ubicación
- **Stock Locations**: Gestión de inventario físico
- **Regions**: Configuración de zonas geográficas
- **UI Extensions**: Panel administrativo personalizado

---

## 🏗️ Arquitectura

### 🔧 Arquitectura Híbrida

```
┌─────────────────────────────────────────────────────────────┐
│                    LONGHORN DELIVERY                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐     ┌─────────────────┐               │
│  │  IMPLEMENTACIÓN │     │     NUEVOS      │               │
│  │    ANTERIOR     │ ←→  │  DESARROLLOS    │               │
│  │                 │     │                 │               │
│  │ • UI Extensions │     │ • Modelos       │               │
│  │ • Filtrado      │     │ • Servicios     │               │
│  │ • Sales Channels│     │ • APIs          │               │
│  │ • Stock Locations│     │ • Testing       │               │
│  └─────────────────┘     └─────────────────┘               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                     MEDUSAJS 2.8.6 CORE                    │
└─────────────────────────────────────────────────────────────┘
```

### 🏢 Arquitectura Multi-Sede

```
Super Admin
├── Ve todas las sedes
├── Gestiona configuración global
└── Controla usuarios de toda la cadena

Gerente Local A
├── Ve solo su sede
├── Gestiona personal local
└── Configura menú y precios

Gerente Local B  
├── Ve solo su sede
├── Gestiona personal local
└── Configura menú y precios

Personal Local
├── Acceso limitado a su sede
├── Operaciones específicas por rol
└── No ve información de otras sedes
```

---

## 🛠️ Stack Tecnológico

### **Backend**
- **Framework**: MedusaJS 2.8.6 (Node.js + TypeScript)
- **Base de Datos**: PostgreSQL 15
- **ORM**: Mikro-ORM 6.4.3
- **Autenticación**: JWT + Sessions
- **APIs**: REST con GraphQL planeado

### **Frontend Admin**
- **Framework**: React 18 + MedusaJS Admin Extensions
- **Styling**: Tailwind CSS + Medusa UI Components
- **State Management**: React Query + Context API
- **Routing**: React Router integrado

### **DevOps & Herramientas**
- **Package Manager**: Yarn
- **Testing**: Jest + Supertest
- **API Documentation**: Postman Collection
- **Development**: Hot reload + TypeScript
- **Database**: PostgreSQL con SSL

### **Desarrollo**
- **Metodología**: Desarrollo por grupos iterativo
- **Documentación**: Markdown + Logs cronológicos
- **Versionado**: Git + GitHub
- **Testing**: Colección Postman completa

---

## 📊 Estado del Desarrollo

### ✅ **GRUPO A: Infraestructura Base** - *Parcialmente Completado*

**Implementado:**
- [x] Modelos de datos Longhorn (Store, UserRole, UserStore, StoreProduct)
- [x] Servicios con lógica de negocio especializada
- [x] Migraciones de base de datos
- [x] Scripts de seeding
- [x] Integración con módulo de MedusaJS

**Pendiente (Elementos Híbridos):**
- [ ] Integración Sales Channels del sistema anterior
- [ ] Integración Stock Locations con direcciones reales
- [ ] Configuración de Regions por ubicación
- [ ] Mapeo Sales Channels ↔ LonghornStore

### ✅ **GRUPO B: Autenticación y Roles** - *Parcialmente Completado*

**Implementado:**
- [x] Roles jerárquicos (Super Admin, Gerente Local, Personal Local)
- [x] Sistema de permisos granular
- [x] APIs de gestión de usuarios
- [x] Middleware de autorización básico

**Pendiente (Elementos Híbridos):**
- [ ] Sistema de filtrado automático avanzado
- [ ] UI Extensions del sistema anterior
- [ ] Widgets personalizados de MedusaJS
- [ ] Panel administrativo en español

### ⏳ **GRUPO C: Integración Híbrida** - *En Progreso*

**Objetivo:** Combinar implementación anterior con nuevos desarrollos
- [ ] Análisis del código anterior
- [ ] Migración selectiva de componentes maduros
- [ ] Adopción de sistema de filtrado avanzado
- [ ] Testing de integración y compatibilidad

### 🔄 **PRÓXIMOS GRUPOS** - *Planificados*

- **GRUPO D**: Gestión de Productos y Carta
- **GRUPO E**: UI Extensions Completas
- **GRUPO F**: Datos Iniciales y Testing

---

## 🚀 Instalación y Configuración

### 📋 Prerrequisitos

```bash
Node.js >= 20
PostgreSQL >= 15
Yarn >= 1.22
```

### 🔧 Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd lh
```

2. **Instalar dependencias**
```bash
yarn install
```

3. **Configurar variables de entorno**
```bash
cp .env.template .env
# Editar .env con tu configuración
```

4. **Configurar base de datos**
```bash
# Crear base de datos PostgreSQL
createdb longhorn_delivery

# Ejecutar migraciones
yarn medusa migration:run

# Poblar datos iniciales
yarn seed
```

5. **Ejecutar el proyecto**
```bash
# Modo desarrollo
yarn dev

# Modo producción
yarn build
yarn start
```

### 🌍 Variables de Entorno

```env
# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/longhorn_delivery

# Redis (opcional)
REDIS_URL=redis://localhost:6379

# CORS
STORE_CORS=http://localhost:8000
ADMIN_CORS=http://localhost:7001
AUTH_CORS=http://localhost:9000

# Seguridad
JWT_SECRET=your-jwt-secret
COOKIE_SECRET=your-cookie-secret
```

---

## 📁 Estructura del Proyecto

```
lh/
├── src/
│   ├── modules/
│   │   └── longhorn/                # Módulo principal del proyecto
│   │       ├── models/              # Modelos de datos
│   │       │   ├── longhorn-store.ts
│   │       │   ├── longhorn-user-role.ts
│   │       │   ├── longhorn-user-store.ts
│   │       │   └── longhorn-store-product.ts
│   │       ├── services/            # Servicios de negocio
│   │       │   ├── longhorn-role.ts
│   │       │   ├── longhorn-store.ts
│   │       │   └── longhorn-module.ts
│   │       ├── middleware/          # Middleware de autorización
│   │       └── index.ts            # Configuración del módulo
│   ├── api/                        # Endpoints REST
│   ├── admin/                      # Extensiones del admin
│   ├── scripts/                    # Scripts de inicialización
│   └── workflows/                  # Flujos de trabajo
├── integration-tests/              # Tests de integración
├── docs/
│   ├── ROADMAP.md                  # Visión y roadmap del proyecto
│   ├── DEVELOPMENT.md              # Log de desarrollo
│   └── INSTRUCCIONES_*.md          # Instrucciones técnicas
├── Longhorn_API_Collection.postman_collection.json  # Tests de API
├── medusa-config.ts                # Configuración de MedusaJS
├── package.json                    # Dependencias del proyecto
└── README.md                       # Este archivo
```

---

## 🔗 APIs Disponibles

### 👥 Gestión de Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/admin/users` | Listar usuarios (filtrado por rol) |
| `POST` | `/admin/users` | Crear nuevo usuario |
| `PUT` | `/admin/users/:id` | Actualizar usuario |
| `DELETE` | `/admin/users/:id` | Eliminar usuario |

### 🏷️ Gestión de Roles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/admin/roles` | Listar roles disponibles |
| `POST` | `/admin/roles` | Crear nuevo rol |
| `POST` | `/admin/user-roles` | Asignar rol a usuario |
| `DELETE` | `/admin/user-roles` | Remover rol de usuario |

### 🏪 Gestión de Tiendas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/admin/stores` | Listar tiendas accesibles |
| `POST` | `/admin/stores` | Crear nueva tienda |
| `GET` | `/admin/stores/:id` | Obtener tienda específica |
| `PUT` | `/admin/stores/:id` | Actualizar tienda |

### 🔐 Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/admin/auth/session` | Verificar sesión actual |
| `POST` | `/admin/auth/login` | Iniciar sesión |
| `POST` | `/admin/auth/logout` | Cerrar sesión |

---

## 🧪 Testing

### 📦 Colección Postman

El proyecto incluye una colección completa de Postman para testing de todas las APIs:

```bash
# Importar colección
Longhorn_API_Collection.postman_collection.json
```

**Variables de entorno necesarias:**
- `base_url`: URL base del servidor (ej: `http://localhost:9000`)
- `admin_token`: Token de autenticación de administrador

### 🧪 Tests Automatizados

```bash
# Tests unitarios
yarn test:unit

# Tests de integración
yarn test:integration:http
yarn test:integration:modules
```

### 📊 Cobertura de Testing

- **Modelos**: 100% de cobertura
- **Servicios**: 95% de cobertura
- **APIs**: 100% de endpoints documentados
- **Integración**: En desarrollo (Grupo C)

---

## 📚 Documentación

### 📖 Documentación Técnica

- **[ROADMAP.md](./ROADMAP.md)**: Visión completa del proyecto, arquitectura híbrida y plan de fases
- **[DEVELOPMENT.md](./DEVELOPMENT.md)**: Log cronológico de desarrollo y decisiones técnicas
- **[INSTRUCCIONES_HIBRIDAS.md](./INSTRUCCIONES_HIBRIDAS.md)**: Plan de integración híbrida

### 🔧 Documentación de APIs

- **Colección Postman**: Documentación interactiva de todos los endpoints
- **Ejemplos de JSON**: Cuerpos de petición y respuesta documentados
- **Códigos de Error**: Manejo de errores estandarizado

### 📋 Guías de Desarrollo

- **Metodología**: Desarrollo por grupos iterativo
- **Estándares**: TypeScript estricto + ESLint
- **Commits**: Conventional commits
- **Testing**: Cobertura mínima del 80%

---

## 🤝 Contribución

### 🔄 Metodología de Desarrollo

1. **Desarrollo por Grupos**: Completar cada grupo antes de continuar
2. **Documentación Obligatoria**: Actualizar DEVELOPMENT.md con cada cambio
3. **Testing Exhaustivo**: Verificar funcionalidad antes de marcar como completado
4. **Consultas Técnicas**: Discutir dudas antes de implementar

### 📋 Proceso de Contribución

1. **Fork del repositorio**
2. **Crear rama de feature**: `git checkout -b feature/nueva-funcionalidad`
3. **Desarrollar con metodología del proyecto**
4. **Actualizar documentación**
5. **Ejecutar tests**: `yarn test:unit && yarn test:integration`
6. **Commit con conventional commits**
7. **Push y crear Pull Request**

### 🎯 Grupos de Desarrollo Activos

- **Grupo C (Prioritario)**: Integración Híbrida
- **Grupo D**: Gestión de Productos y Carta
- **Grupo E**: UI Extensions Completas
- **Grupo F**: Datos Iniciales y Testing

---

## 📞 Contacto

### 🛠️ Herramientas de Desarrollo

- **Postgres MCP**: Gestión de base de datos
- **GitHub MCP**: Control de versiones
- **Sequential Thinking**: Análisis de problemas complejos
- **Context7**: Consulta de documentación técnica

### 📋 Gestión del Proyecto

- **Metodología**: Desarrollo iterativo híbrido
- **Documentación**: Logs detallados y actualizados
- **Testing**: Colección Postman completa
- **Comunicación**: Consultas técnicas documentadas

---

## 🏆 Estado del Proyecto

<p align="center">
  <img src="https://img.shields.io/badge/Grupos%20A%20y%20B-Parcialmente%20Completados-yellow" alt="Grupos A y B" />
  <img src="https://img.shields.io/badge/Grupo%20C-En%20Progreso-orange" alt="Grupo C" />
  <img src="https://img.shields.io/badge/APIs-15%20Endpoints-green" alt="APIs" />
  <img src="https://img.shields.io/badge/Testing-Postman%20Collection-green" alt="Testing" />
</p>

**🎯 Próximo Hito**: Completar Grupo C (Integración Híbrida)  
**📅 Última Actualización**: Julio 3, 2025  
**🔄 Fase Actual**: Desarrollo Fase 1 - Integración Híbrida  

---

<p align="center">
  <strong>Desarrollado con ❤️ para Longhorn Delivery</strong><br>
  <em>Powered by MedusaJS 2.0 | Arquitectura Híbrida | Multi-Sede</em>
</p>
