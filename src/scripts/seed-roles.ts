import { loadEnv } from "@medusajs/framework/utils"
import { createMedusaContainer } from "@medusajs/framework"

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

async function seedRoles() {
  console.log("🌱 Starting roles seeding...")

  const container = await createMedusaContainer()
  const longhornService = container.resolve("longhorn")

  try {
    // Verificar si ya existen roles
    const existingRoles = await longhornService.getAllRoles()
    
    if (existingRoles.length > 0) {
      console.log(`ℹ️ Found ${existingRoles.length} existing roles. Skipping seeding.`)
      console.log("Existing roles:")
      existingRoles.forEach(role => {
        console.log(`  - ${role.name} (${role.type})`)
      })
      return
    }

    console.log("📦 Creating default roles...")

    // Crear roles por defecto
    const defaultRoles = [
      {
        name: "Super Administrador",
        type: "SUPER_ADMIN",
        description: "Administrador principal con acceso completo al sistema Longhorn. Puede gestionar todos los locales, usuarios y configuraciones.",
        permissions: [
          "manage_locations",
          "manage_users", 
          "manage_products",
          "manage_orders",
          "view_analytics",
          "manage_inventory",
          "manage_settings",
          "manage_roles"
        ],
        metadata: {
          is_active: true,
          created_by: "system",
          is_default: true
        }
      },
      {
        name: "Gerente de Local",
        type: "STORE_MANAGER", 
        description: "Gerente con acceso completo a su local asignado. Puede gestionar personal, productos locales y visualizar analíticas del local.",
        permissions: [
          "manage_local_products",
          "manage_local_orders", 
          "view_local_analytics",
          "manage_local_inventory",
          "manage_local_staff",
          "view_products"
        ],
        metadata: {
          is_active: true,
          created_by: "system",
          is_default: true
        }
      },
      {
        name: "Personal de Local",
        type: "STORE_STAFF",
        description: "Personal con acceso limitado a operaciones básicas del local. Puede ver productos, crear pedidos y actualizar inventario.",
        permissions: [
          "view_products",
          "create_orders", 
          "update_inventory",
          "view_local_orders"
        ],
        metadata: {
          is_active: true,
          created_by: "system",
          is_default: true
        }
      },
      {
        name: "Cajero",
        type: "STORE_STAFF",
        description: "Personal especializado en manejo de caja y atención al cliente. Puede procesar pedidos y manejar pagos.",
        permissions: [
          "view_products",
          "create_orders",
          "view_local_orders"
        ],
        metadata: {
          is_active: true,
          created_by: "system",
          is_default: false
        }
      },
      {
        name: "Cocinero",
        type: "STORE_STAFF",
        description: "Personal de cocina que puede ver pedidos y actualizar el estado de preparación de los platos.",
        permissions: [
          "view_products",
          "view_local_orders",
          "update_inventory"
        ],
        metadata: {
          is_active: true,
          created_by: "system",
          is_default: false
        }
      }
    ]

    let createdCount = 0
    
    for (const roleData of defaultRoles) {
      try {
        const role = await longhornService.createRole(roleData)
        console.log(`✅ Created role: ${roleData.name} (${roleData.type})`)
        createdCount++
      } catch (error) {
        console.error(`❌ Error creating role ${roleData.name}:`, error.message)
      }
    }

    console.log(`🎉 Seeding completed! Created ${createdCount} roles.`)

    // Mostrar resumen
    const allRoles = await longhornService.getAllRoles()
    console.log("\\n📋 Final roles summary:")
    allRoles.forEach(role => {
      const permissionCount = role.permissions ? role.permissions.length : 0
      const status = role.metadata?.is_active ? "🟢 Active" : "🔴 Inactive"
      console.log(`  ${status} ${role.name} (${role.type}) - ${permissionCount} permissions`)
    })

  } catch (error) {
    console.error("❌ Error during seeding:", error)
    throw error
  }
}

// Ejecutar seeding si se llama directamente
if (require.main === module) {
  seedRoles()
    .then(() => {
      console.log("\\n🏁 Seeding script completed successfully!")
      process.exit(0)
    })
    .catch((error) => {
      console.error("\\n💥 Seeding script failed:", error)
      process.exit(1)
    })
}

export default seedRoles