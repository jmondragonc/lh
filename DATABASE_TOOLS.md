# 🗃️ HERRAMIENTAS DE BASE DE DATOS - POSTGRESQL MCP

## 📋 Descripción General

El proyecto Longhorn cuenta con un conjunto completo de herramientas MCP (Model Context Protocol) especializadas para la gestión, análisis y optimización de bases de datos PostgreSQL. Estas herramientas permiten monitorear la salud de la base de datos, optimizar consultas y gestionar el esquema de manera eficiente.

---

## 🔧 HERRAMIENTAS DISPONIBLES

### 📊 **Análisis de Rendimiento y Salud**

#### `analyze_db_health`
**Descripción**: Análisis completo de la salud de la base de datos
**Parámetros**: 
- `health_type` (opcional): Tipo de análisis a realizar
  - `all` (default): Ejecuta todos los checks
  - `index`: Analiza índices (inválidos, duplicados, bloated)
  - `connection`: Revisa conexiones y su utilización
  - `vacuum`: Estado del vacuum y transaction ID wraparound
  - `sequence`: Secuencias en riesgo de superar su valor máximo
  - `replication`: Salud de replicación incluyendo lag y slots
  - `buffer`: Buffer cache hit rates para índices y tablas
  - `constraint`: Verifica constraints inválidos

**Casos de uso en Longhorn**:
- Monitoreo preventivo de la base de datos
- Identificación de problemas de rendimiento
- Auditoría de salud antes de despliegues en producción

#### `analyze_query_indexes`
**Descripción**: Analiza consultas específicas y recomienda índices óptimos
**Parámetros**:
- `queries`: Lista de hasta 10 consultas SQL para analizar
- `max_index_size_mb` (opcional): Tamaño máximo de índice en MB (default: 10000)
- `method` (opcional): Método de análisis (`dta` o `llm`, default: `dta`)

**Casos de uso en Longhorn**:
- Optimización de queries de filtrado jerárquico de usuarios
- Mejora de rendimiento en consultas de productos por tienda
- Análisis de queries de Sales Channels y Stock Locations

#### `analyze_workload_indexes`
**Descripción**: Analiza las consultas ejecutadas frecuentemente y recomienda índices
**Parámetros**:
- `max_index_size_mb` (opcional): Tamaño máximo de índice en MB (default: 10000)
- `method` (opcional): Método de análisis (`dta` o `llm`, default: `dta`)

**Casos de uso en Longhorn**:
- Optimización automática basada en patrones de uso real
- Identificación de oportunidades de mejora en producción

#### `get_top_queries`
**Descripción**: Identifica las consultas más problemáticas usando pg_stat_statements
**Parámetros**:
- `sort_by` (opcional): Criterio de ordenamiento
  - `resources` (default): Consultas que consumen más recursos
  - `total_time`: Por tiempo total de ejecución
  - `mean_time`: Por tiempo promedio por ejecución
- `limit` (opcional): Número de consultas a retornar (default: 10)

**Casos de uso en Longhorn**:
- Identificación de cuellos de botella en producción
- Monitoreo continuo de rendimiento
- Auditoría de consultas antes de optimizaciones

---

### 🛠️ **Gestión y Administración**

#### `execute_sql`
**Descripción**: Ejecuta cualquier consulta SQL directamente
**Parámetros**:
- `sql`: Consulta SQL a ejecutar

**Casos de uso en Longhorn**:
- Testing de nuevas consultas
- Administración manual de datos
- Verificación de estados de la base de datos

#### `explain_query`
**Descripción**: Muestra el plan de ejecución detallado de una consulta
**Parámetros**:
- `sql`: Consulta SQL a analizar
- `analyze` (opcional): Si `true`, ejecuta la consulta para estadísticas reales (default: false)
- `hypothetical_indexes` (opcional): Lista de índices hipotéticos para simular

**Formato de índices hipotéticos**:
```json
[
  {
    "table": "longhorn_store", 
    "columns": ["district"], 
    "using": "btree"
  },
  {
    "table": "longhorn_user_role", 
    "columns": ["user_id", "role_id"]
  }
]
```

**Casos de uso en Longhorn**:
- Análisis de planes de ejecución antes de crear índices
- Testing de optimizaciones sin implementar cambios
- Debugging de consultas lentas

#### `get_object_details`
**Descripción**: Muestra información detallada de objetos de la base de datos
**Parámetros**:
- `schema_name`: Nombre del esquema
- `object_name`: Nombre del objeto
- `object_type` (opcional): Tipo de objeto (`table`, `view`, `sequence`, `extension`)

**Casos de uso en Longhorn**:
- Exploración de estructura de tablas Longhorn
- Análisis de relaciones entre modelos
- Verificación de configuraciones de objetos

#### `list_schemas` / `list_objects`
**Descripción**: Lista esquemas u objetos en un esquema
**Parámetros**:
- `list_schemas`: Sin parámetros
- `list_objects`: 
  - `schema_name`: Esquema a explorar
  - `object_type` (opcional): Filtrar por tipo de objeto

