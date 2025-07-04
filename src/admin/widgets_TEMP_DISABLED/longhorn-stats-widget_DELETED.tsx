import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge } from "@medusajs/ui"
import { Users, Building2, UserCheck } from "lucide-react"
import { useEffect, useState } from "react"

/**
 * Widget para Dashboard principal mostrando estadísticas de usuarios por tienda
 * Parte del GRUPO B: UI Extensions Completas
 */
const LonghornUsersStatsWidget = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    usersByRole: {
      superAdmin: 0,
      storeManager: 0,
      storeStaff: 0
    },
    loading: true
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Obtener estadísticas de usuarios de Longhorn
      const [usersResponse, storesResponse] = await Promise.all([
        fetch('/admin/longhorn/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('medusa_admin_token')}`
          }
        }),
        fetch('/admin/longhorn/stores', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('medusa_admin_token')}`
          }
        })
      ])

      if (usersResponse.ok && storesResponse.ok) {
        const usersData = await usersResponse.json()
        const storesData = await storesResponse.json()

        // Calcular estadísticas por rol
        const usersByRole = {
          superAdmin: 0,
          storeManager: 0,
          storeStaff: 0
        }

        usersData.users?.forEach((user: any) => {
          user.longhorn_roles?.forEach((role: any) => {
            if (role.role?.type === 'super_admin') {
              usersByRole.superAdmin++
            } else if (role.role?.type === 'store_manager') {
              usersByRole.storeManager++
            } else if (role.role?.type === 'store_staff') {
              usersByRole.storeStaff++
            }
          })
        })

        setStats({
          totalUsers: usersData.users?.length || 0,
          totalStores: storesData.stores?.length || 0,
          usersByRole,
          loading: false
        })
      } else {
        setStats(prev => ({ ...prev, loading: false }))
      }
    } catch (error) {
      console.error('Error fetching Longhorn stats:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  if (stats.loading) {
    return (
      <Container className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container className="p-4 border-l-4 border-l-orange-500">
      <div className="flex items-center gap-2 mb-3">
        <Building2 className="w-5 h-5 text-orange-600" />
        <Heading level="h3" className="text-orange-800">
          Sistema Longhorn
        </Heading>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Usuarios */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-blue-600" />
            <Text className="font-medium text-blue-800">Usuarios</Text>
          </div>
          <Text className="text-2xl font-bold text-blue-900">
            {stats.totalUsers}
          </Text>
          <Text className="text-xs text-blue-600">Total activos</Text>
        </div>

        {/* Total Tiendas */}
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-green-600" />
            <Text className="font-medium text-green-800">Locales</Text>
          </div>
          <Text className="text-2xl font-bold text-green-900">
            {stats.totalStores}
          </Text>
          <Text className="text-xs text-green-600">Restaurantes</Text>
        </div>

        {/* Roles */}
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-4 h-4 text-purple-600" />
            <Text className="font-medium text-purple-800">Roles</Text>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Super Admin:</span>
              <Badge variant="secondary" size="small">
                {stats.usersByRole.superAdmin}
              </Badge>
            </div>
            <div className="flex justify-between text-xs">
              <span>Gerentes:</span>
              <Badge variant="secondary" size="small">
                {stats.usersByRole.storeManager}
              </Badge>
            </div>
            <div className="flex justify-between text-xs">
              <span>Personal:</span>
              <Badge variant="secondary" size="small">
                {stats.usersByRole.storeStaff}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <Text className="text-xs text-gray-500">
          Sistema multi-sede • Filtrado jerárquico activo
        </Text>
      </div>
    </Container>
  )
}

// Configuración del widget
export const config = defineWidgetConfig({
  zone: "order.details.before", // Aparecer en el dashboard principal
})

export default LonghornUsersStatsWidget