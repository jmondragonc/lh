# TESTING DEL FILTRADO JERÁRQUICO - PROYECTO LONGHORN

## 🎯 OBJETIVO
Verificar que el filtrado jerárquico funciona correctamente en ambas páginas:
- **Gestión de Roles**: Usuarios menores NO ven roles Super Admin
- **Gestión de Usuarios**: Usuarios menores NO ven usuarios con rol Super Admin

## 🧪 URLs DE TESTING

### 📋 1. GESTIÓN DE ROLES

#### Super Administrador (debería ver TODOS los roles)
```
http://localhost:9000/app/users/roles?simulate_user=super_admin_user_id
```
**✅ Esperado**: Ve todos los roles (Super Admin, Gerente Local, Personal Local)
**✅ Mensaje**: Sin mensaje de filtrado

#### Gerente Local (NO debería ver Super Admin)
```
http://localhost:9000/app/users/roles?simulate_user=manager_user_id
```
**✅ Esperado**: Solo ve (Gerente Local, Personal Local)
**⚠️ Mensaje**: "Vista filtrada - No se muestran roles de Super Administrador"

#### Personal Local (solo debería ver Personal Local)
```
http://localhost:9000/app/users/roles?simulate_user=staff_user_id
```
**✅ Esperado**: Solo ve (Personal Local)
**⚠️ Mensaje**: "Vista filtrada - No se muestran roles de Super Administrador"

### 👥 2. GESTIÓN DE USUARIOS

#### Super Administrador (debería ver TODOS los usuarios)
```
http://localhost:9000/app/users/management?simulate_user=super_admin_user_id
```
**✅ Esperado**: Ve todos los usuarios incluyendo otros Super Admins
**✅ Mensaje**: Sin mensaje de filtrado

#### Gerente Local (NO debería ver Super Admins)
```
http://localhost:9000/app/users/management?simulate_user=manager_user_id
```
**✅ Esperado**: Ve solo usuarios SIN rol Super Admin
**⚠️ Mensaje**: "Vista filtrada - No se muestran usuarios con roles de Super Administrador"

#### Personal Local (NO debería ver Super Admins)
```
http://localhost:9000/app/users/management?simulate_user=staff_user_id
```
**✅ Esperado**: Ve solo usuarios SIN rol Super Admin  
**⚠️ Mensaje**: "Vista filtrada - No se muestran usuarios con roles de Super Administrador"

## 🔧 TESTING DE FUNCIONALIDADES

### 📝 3. CREACIÓN DE ROLES

#### Gerente Local intenta crear Super Admin (debería FALLAR)
1. Ir a: `http://localhost:9000/app/users/roles?simulate_user=manager_user_id`
2. Intentar crear rol tipo "Super Administrador"
3. **✅ Esperado**: Error 403 "No tienes permisos para crear roles de tipo: super_admin"

#### Personal Local intenta crear cualquier rol (debería FALLAR)
1. Ir a: `http://localhost:9000/app/users/roles?simulate_user=staff_user_id`
2. Intentar crear cualquier rol
3. **✅ Esperado**: Error 403 con mensaje de permisos insuficientes

### ✏️ 4. EDICIÓN DE ROLES

#### Gerente Local intenta editar rol Super Admin (debería ser INVISIBLE)
1. Ir a: `http://localhost:9000/app/users/roles?simulate_user=manager_user_id`
2. **✅ Esperado**: Rol Super Admin NO aparece en la lista (no puede editarlo)

#### Super Admin puede editar cualquier rol (debería FUNCIONAR)
1. Ir a: `http://localhost:9000/app/users/roles?simulate_user=super_admin_user_id`
2. **✅ Esperado**: Puede editar cualquier rol incluyendo Super Admin

## 🎮 USUARIOS DE PRUEBA CREADOS

Si se ejecutó el seeding, estos usuarios deberían existir:
- **superadmin@longhorn.pe** (password: admin123)
- **manager@longhorn.pe** (password: manager123)  
- **staff@longhorn.pe** (password: staff123)

Los IDs exactos aparecerán en la consola después del seeding.

## 📊 CRITERIOS DE ÉXITO

### ✅ SEGURIDAD IMPLEMENTADA
- [ ] Gerentes NUNCA ven roles Super Admin
- [ ] Gerentes NUNCA ven usuarios Super Admin
- [ ] Personal NUNCA ve roles Super Admin  
- [ ] Personal NUNCA ve usuarios Super Admin

### ✅ FUNCIONALIDAD PRESERVADA
- [ ] Super Admin ve todo (sin restricciones)
- [ ] Super Admin puede crear/editar cualquier rol
- [ ] Gerentes pueden crear solo Personal Local

### ✅ UI/UX APROPIADA
- [ ] Mensajes "Vista filtrada" aparecen cuando corresponde
- [ ] Dropdowns solo muestran opciones permitidas
- [ ] Errores 403 con mensajes en español

## 🚨 SEÑALES DE PROBLEMAS

### ❌ FALLOS CRÍTICOS
- Gerente puede ver usuarios con rol Super Admin
- Personal puede crear roles
- Aparece rol "Super Administrador" en dropdown para no-Super-Admins
- No aparece mensaje "Vista filtrada" cuando debería

### ⚠️ VERIFICAR SI:
- Console.log muestra filtrado activo/inactivo correctamente
- APIs retornan `filtered: true/false` apropiadamente
- Simulación de usuarios funciona consistentemente

## 🔄 PASOS DE TESTING RÁPIDO

1. **Servidor funcionando**: `npm run dev`
2. **Probar URL Super Admin**: Debería ver TODO
3. **Probar URL Gerente**: NO debería ver Super Admin roles/usuarios
4. **Probar URL Personal**: Solo debería ver Personal Local
5. **Verificar mensajes**: "Vista filtrada" aparece apropiadamente

## 📋 REPORTE DE TESTING

Usar esta plantilla para reportar resultados:

```
TESTING COMPLETADO: [FECHA]

✅ Super Admin ve todos los roles: [ ]
✅ Gerente NO ve Super Admin roles: [ ]  
✅ Personal solo ve Personal Local: [ ]
✅ Super Admin ve todos los usuarios: [ ]
✅ Gerente NO ve Super Admin usuarios: [ ]
✅ Personal NO ve Super Admin usuarios: [ ]
✅ Mensajes "Vista filtrada" correctos: [ ]
✅ Errores de permisos funcionan: [ ]

PROBLEMAS ENCONTRADOS:
- 
- 

ESTADO GENERAL: ✅ FUNCIONANDO / ⚠️ PROBLEMAS MENORES / ❌ FALLOS CRÍTICOS
```
