import { Modules } from "@medusajs/framework/utils"

/**
 * Script de seeding para el sistema Longhorn
* Crea roles, usuarios de prueba y tiendas por defecto
*/
export default async function longhornSeed(container: any) {
  console.log("🍖 Iniciando seeding de Longhorn...")

  try {
  const longhornService = container.resolve("longhorn")
const userModuleService = container.resolve(Modules.USER)
const authModuleService = container.resolve(Modules.AUTH)

// 1. Seed de roles por defecto
console.log("📝 Creando roles por defecto...")
const rolesCreated = await longhornService.seedDefaultRoles()
console.log(`✅ ${rolesCreated} roles creados`)

// 2. Seed de tiendas por defecto
console.log("🏪 Creando tiendas por defecto...")
const storesCreated = await longhornService.seedDefaultStores()
console.log(`✅ ${storesCreated.length} tiendas creadas`)

// 3. Crear usuarios de prueba para testing del filtrado jerárquico
console.log("👥 Creando usuarios de prueba...")

    const testUsers = [
  {
    email: "superadmin@longhorn.pe",
    password: "admin123",
  first_name: "Super",
    last_name: "Administrador",
        role_type: "super_admin"
  },
  {
  email: "manager@longhorn.pe", 
    password: "manager123",
        first_name: "Gerente",
    last_name: "Local",
        role_type: "local_manager"
    },
  {
    email: "staff@longhorn.pe",
      password: "staff123", 
        first_name: "Personal",
        last_name: "Local",
        role_type: "local_staff"
      }
    ]

    const createdUsers: any[] = []
    const allRoles = await longhornService.getAllRoles()
    
    for (const userData of testUsers) {
      try {
        console.log(`  Creando usuario: ${userData.email}...`)
        
        // Verificar si el usuario ya existe
        const existingUsers = await userModuleService.listUsers({ email: userData.email })
        if (existingUsers.length > 0) {
          console.log(`    ⚠️  Usuario ${userData.email} ya existe, saltando...`)
          continue
        }

        // Crear Auth Identity
        const { success, authIdentity } = await authModuleService.register("emailpass", {
          body: { 
            email: userData.email, 
            password: userData.password 
          }
        })
        
        if (!success || !authIdentity) {
          console.log(`    ❌ Error creando auth identity para ${userData.email}`)
          continue
        }

        // Crear usuario
        const [createdUser] = await userModuleService.createUsers([{
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          metadata: {
            auth_identity_id: authIdentity.id,
            created_by_seed: true
          }
        }])

        // Vincular auth identity al usuario
        await authModuleService.updateAuthIdentities([{
          id: authIdentity.id,
          app_metadata: {
            user_id: createdUser.id
          }
        }])

        // Asignar rol correspondiente
        const roleTypeMapping = {
          "super_admin": "super_admin",
          "local_manager": "store_manager", 
          "local_staff": "store_staff"
        }
        
        const targetRoleType = roleTypeMapping[userData.role_type]
        const targetRole = allRoles.find(role => role.type === targetRoleType)
        
        if (targetRole) {
          await longhornService.assignRole({
            user_id: createdUser.id,
            role_id: targetRole.id,
            metadata: { created_by_seed: true }
          })
          console.log(`    ✅ Usuario ${userData.email} creado con rol ${targetRole.name}`)
        } else {
          console.log(`    ⚠️  Rol ${targetRoleType} no encontrado para ${userData.email}`)
        }
        
        createdUsers.push({
          ...createdUser,
          role: targetRole?.name || 'Sin rol',
          auth_identity_id: authIdentity.id,
          email: createdUser.email // Asegurar que email esté presente
        } as any)
        
      } catch (error) {
        console.error(`    ❌ Error creando usuario ${userData.email}:`, error.message)
      }
    }

    // 4. Mostrar resumen
    const activeRoles = await longhornService.getActiveRoles()
    const allStores = await longhornService.getActiveStores()

    console.log("\n📊 Resumen del seeding:")
    console.log(`Roles creados: ${activeRoles.length}`)
    activeRoles.forEach(role => {
      console.log(`  - ${role.name} (${role.type})`)
    })

    console.log(`\nTiendas creadas: ${allStores.length}`)
    allStores.forEach(store => {
      console.log(`  - ${store.name} (${store.code})`)
    })

    console.log(`\nUsuarios de prueba creados: ${createdUsers.length}`)
    createdUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role || 'Sin rol'})`)  
    })

    console.log("\n🎯 URLs de testing del filtrado jerárquico:")
    console.log("Super Admin (ve todos los roles):")
    console.log(`  http://localhost:9000/app/users/roles?simulate_user=${createdUsers.find(u => u.email.includes('superadmin'))?.id || 'super_admin_user_id'}`)
    console.log("Gerente Local (NO ve Super Admin):")
    console.log(`  http://localhost:9000/app/users/roles?simulate_user=${createdUsers.find(u => u.email.includes('manager'))?.id || 'manager_user_id'}`)
    console.log("Personal Local (solo ve Personal Local):")
    console.log(`  http://localhost:9000/app/users/roles?simulate_user=${createdUsers.find(u => u.email.includes('staff'))?.id || 'staff_user_id'}`)

    console.log("\n🎉 Seeding de Longhorn completado exitosamente!")

  } catch (error) {
    console.error("❌ Error durante el seeding de Longhorn:", error)
    throw error
  }
}
