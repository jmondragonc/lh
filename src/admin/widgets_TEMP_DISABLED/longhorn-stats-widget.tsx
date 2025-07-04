import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useState, useEffect } from "react"

interface LonghornStats {
  totalUsers: number
  totalRoles: number
  totalStores: number
  activeUsers: number
  recentActivity: any[]
}

// Widget para mostrar estadísticas del sistema Longhorn
const LonghornStatsWidget = () => {
  const [stats, setStats] = useState<LonghornStats>({
    totalUsers: 0,
    totalRoles: 0,
    totalStores: 0,
    activeUsers: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch parallel requests to Longhorn APIs
      const [usersResponse, rolesResponse, storesResponse] = await Promise.all([
        fetch("/admin/longhorn/users"),
        fetch("/admin/longhorn/roles"),
        fetch("/admin/longhorn/stores")
      ])

      const [usersData, rolesData, storesData] = await Promise.all([
        usersResponse.json(),
        rolesResponse.json(),
        storesResponse.json()
      ])

      const users = usersData.users || []
      const roles = rolesData.roles || []
      const stores = storesData.stores || []

      setStats({
        totalUsers: users.length,
        totalRoles: roles.length,
        totalStores: stores.length,
        activeUsers: users.filter((u: any) => u.is_active !== false).length,
        recentActivity: users
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3)
      })
    } catch (error) {
      console.error("Error fetching Longhorn stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-ui-bg-base rounded-lg border border-ui-border-base shadow-card-rest p-6">
        <h3 className="text-ui-fg-base text-lg font-medium mb-4">Sistema Longhorn</h3>
        <div className="text-ui-fg-muted">Cargando estadísticas...</div>
      </div>
    )
  }

  return (
    <div className="bg-ui-bg-base rounded-lg border border-ui-border-base shadow-card-rest p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-ui-fg-base text-lg font-medium">Sistema Longhorn</h3>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-ui-fg-subtle text-sm">Activo</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-ui-bg-subtle rounded-md">
          <div className="text-2xl font-bold text-ui-fg-base">{stats.totalUsers}</div>
          <div className="text-xs text-ui-fg-muted">Usuarios</div>
        </div>
        
        <div className="text-center p-3 bg-ui-bg-subtle rounded-md">
          <div className="text-2xl font-bold text-ui-fg-base">{stats.activeUsers}</div>
          <div className="text-xs text-ui-fg-muted">Activos</div>
        </div>
        
        <div className="text-center p-3 bg-ui-bg-subtle rounded-md">
          <div className="text-2xl font-bold text-ui-fg-base">{stats.totalRoles}</div>
          <div className="text-xs text-ui-fg-muted">Roles</div>
        </div>
        
        <div className="text-center p-3 bg-ui-bg-subtle rounded-md">
          <div className="text-2xl font-bold text-ui-fg-base">{stats.totalStores}</div>
          <div className="text-xs text-ui-fg-muted">Sucursales</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h4 className="text-ui-fg-base font-medium mb-3">Actividad Reciente</h4>
        {stats.recentActivity.length === 0 ? (
          <p className="text-ui-fg-muted text-sm">No hay actividad reciente.</p>
        ) : (
          <div className="space-y-2">
            {stats.recentActivity.map((user: any) => (
              <div key={user.id} className="flex items-center space-x-3 p-2 bg-ui-bg-subtle rounded-md">
                <div className="w-8 h-8 bg-ui-bg-highlight rounded-full flex items-center justify-center">
                  <span className="text-ui-fg-base text-xs font-medium">
                    {user.first_name?.[0] || user.email[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-ui-fg-base text-sm font-medium truncate">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-ui-fg-muted text-xs truncate">
                    Creado: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-ui-border-base">
        <div className="flex gap-2">
          <a
            href="/app/users"
            className="flex-1 px-3 py-2 bg-ui-button-neutral text-ui-fg-on-color text-center text-sm rounded-md hover:bg-ui-button-neutral-hover transition-colors"
          >
            Gestionar Usuarios
          </a>
          <a
            href="/app/users/roles"
            className="flex-1 px-3 py-2 bg-ui-button-transparent text-ui-fg-base text-center text-sm rounded-md hover:bg-ui-button-transparent-hover transition-colors border border-ui-border-base"
          >
            Gestionar Roles
          </a>
        </div>
      </div>
    </div>
  )
}

// Configuration to inject this widget into the dashboard
export const config = defineWidgetConfig({
  zone: "product.list.before", // Shows in products page to provide quick access to Longhorn
})

export default LonghornStatsWidget
