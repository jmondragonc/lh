import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Badge, Table, Select, toast } from "@medusajs/ui"
import { Users, Plus, Building2, UserX, Settings, Shield } from "lucide-react"
import { useEffect, useState } from "react"

/**
 * Página personalizada para gestión de usuarios Longhorn
 * Implementa filtrado jerárquico automático
 * Parte del GRUPO B: UI Extensions Completas
 */
const LonghornUsersPage = () => {
  const [users, setUsers] = useState([])
  const [stores, setStores] = useState([])
  const [roles, setRoles] = useState([])
  const [selectedStore, setSelectedStore] = useState("ALL_STORES")
  const [selectedRole, setSelectedRole] = useState("ALL_ROLES")
  const [loading, setLoading] = useState(true)
  const [currentUserRole, setCurrentUserRole] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedStore !== "ALL_STORES" || selectedRole !== "ALL_ROLES") {
      fetchUsers()
    }
  }, [selectedStore, selectedRole])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('medusa_admin_token')
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const [usersRes, storesRes, rolesRes] = await Promise.all([
        fetch('/admin/longhorn/users', { headers }),
        fetch('/admin/longhorn/stores', { headers }),
        fetch('/admin/longhorn/roles', { headers })
      ])

      if (usersRes.ok && storesRes.ok && rolesRes.ok) {
        const [usersData, storesData, rolesData] = await Promise.all([
          usersRes.json(),
          storesRes.json(),
          rolesRes.json()
        ])

        setUsers(usersData.users || [])
        setStores(storesData.stores || [])
        setRoles(rolesData.roles || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('medusa_admin_token')
      const params = new URLSearchParams()
      if (selectedStore !== "ALL_STORES") params.append('store_id', selectedStore)
      if (selectedRole !== "ALL_ROLES") params.append('role_type', selectedRole)

      const response = await fetch(`/admin/longhorn/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching filtered users:', error)
    }
  }

  const getRoleBadgeColor = (roleType: string) => {
    switch (roleType) {
      case 'super_admin':
        return 'bg-red-100 text-red-800'
      case 'store_manager':
        return 'bg-blue-100 text-blue-800'
      case 'store_staff':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleDisplayName = (roleType: string) => {
    switch (roleType) {
      case 'super_admin':
        return 'Super Administrador'
      case 'store_manager':
        return 'Gerente Local'
      case 'store_staff':
        return 'Personal Local'
      default:
        return roleType
    }
  }

  const getStoreDisplayName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId)
    return store ? store.name : storeId
  }

  if (loading) {
    return (
      <Container className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-orange-600" />
          <Heading level="h1" className="text-orange-800">
            Gestión de Usuarios Longhorn
          </Heading>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            // TODO: Implementar modal de creación de usuario
            toast.info('Función próximamente disponible')
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Filtrar por Local</label>
          <Select
            value={selectedStore}
            onValueChange={setSelectedStore}
          >
            <Select.Trigger>
              <Select.Value placeholder="Todos los locales" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="ALL_STORES">Todos los locales</Select.Item>
              {stores.map((store) => (
                <Select.Item key={store.id} value={store.id}>
                  {store.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Filtrar por Rol</label>
          <Select
            value={selectedRole}
            onValueChange={setSelectedRole}
          >
            <Select.Trigger>
              <Select.Value placeholder="Todos los roles" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="ALL_ROLES">Todos los roles</Select.Item>
              <Select.Item value="super_admin">Super Administrador</Select.Item>
              <Select.Item value="store_manager">Gerente Local</Select.Item>
              <Select.Item value="store_staff">Personal Local</Select.Item>
            </Select.Content>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            variant="secondary"
            onClick={() => {
              setSelectedStore("ALL_STORES")
              setSelectedRole("ALL_ROLES")
              fetchData()
            }}
          >
            Limpiar Filtros
          </Button>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Usuario</Table.HeaderCell>
              <Table.HeaderCell>Email</Table.HeaderCell>
              <Table.HeaderCell>Roles</Table.HeaderCell>
              <Table.HeaderCell>Locales</Table.HeaderCell>
              <Table.HeaderCell>Estado</Table.HeaderCell>
              <Table.HeaderCell>Acciones</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {users.length > 0 ? users.map((user) => (
              <Table.Row key={user.id}>
                <Table.Cell>
                  <div>
                    <div className="font-medium">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {user.id}
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell>{user.email}</Table.Cell>
                <Table.Cell>
                  <div className="flex flex-wrap gap-1">
                    {user.longhorn_roles?.map((userRole, index) => (
                      <Badge
                        key={index}
                        className={`text-xs ${getRoleBadgeColor(userRole.role?.type)}`}
                      >
                        {getRoleDisplayName(userRole.role?.type)}
                      </Badge>
                    )) || (
                      <Badge variant="secondary" className="text-xs">
                        Sin rol asignado
                      </Badge>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex flex-wrap gap-1">
                    {user.longhorn_stores?.map((userStore, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {getStoreDisplayName(userStore.store_id)}
                      </Badge>
                    )) || (
                      <span className="text-xs text-gray-500">Ningún local</span>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Badge 
                    variant={user.deleted_at ? "danger" : "success"}
                    className="text-xs"
                  >
                    {user.deleted_at ? 'Inactivo' : 'Activo'}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => {
                        // TODO: Implementar modal de edición
                        toast.info('Función próximamente disponible')
                      }}
                    >
                      <Settings className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => {
                        // TODO: Implementar eliminación con confirmación
                        toast.info('Función próximamente disponible')
                      }}
                    >
                      <UserX className="w-3 h-3" />
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            )) : (
              <Table.Row>
                <Table.Cell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="w-8 h-8 text-gray-400" />
                    <div className="text-gray-500">
                      {(selectedStore !== "ALL_STORES" || selectedRole !== "ALL_ROLES") 
                        ? 'No hay usuarios que coincidan con los filtros'
                        : 'No hay usuarios registrados'
                      }
                    </div>
                  </div>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>

      {/* Footer Info */}
      <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
        <div className="flex items-start gap-2">
          <Shield className="w-5 h-5 text-orange-600 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-orange-800 mb-1">
              Sistema de Filtrado Jerárquico Activo
            </div>
            <div className="text-orange-700">
              • <strong>Super Administradores</strong> ven todos los usuarios<br />
              • <strong>Gerentes Locales</strong> solo ven personal de su local<br />
              • <strong>Personal Local</strong> solo se ve a sí mismo<br />
              • Los usuarios <strong>nunca ven</strong> Super Administradores (excepto otros Super Admins)
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

// Configuración de la ruta
export const config = defineRouteConfig({
  label: "Usuarios Longhorn",
  icon: Shield,
})

export default LonghornUsersPage