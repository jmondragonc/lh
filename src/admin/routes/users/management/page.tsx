import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useState, useEffect } from "react"

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar_url?: string
  created_at: string
}

interface Role {
  id: string
  name: string
  type: string
  permissions?: string[]
}

interface Notification {
  message: string
  type: 'success' | 'error'
}

interface RoleAssignmentData {
  user: User
  role: Role
}

const UsersManagement = () => {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [userRoles, setUserRoles] = useState<Record<string, Role[]>>({})
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showRoleAssignment, setShowRoleAssignment] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    avatar_url: "",
  })
  const [notification, setNotification] = useState<Notification | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [roleAssignmentData, setRoleAssignmentData] = useState<RoleAssignmentData | null>(null)
  const [showRemoveRoleModal, setShowRemoveRoleModal] = useState(false)
  const [roleRemovalData, setRoleRemovalData] = useState<RoleAssignmentData | null>(null)
  const [showDuplicateRoleModal, setShowDuplicateRoleModal] = useState(false)
  const [duplicateRoleInfo, setDuplicateRoleInfo] = useState<RoleAssignmentData | null>(null)
  const [isFiltered, setIsFiltered] = useState(false)

  // Show notification for 3 seconds
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, rolesData] = await Promise.all([fetchUsers(), fetchRoles()])
        if (usersData && usersData.length > 0) {
          await fetchAllUserRoles(usersData)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const fetchUsers = async (): Promise<User[]> => {
    try {
      const response = await fetch("/admin/longhorn/users")
      const data = await response.json()
      const usersData = (data.users as User[]) || []
      setUsers(usersData)
      setIsFiltered(data.filtered || false)
      return usersData
    } catch (error) {
      console.error("Error fetching users:", error)
      return []
    }
  }

  const fetchRoles = async (): Promise<Role[]> => {
    try {
      const response = await fetch("/admin/longhorn/roles")
      const data = await response.json()
      const rolesData = (data.roles as Role[]) || []
      setRoles(rolesData)
      return rolesData
    } catch (error) {
      console.error("Error fetching roles:", error)
      return []
    }
  }

  const fetchAllUserRoles = async (usersToFetch?: User[]) => {
    try {
      const usersData = usersToFetch || users
      const userRolesMap: Record<string, Role[]> = {}
      
      for (const user of usersData) {
        const response = await fetch(`/admin/longhorn/users/${user.id}/roles`)
        if (response.ok) {
          const data = await response.json()
          
          // Procesar los roles de la respuesta
          const processedRoles = (data.roles || []).map((roleData: any) => {
            // Si el roleData tiene la estructura { role: { ... } }
            if (roleData.role) {
              return {
                id: roleData.role.id,
                name: roleData.role.name,
                type: roleData.role.type,
                permissions: roleData.role.permissions || []
              }
            }
            // Si el roleData es directamente el rol
            else {
              return {
                id: roleData.id,
                name: roleData.name,
                type: roleData.type,
                permissions: roleData.permissions || []
              }
            }
          })
          
          userRolesMap[user.id] = processedRoles
        }
      }
      setUserRoles(userRolesMap)
    } catch (error) {
      console.error("Error fetching user roles:", error)
    }
  }

  const getUserRoles = (userId: string): Role[] => {
    return userRoles[userId] || []
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingUser ? `/admin/longhorn/users/${editingUser.id}` : "/admin/longhorn/users"
      const method = editingUser ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchUsers()
        resetForm()
        showNotification(editingUser ? "Usuario actualizado exitosamente" : "Usuario creado exitosamente", "success")
      } else {
        const errorData = await response.json()
        showNotification(errorData.message || "Error al guardar usuario", "error")
      }
    } catch (error) {
      console.error("Error saving user:", error)
      showNotification("Error al guardar el usuario", "error")
    }
  }

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!userToDelete) return

    try {
      const response = await fetch(`/admin/longhorn/users/${userToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchUsers()
        showNotification("Usuario eliminado exitosamente", "success")
      } else {
        showNotification("Error al eliminar el usuario", "error")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      showNotification("Error al eliminar el usuario", "error")
    } finally {
      setShowDeleteModal(false)
      setUserToDelete(null)
    }
  }

  const resetForm = () => {
    setFormData({
      email: "",
      first_name: "",
      last_name: "",
      avatar_url: "",
    })
    setEditingUser(null)
    setShowCreateForm(false)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      avatar_url: user.avatar_url || "",
    })
    setShowCreateForm(true)
  }

  const handleRoleAssignmentClick = (user: User, role: Role) => {
    setRoleAssignmentData({ user, role })
    setShowRoleModal(true)
  }

  const assignRole = async () => {
    if (!roleAssignmentData) return

    try {
      const response = await fetch(`/admin/longhorn/users/${roleAssignmentData.user.id}/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role_id: roleAssignmentData.role.id }),
      })

      if (response.ok) {
        showNotification("Rol asignado exitosamente", "success")
        setShowRoleAssignment(null)
        await fetchAllUserRoles() // Refresh user roles
      } else {
        const errorData = await response.json()
        
        // Verificar si es un error de rol duplicado
        if (response.status === 400 && 
            (errorData.message?.includes("already has this role") || 
             errorData.error === "ROLE_ALREADY_EXISTS")) {
          // Mostrar modal específico para rol duplicado
          setDuplicateRoleInfo(roleAssignmentData)
          setShowDuplicateRoleModal(true)
        } else {
          showNotification(errorData.message || "Error al asignar rol", "error")
        }
      }
    } catch (error) {
      console.error("Error assigning role:", error)
      showNotification("Error al asignar rol", "error")
    } finally {
      setShowRoleModal(false)
      setRoleAssignmentData(null)
    }
  }

  const handleRemoveRoleClick = (user: User, role: Role) => {
    setRoleRemovalData({ user, role })
    setShowRemoveRoleModal(true)
  }

  const removeRole = async () => {
    if (!roleRemovalData) return

    try {
      const response = await fetch(`/admin/longhorn/users/${roleRemovalData.user.id}/roles`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          role_id: roleRemovalData.role.id 
        }),
      })

      if (response.ok) {
        showNotification("Rol removido exitosamente", "success")
        await fetchAllUserRoles() // Refresh user roles
      } else {
        const errorData = await response.json()
        showNotification(errorData.message || "Error al remover rol", "error")
      }
    } catch (error) {
      console.error("Error removing role:", error)
      showNotification("Error al remover rol", "error")
    } finally {
      setShowRemoveRoleModal(false)
      setRoleRemovalData(null)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-ui-fg-base text-2xl font-bold mb-6">Gestión de Usuarios</h1>
        <div className="text-ui-fg-muted">Cargando usuarios...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-ui-fg-base text-2xl font-bold">Gestión de Usuarios</h1>
          {isFiltered && (
            <p className="text-ui-fg-muted text-sm mt-1">
              ℹ️ Vista filtrada - No se muestran usuarios con roles de Super Administrador
            </p>
          )}
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-ui-button-neutral text-ui-fg-on-color rounded-md hover:bg-ui-button-neutral-hover transition-colors text-sm font-medium"
        >
          {showCreateForm ? "Cancelar" : "Crear Usuario"}
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="mb-8 p-6 border border-ui-border-base rounded-md bg-ui-bg-base shadow-card-rest">
          <h2 className="text-ui-fg-base text-lg font-medium mb-4">
            {editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-ui-fg-base text-sm font-medium mb-1">
                  Email <span className="text-ui-fg-error">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-2 border border-ui-border-base rounded-md bg-ui-bg-base text-ui-fg-base"
                  required
                  disabled={!!editingUser} // No permitir editar email
                />
              </div>

              <div>
                <label className="block text-ui-fg-base text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  className="w-full p-2 border border-ui-border-base rounded-md bg-ui-bg-base text-ui-fg-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-ui-fg-base text-sm font-medium mb-1">Apellido</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  className="w-full p-2 border border-ui-border-base rounded-md bg-ui-bg-base text-ui-fg-base"
                />
              </div>

              <div>
                <label className="block text-ui-fg-base text-sm font-medium mb-1">Avatar URL</label>
                <input
                  type="url"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                  className="w-full p-2 border border-ui-border-base rounded-md bg-ui-bg-base text-ui-fg-base"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-ui-button-neutral text-ui-fg-on-color rounded-md hover:bg-ui-button-neutral-hover transition-colors text-sm font-medium"
              >
                {editingUser ? "Actualizar" : "Crear"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-ui-button-transparent text-ui-fg-base rounded-md hover:bg-ui-button-transparent-hover transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="bg-ui-bg-base rounded-md border border-ui-border-base shadow-card-rest">
        <div className="p-4 border-b border-ui-border-base">
          <h2 className="text-ui-fg-base text-lg font-medium">Usuarios del Sistema</h2>
        </div>
        
        {users.length === 0 ? (
          <div className="p-6 text-center text-ui-fg-muted">
            No hay usuarios en el sistema. Crea el primer usuario.
          </div>
        ) : (
          <div className="divide-y divide-ui-border-base">
            {users.map((user) => (
              <div key={user.id} className="p-4 hover:bg-ui-bg-subtle transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {user.avatar_url && (
                      <img
                        src={user.avatar_url}
                        alt={`${user.first_name} ${user.last_name}`}
                        className="w-10 h-10 rounded-full object-cover border border-ui-border-base"
                      />
                    )}
                    <div>
                      <h3 className="text-ui-fg-base font-medium">
                        {user.first_name} {user.last_name}
                      </h3>
                      <p className="text-ui-fg-muted text-sm">{user.email}</p>
                      <p className="text-ui-fg-subtle text-xs">
                        Creado: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                      
                      {/* Current Roles */}
                      <div className="mt-2">
                        <span className="text-ui-fg-subtle text-xs">Roles: </span>
                        {getUserRoles(user.id).length > 0 ? (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {getUserRoles(user.id).map((role) => (
                              <div
                                key={role.id}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-ui-tag-blue-bg text-ui-tag-blue-text rounded border"
                              >
                                <span>{role.name}</span>
                                <button
                                  onClick={() => handleRemoveRoleClick(user, role)}
                                  className="text-ui-tag-blue-text hover:text-ui-fg-error transition-colors ml-1"
                                  title="Remover rol"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-ui-fg-muted text-xs italic">Sin roles asignados</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowRoleAssignment(user.id)}
                      className="px-3 py-1 bg-ui-button-neutral text-ui-fg-on-color text-sm rounded-md hover:bg-ui-button-neutral-hover transition-colors"
                    >
                      Asignar Rol
                    </button>
                    <button
                      onClick={() => handleEdit(user)}
                      className="px-3 py-1 bg-ui-button-neutral text-ui-fg-on-color text-sm rounded-md hover:bg-ui-button-neutral-hover transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClick(user)}
                      className="px-3 py-1 bg-ui-button-danger text-ui-fg-on-color text-sm rounded-md hover:bg-ui-button-danger-hover transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                {/* Role Assignment Dropdown */}
                {showRoleAssignment === user.id && (
                  <div className="mt-4 p-3 bg-ui-bg-highlight rounded-md border border-ui-border-base">
                    <h4 className="text-ui-fg-base font-medium mb-2">Asignar Nuevo Rol a {user.first_name}</h4>
                    <div className="flex gap-2 flex-wrap">
                      {roles
                        .filter(role => !getUserRoles(user.id).some(userRole => userRole.id === role.id))
                        .map((role) => (
                          <button
                            key={role.id}
                            onClick={() => handleRoleAssignmentClick(user, role)}
                            className="px-3 py-1 bg-ui-tag-green-bg text-ui-tag-green-text text-sm rounded-md hover:bg-ui-tag-green-bg-hover transition-colors"
                          >
                            + {role.name}
                          </button>
                        ))}
                      {roles.filter(role => !getUserRoles(user.id).some(userRole => userRole.id === role.id)).length === 0 && (
                        <span className="text-ui-fg-muted text-sm italic">Este usuario ya tiene todos los roles disponibles</span>
                      )}
                      <button
                        onClick={() => setShowRoleAssignment(null)}
                        className="px-3 py-1 bg-ui-button-transparent text-ui-fg-base text-sm rounded-md hover:bg-ui-button-transparent-hover transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-ui-bg-base rounded-lg border border-ui-border-base shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-ui-fg-base mb-4">
                Confirmar eliminación
              </h3>
              <p className="text-ui-fg-muted mb-6">
                ¿Estás seguro de que quieres eliminar al usuario <strong>"{userToDelete?.first_name} {userToDelete?.last_name}"</strong>?
                <br />
                <span className="text-sm text-ui-fg-danger mt-2 block">
                  Esta acción no se puede deshacer.
                </span>
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setUserToDelete(null)
                  }}
                  className="px-4 py-2 bg-ui-button-transparent text-ui-fg-base rounded-md hover:bg-ui-button-transparent-hover transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-ui-button-danger text-ui-fg-on-color rounded-md hover:bg-ui-button-danger-hover transition-colors text-sm font-medium"
                >
                  Eliminar usuario
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Assignment Confirmation Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-ui-bg-base rounded-lg border border-ui-border-base shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-ui-fg-base mb-4">
                Confirmar asignación de rol
              </h3>
              <p className="text-ui-fg-muted mb-6">
                ¿Estás seguro de que quieres asignar el rol <strong>"{roleAssignmentData?.role?.name}"</strong> al usuario <strong>"{roleAssignmentData?.user?.first_name} {roleAssignmentData?.user?.last_name}"</strong>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRoleModal(false)
                    setRoleAssignmentData(null)
                  }}
                  className="px-4 py-2 bg-ui-button-transparent text-ui-fg-base rounded-md hover:bg-ui-button-transparent-hover transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={assignRole}
                  className="px-4 py-2 bg-ui-button-neutral text-ui-fg-on-color rounded-md hover:bg-ui-button-neutral-hover transition-colors text-sm font-medium"
                >
                  Asignar rol
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Role Confirmation Modal */}
      {showRemoveRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-ui-bg-base rounded-lg border border-ui-border-base shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-ui-fg-base mb-4">
                Confirmar remoción de rol
              </h3>
              <p className="text-ui-fg-muted mb-6">
                ¿Estás seguro de que quieres remover el rol <strong>"{roleRemovalData?.role?.name}"</strong> del usuario <strong>"{roleRemovalData?.user?.first_name} {roleRemovalData?.user?.last_name}"</strong>?
                <br />
                <span className="text-sm text-ui-fg-subtle mt-2 block">
                  El usuario quedará sin este rol y perderá los permisos asociados.
                </span>
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRemoveRoleModal(false)
                    setRoleRemovalData(null)
                  }}
                  className="px-4 py-2 bg-ui-button-transparent text-ui-fg-base rounded-md hover:bg-ui-button-transparent-hover transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={removeRole}
                  className="px-4 py-2 bg-ui-button-danger text-ui-fg-on-color rounded-md hover:bg-ui-button-danger-hover transition-colors text-sm font-medium"
                >
                  Remover rol
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Role Modal */}
      {showDuplicateRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-ui-bg-base rounded-lg border border-ui-border-base shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-ui-fg-base mb-4">
                🚨 Rol ya asignado
              </h3>
              <p className="text-ui-fg-muted mb-6">
                El usuario <strong>"{duplicateRoleInfo?.user?.first_name} {duplicateRoleInfo?.user?.last_name}"</strong> ya tiene el rol <strong>"{duplicateRoleInfo?.role?.name}"</strong> asignado.
                <br /><br />
                <span className="text-sm text-ui-fg-subtle">
                  No es necesario asignar el mismo rol dos veces.
                </span>
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDuplicateRoleModal(false)
                    setDuplicateRoleInfo(null)
                    setShowRoleAssignment(null) // Cerrar también el dropdown de asignación
                  }}
                  className="px-4 py-2 bg-ui-button-neutral text-ui-fg-on-color rounded-md hover:bg-ui-button-neutral-hover transition-colors text-sm font-medium"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Configuration for the route - como submenú
export const config = defineRouteConfig({
  label: "Gestión de Usuarios",
})

export default UsersManagement
