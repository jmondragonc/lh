import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Users } from "@medusajs/icons"
import { useState, useEffect } from "react"

const UsuariosMainPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRoles: 0,
    activeUsers: 0,
    recentUsers: [] as any[]
  })
  const [loading, setLoading] = useState(true)
  const [isNonSuperAdmin, setIsNonSuperAdmin] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    try {
      // Obtener usuario actual desde la API de MedusaJS
      const response = await fetch('/admin/users/me')
      if (response.ok) {
        const userData = await response.json()
        setCurrentUserId(userData.user?.id)
        // Cargar stats (el backend aplicará el filtrado automáticamente)
        await fetchStats(userData.user?.id)
      } else {
        console.error('Error obteniendo usuario actual')
      }
    } catch (error) {
      console.error('Error en getCurrentUser:', error)
    } finally {
      setLoading(false)
    }
  }


  const fetchStats = async (userId: string) => {
    try {
      // Si hay simulación en URL, usarla; sino usar el usuario real
      const simulateUser = new URLSearchParams(window.location.search).get('simulate_user')
      const finalUserId = simulateUser || userId
      
      // Fetch users from Longhorn API - solo añadir simulate_user si existe
      const usersUrl = simulateUser ? `/admin/longhorn/users?simulate_user=${simulateUser}` : '/admin/longhorn/users'
      const usersResponse = await fetch(usersUrl)
      const usersData = await usersResponse.json()
      const users = usersData.users || []

      // Fetch roles from Longhorn API - solo añadir simulate_user si existe  
      const rolesUrl = simulateUser ? `/admin/longhorn/roles?simulate_user=${simulateUser}` : '/admin/longhorn/roles'
      const rolesResponse = await fetch(rolesUrl)
      const rolesData = await rolesResponse.json()
      const roles = rolesData.roles || []

      // El backend ya aplica el filtrado jerárquico, usar datos directamente
      const recentUsers = users
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

      // Calculate stats usando datos ya filtrados del backend
      setStats({
        totalUsers: users.length,
        totalRoles: roles.length,
        activeUsers: users.filter(u => u.is_active !== false).length,
        recentUsers: recentUsers
      })
      
      // Actualizar estado de filtrado basado en la respuesta del backend
      setIsNonSuperAdmin(usersData.filtered || false)
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-ui-fg-base text-2xl font-bold mb-6">Gestión de Usuarios</h1>
        <div className="text-ui-fg-muted">Cargando estadísticas...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-ui-fg-base text-2xl font-bold">Gestión de Usuarios</h1>
        <p className="text-ui-fg-muted mt-2">
          Administra usuarios, roles y permisos del sistema Longhorn
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-ui-bg-base rounded-md border border-ui-border-base shadow-card-rest p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ui-fg-muted text-sm">Total Usuarios</p>
              <p className="text-ui-fg-base text-2xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-ui-bg-highlight rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-ui-fg-base" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-ui-bg-base rounded-md border border-ui-border-base shadow-card-rest p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ui-fg-muted text-sm">Usuarios Activos</p>
              <p className="text-ui-fg-base text-2xl font-bold">{stats.activeUsers}</p>
            </div>
            <div className="w-12 h-12 bg-ui-bg-highlight rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-ui-fg-base" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-ui-bg-base rounded-md border border-ui-border-base shadow-card-rest p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ui-fg-muted text-sm">Total Roles</p>
              <p className="text-ui-fg-base text-2xl font-bold">{stats.totalRoles}</p>
            </div>
            <div className="w-12 h-12 bg-ui-bg-highlight rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-ui-fg-base" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Quick Actions Card */}
        <div className="bg-ui-bg-base rounded-md border border-ui-border-base shadow-card-rest p-6">
          <h3 className="text-ui-fg-base text-lg font-medium mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <a 
              href="/admin/users/management"
              className="flex items-center justify-between p-3 border border-ui-border-base rounded-md hover:bg-ui-bg-subtle transition-colors"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-ui-fg-base" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <div>
                  <p className="text-ui-fg-base font-medium">Gestionar Usuarios</p>
                  <p className="text-ui-fg-muted text-sm">Crear, editar y eliminar usuarios</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-ui-fg-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>

            <a 
              href="/admin/users/roles"
              className="flex items-center justify-between p-3 border border-ui-border-base rounded-md hover:bg-ui-bg-subtle transition-colors"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-ui-fg-base" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <p className="text-ui-fg-base font-medium">Gestionar Roles</p>
                  <p className="text-ui-fg-muted text-sm">Configurar roles y permisos</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-ui-fg-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        {/* Recent Users Card */}
        <div className="bg-ui-bg-base rounded-md border border-ui-border-base shadow-card-rest p-6">
          <h3 className="text-ui-fg-base text-lg font-medium mb-4">Usuarios Recientes</h3>
          {stats.recentUsers.length === 0 ? (
            <p className="text-ui-fg-muted text-sm">No hay usuarios registrados aún.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentUsers.map((user: any) => (
                <div key={user.id} className="flex items-center space-x-3">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={`${user.first_name} ${user.last_name}`}
                      className="w-8 h-8 rounded-full object-cover border border-ui-border-base"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-ui-bg-highlight rounded-full flex items-center justify-center">
                      <span className="text-ui-fg-base text-sm font-medium">
                        {user.first_name?.[0] || user.email[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-ui-fg-base text-sm font-medium truncate">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-ui-fg-muted text-xs truncate">{user.email}</p>
                  </div>
                  <span className="text-ui-fg-subtle text-xs">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Overview */}
      <div className="bg-ui-bg-base rounded-md border border-ui-border-base shadow-card-rest p-6">
        <h3 className="text-ui-fg-base text-lg font-medium mb-4">Sistema de Roles Longhorn</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Super Administrador - Ocultar para usuarios no-Super Admin */}
          <div className={`p-4 bg-ui-bg-subtle rounded-md ${isNonSuperAdmin ? 'hidden' : ''}`}>
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <h4 className="text-ui-fg-base font-medium">Super Administrador</h4>
            </div>
            <p className="text-ui-fg-muted text-sm">Control total del sistema. Puede gestionar todas las sucursales, usuarios y configuraciones.</p>
          </div>

          <div className="p-4 bg-ui-bg-subtle rounded-md">
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              <h4 className="text-ui-fg-base font-medium">Gerente Local</h4>
            </div>
            <p className="text-ui-fg-muted text-sm">Gestión completa de una sucursal específica. Puede administrar productos, pedidos y personal local.</p>
          </div>

          <div className="p-4 bg-ui-bg-subtle rounded-md">
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <h4 className="text-ui-fg-base font-medium">Personal Local</h4>
            </div>
            <p className="text-ui-fg-muted text-sm">Operaciones básicas en su sucursal asignada. Puede ver productos y gestionar pedidos.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ✅ Configuration - usando componente importado para MedusaJS 2.8.6
export const config = defineRouteConfig({
  label: "Usuarios",
  icon: Users,
})

export default UsuariosMainPage