**Casos de uso en Longhorn**:
- Navegación de la estructura de la base de datos
- Inventario de objetos por esquema
- Exploración de dependencias

---

## 🎯 CASOS DE USO ESPECÍFICOS PARA LONGHORN

### 1. **Optimización de Filtrado Jerárquico**
```sql
-- Consulta a optimizar
SELECT u.*, ur.role_id, r.type 
FROM "user" u 
JOIN longhorn_user_role ur ON u.id = ur.user_id 
JOIN longhorn_role r ON ur.role_id = r.id 
WHERE r.type != 'SUPER_ADMIN'
```

**Comando**: `analyze_query_indexes(queries=["consulta_arriba"])`

### 2. **Rendimiento de Productos por Tienda**
```sql
-- Consultas típicas de carta por local
SELECT smi.*, mi.name, mi.description 
FROM longhorn_store_menu_item smi 
JOIN longhorn_menu_item mi ON smi.menu_item_id = mi.id 
WHERE smi.store_id = 'store_123' AND smi.is_available = true
```

### 3. **Monitoreo de Sales Channels**
```sql
-- Consultas de conexiones channel-location
SELECT sc.*, sl.name as location_name 
FROM sales_channel sc 
JOIN sales_channel_stock_location scsl ON sc.id = scsl.sales_channel_id 
JOIN stock_location sl ON scsl.stock_location_id = sl.id
```

### 4. **Análisis de Salud Preventivo**
```bash
# Análisis completo semanal
analyze_db_health(health_type="all")

# Foco en índices tras cambios importantes
analyze_db_health(health_type="index")

# Monitoreo de conexiones en alta carga
analyze_db_health(health_type="connection")
```

### 5. **Identificación de Consultas Problemáticas**
```bash
# Top 10 consultas por tiempo total
get_top_queries(sort_by="total_time", limit=10)

# Consultas que más recursos consumen
get_top_queries(sort_by="resources", limit=5)
```

---

## 📈 INTEGRACIÓN CON METODOLOGÍA DE DESARROLLO

### **Grupo A (Infraestructura Base)**
- `list_schemas` / `list_objects`: Verificar estructura de modelos Longhorn
- `get_object_details`: Analizar relaciones entre Sales Channels y Stock Locations
- `execute_sql`: Testing de migraciones y seeding

### **Grupo B (Autenticación y Roles)**
- `analyze_query_indexes`: Optimizar filtrado jerárquico de usuarios
- `explain_query`: Verificar planes de ejecución de queries de roles
- `get_top_queries`: Identificar consultas de autenticación lentas

### **Grupo D (Gestión de Productos)**
- `analyze_workload_indexes`: Optimizar consultas de carta por tienda
- `analyze_query_indexes`: Mejorar búsquedas de productos
- `analyze_db_health`: Monitorear impacto de datos de carta

### **Testing y Producción**
- `get_top_queries`: Identificación continua de cuellos de botella
- `analyze_db_health`: Monitoreo preventivo de salud
- `explain_query`: Debugging de problemas de rendimiento

---

## 🚀 MEJORES PRÁCTICAS

### **Frecuencia de Análisis**
- **Diario**: `get_top_queries` para monitoreo continuo
- **Semanal**: `analyze_db_health` completo
- **Por feature**: `analyze_query_indexes` antes de merge
- **Mensual**: `analyze_workload_indexes` para optimización global

### **Umbrales de Alerta**
- Consultas > 1000ms de tiempo promedio
- Índices bloated > 20% del tamaño de tabla
- Buffer cache hit rate < 95%
- Conexiones activas > 80% del máximo

### **Workflow de Optimización**
1. Identificar problema con `get_top_queries`
2. Analizar plan con `explain_query`
3. Generar recomendaciones con `analyze_query_indexes`
4. Implementar índices recomendados
5. Verificar mejora con `explain_query` (analyze=true)
6. Monitorear impacto con `analyze_db_health`

---

## 📚 COMANDOS DE EJEMPLO

### Análisis Completo de Salud
```bash
analyze_db_health(health_type="all")
```

### Optimización de Consulta Específica
```bash
analyze_query_indexes(
  queries=[
    "SELECT * FROM longhorn_store WHERE district = 'Miraflores'",
    "SELECT u.* FROM user u JOIN longhorn_user_role ur ON u.id = ur.user_id WHERE ur.role_id = 'role_123'"
  ],
  max_index_size_mb=5000
)
```

### Plan de Ejecución con Índices Hipotéticos
```bash
explain_query(
  sql="SELECT ls.*, u.first_name FROM longhorn_store ls JOIN longhorn_user_store lus ON ls.id = lus.store_id JOIN user u ON lus.user_id = u.id",
  hypothetical_indexes=[
    {"table": "longhorn_user_store", "columns": ["store_id", "user_id"]},
    {"table": "longhorn_store", "columns": ["district"]}
  ]
)
```

### Identificación de Consultas Problemáticas
```bash
get_top_queries(sort_by="total_time", limit=15)
```

---

**Estas herramientas son fundamentales para mantener el rendimiento óptimo del sistema Longhorn conforme escala a múltiples sedes y mayor volumen de transacciones.**
