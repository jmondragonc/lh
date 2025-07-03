# PROYECTO LONGHORN - INSTRUCCIONES CLAUDE DESKTOP

## CONTEXTO
Sistema delivery multi-sede para restaurantes. **ENFOQUE HÍBRIDO**: Combinar implementación previa existente + nuevos desarrollos.

## REQUERIMIENTOS ESPECÍFICOS - FASE 1

### JERARQUÍA DE USUARIOS
- **Super Administrador**: Control total del ecommerce, crea todos los usuarios
- **Gerente Local**: Gestiona su local, crea solo Personal Local
- **Personal Local**: Operaciones limitadas en su local
- **REGLA CRÍTICA**: Usuarios menores NO ven Super Administrador ni su rol

### GESTIÓN DE PRODUCTOS
- **Carta General**: Catálogo maestro con todos los platos de Longhorn
- **Carta Local**: Cada local selecciona productos de la carta general para delivery
- **Acceso**: Usuarios solo ven productos/información de su local según permisos

### UI EXTENSIONS REQUERIDAS
- **Menú lateral "Usuarios"** en panel Medusa con submenús:
  - Gestión de Roles
  - Gestión de Usuarios
- **Asignación de roles** con tags visuales acorde a UI de MedusaJS
- **Creación de usuarios**: Super Admin (todos), Gerentes (solo Personal)

### DATOS INICIALES
- Poblar Carta General con categorías y platos reales de Longhorn (investigar online)

## ESTADO ACTUAL
- **Grupos A y B**: PARCIALMENTE COMPLETADOS (faltan elementos del sistema anterior)
- **Próximo**: Grupo C - Integración Híbrida

## GRUPOS DE DESARROLLO

### GRUPO A: Infraestructura Base ⚠️ PARCIAL
**Implementado**: Modelos Longhorn, servicios, migraciones
**Falta**: Sales Channels, Stock Locations, Regions del sistema anterior

### GRUPO B: Autenticación y Roles ⚠️ PARCIAL  
**Implementado**: APIs básicas, roles básicos
**Falta**: Filtrado automático (usuarios menores no ven Super Admin), UI Extensions, widgets

### GRUPO C: Integración Híbrida ⏳ PRIORIDAD
- Análisis código anterior
- Migración selectiva UI Extensions
- Adopción filtrado de seguridad avanzado
- Integración Sales Channels con modelos Longhorn

### GRUPO D: Gestión Productos y Carta ⏳ PENDIENTE
- Modelo carta general con datos reales Longhorn
- Sistema herencia carta madre → local
- APIs productos por sede

### GRUPO E: UI Extensions Completas ⏳ PENDIENTE
- Menú lateral "Usuarios" con submenús
- Páginas gestión usuarios/roles
- Tags visuales para asignación roles

### GRUPO F: Datos Iniciales ⏳ PENDIENTE
- Carta Longhorn real (investigar online)
- Categorías y platos poblados

## METODOLOGÍA
1. **Desarrollar por grupos** - completar antes de continuar
2. **Documentar en DEVELOPMENT.md** - log técnico cronológico
3. **Actualizar Postman** - después de cada lote de endpoints
4. **Consultar dudas** antes de implementar
5. **Testing exhaustivo** antes de marcar completo

## ARCHIVOS CLAVE
- `ROADMAP.md` - Visión estratégica
- `DEVELOPMENT.md` - Log técnico
- `Longhorn_API_Collection.postman_collection.json` - Testing

## HERRAMIENTAS
- Postgres MCP, GitHub MCP, Sequential Thinking, Context7

## INSTRUCCIONES ESPECÍFICAS
- **Enfoque híbrido**: Aprovechar código anterior + nuevos desarrollos
- **Prioridad**: Completar elementos híbridos Grupos A/B o empezar Grupo C
- **Documentar**: Cada cambio en DEVELOPMENT.md
- **No proceder** al siguiente grupo hasta completar actual
- **Consultar**: Si hay dudas técnicas o de interpretación