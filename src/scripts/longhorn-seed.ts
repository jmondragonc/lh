import LonghornRoleService from "../modules/longhorn/services/role"
import LonghornStoreService from "../modules/longhorn/services/store"

/**
 * Script de seeding para el sistema Longhorn
 * Crea roles y tiendas por defecto
 */
export default async function longhornSeed(container: any) {
  console.log("🍖 Iniciando seeding de Longhorn...")

  try {
    const longhornRoleService = container.resolve("longhornRoleService") as LonghornRoleService
    const longhornStoreService = container.resolve("longhornStoreService") as LonghornStoreService

    // 1. Seed de roles por defecto
    console.log("📝 Creando roles por defecto...")
    const rolesCreated = await longhornRoleService.seedDefaultRoles()
    console.log(`✅ ${rolesCreated} roles creados`)

    // 2. Seed de tiendas por defecto
    console.log("🏪 Creando tiendas por defecto...")
    const storesCreated = await longhornStoreService.seedDefaultStores()
    console.log(`✅ ${storesCreated.length} tiendas creadas`)

    // 3. Mostrar resumen
    const allRoles = await longhornRoleService.getActiveRoles()
    const allStores = await longhornStoreService.getActiveStores()

    console.log("\n📊 Resumen del seeding:")
    console.log(`Roles creados: ${allRoles.length}`)
    allRoles.forEach(role => {
      console.log(`  - ${role.name} (${role.type})`)
    })

    console.log(`\nTiendas creadas: ${allStores.length}`)
    allStores.forEach(store => {
      console.log(`  - ${store.name} (${store.code})`)
    })

    console.log("\n🎉 Seeding de Longhorn completado exitosamente!")

  } catch (error) {
    console.error("❌ Error durante el seeding de Longhorn:", error)
    throw error
  }
}
