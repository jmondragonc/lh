import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Users } from "@medusajs/icons"  
import { useState, useEffect } from "react"

interface Role {
  id: string
  name: string
  description?: string
  type: string
  permissions: string[]
  is_active: boolean
}

interface Notification {
  message: string
  type: 'success' | 'error'
}

const UserRolesManagement = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "local_staff",
    permissions: [] as string[],
    is_active: true
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)
  const [notification, setNotification] = useState<Notification | null>(null)
  const [isFiltered, setIsFiltered] = useState(false)

  // Show notification for 3 seconds
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const getAllRoleTypes = () => [
    { value: "super_admin", label: "Super Administrador", color: "bg-purple-100 text-purple-800" },
    { value: "local_manager", label: "Gerente Local", color: "bg-blue-100 text-blue-800" },
    { value: "local_staff", label: "Personal Local", color: "bg-green-100 text-green-800" }
  ]

  const getFilteredRoleTypes = () => {
    const allTypes = getAllRoleTypes()
    // Si está filtrado (no es super admin), remover la opción de super admin
    return isFiltered ? allTypes.filter(type => type.value !== "super_admin") : allTypes
  }

  const availablePermissions = [
    { key: "manage_locations", label: "Gestionar Ubicaciones", category: "Administración" },
    { key: "manage_users", label: "Gestionar Usuarios", category: "Administración" },
    { key: "manage_products", label: "Gestionar Productos", category: "Productos" },
    { key: "manage_orders", label: "Gestionar Pedidos", category: "Pedidos" },
    { key: "view_analytics", label: "Ver Analíticas", category: "Reportes" },
    { key: "manage_inventory", label: "Gestionar Inventario", category: "Inventario" },
    { key: "manage_settings", label: "Gestionar Configuraciones", category: "Configuración" },
    { key: "manage_roles", label: "Gestionar Roles", category: "Administración" },
    { key: "manage_local_products", label: "Gestionar Productos Locales", category: "Local" },
    { key: "manage_local_orders", label: "Gestionar Pedidos Locales", category: "Local" },
    { key: "view_local_analytics", label: "Ver Analíticas Locales", category: "Local" },
    { key: "manage_local_inventory", label: "Gestionar Inventario Local", category: "Local" },
    { key: "manage_local_staff", label: "Gestionar Personal Local", category: "Local" },
    { key: "view_products", label: "Ver Productos", category: "Básico" },
    { key: "create_orders", label: "Crear Pedidos", category: "Básico" },
    { key: "update_inventory", label: "Actualizar Inventario", category: "Básico" },
    { key: "view_local_orders", label: "Ver Pedidos Locales", category: "Básico" }
  ]

  // Group permissions by category
  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = []
    }
    acc[permission.category].push(permission)
    return acc
  }, {} as Record<string, typeof availablePermissions>)

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      console.log("🔧 ROLES FETCH - Using real authentication")
      
      const response = await fetch(`/admin/longhorn/roles`)
      const data = await response.json()
      
      console.log("🔧 ROLES FETCH - Raw response:", data)
      console.log("🔧 ROLES FETCH - Roles array:", data.roles)
      
      // Validación de roles
      const validRoles = (data.roles || []).filter(role => {
        const isValid = role && typeof role === 'object' && role.id
        if (!isValid) {
          console.warn("🔧 ROLES FETCH - Invalid role filtered:", role)
        }
        return isValid
      })
      
      console.log("🔧 ROLES FETCH - Valid roles:", validRoles)
      
      setRoles(validRoles)
      setIsFiltered(data.filtered || false)
    } catch (error) {
      console.error("🔧 ROLES FETCH - Error fetching roles:", error)
      showNotification("Error al cargar los roles", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("🔧 EDIT DEBUG - Form Data:", formData)
    console.log("🔧 EDIT DEBUG - Editing Role:", editingRole)
    
    try {
      const url = editingRole ? `/admin/longhorn/roles/${editingRole.id}` : "/admin/longhorn/roles"
      const method = editingRole ? "PUT" : "POST"
      
      const requestBody = {
        ...formData
      }
      
      console.log("🔧 ROLES EDIT - Request:", { url, method, body: requestBody })
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const responseData = await response.json()
      console.log("🔧 ROLES EDIT - Response:", { status: response.status, data: responseData })

      if (response.ok) {
        await fetchRoles()
        resetForm()
        showNotification(editingRole ? "Rol actualizado exitosamente" : "Rol creado exitosamente", "success")
      } else {
        console.error("🔧 ROLES EDIT - Error Response:", responseData)
        showNotification(responseData.message || "Error al guardar el rol", "error")
      }
    } catch (error) {
      console.error("🔧 ROLES EDIT - Catch Error:", error)
      showNotification("Error al guardar el rol", "error")
    }
  }

  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (!roleToDelete) return

    try {
      const response = await fetch(`/admin/longhorn/roles/${roleToDelete.id}`, {
        method: "DELETE",
      })

      const responseData = await response.json()

      if (response.ok) {
        await fetchRoles()
        showNotification("Rol eliminado exitosamente", "success")
      } else {
        showNotification(responseData.message || "Error al eliminar el rol", "error")
      }
    } catch (error) {
      console.error("Error deleting role:", error)
      showNotification("Error al eliminar el rol", "error")
    } finally {
      setShowDeleteModal(false)
      setRoleToDelete(null)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "local_staff",
      permissions: [],
      is_active: true
    })
    setEditingRole(null)
    setShowCreateForm(false)
  }

  const handleEdit = (role: Role) => {
    try {
      console.log("🔧 EDIT DEBUG - Role to edit:", role)
      
      // Validación defensiva
      if (!role || !role.id) {
        console.error("🔧 EDIT DEBUG - Invalid role:", role)
        showNotification("Error: Rol inválido", "error")
        return
      }

      // Convertir tipo del backend al formato del frontend
      const frontendType = role.type === "SUPER_ADMIN" ? "super_admin" :
                          role.type === "STORE_MANAGER" ? "local_manager" :
                          role.type === "STORE_STAFF" ? "local_staff" : role.type

      setEditingRole(role)
      setFormData({
        name: role.name || "",
        description: role.description || "",
        type: frontendType,
        permissions: Array.isArray(role.permissions) ? role.permissions : [],
        is_active: role.is_active !== undefined ? role.is_active : true
      })
      setShowCreateForm(true)
      
      console.log("🔧 EDIT DEBUG - Form data set:", {
        name: role.name || "",
        description: role.description || "",
        type: frontendType,
        permissions: Array.isArray(role.permissions) ? role.permissions : [],
        is_active: role.is_active !== undefined ? role.is_active : true
      })

      // Scroll suave hacia el formulario
      setTimeout(() => {
        const formElement = document.querySelector('.edit-form-container')
        if (formElement) {
          formElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          })
        } else {
          // Fallback: scroll al inicio de la página
          window.scrollTo({ 
            top: 0, 
            behavior: 'smooth' 
          })
        }
      }, 100) // Pequeño delay para asegurar que el DOM se actualice

    } catch (error) {
      console.error("🔧 EDIT DEBUG - Error in handleEdit:", error)
      showNotification("Error al preparar edición del rol", "error")
    }
  }

  const handlePermissionChange = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  const getRoleTypeInfo = (type: string) => {
    const roleType = getAllRoleTypes().find(rt => rt.value === type)
    return roleType || { value: type, label: type, color: "bg-gray-100 text-gray-800" }
  }

  const getPermissionLabel = (permissionKey: string) => {
    const permission = availablePermissions.find(p => p.key === permissionKey)
    return permission ? permission.label : permissionKey
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Users className="text-ui-fg-base w-8 h-8" />
          <h1 className="text-ui-fg-base text-2xl font-bold">Gestión de Roles</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ui-fg-base"></div>
          <span className="ml-3 text-ui-fg-muted">Cargando roles...</span>
        </div>
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
          <div className="flex items-center space-x-3">
            <Users className="text-ui-fg-base w-8 h-8" />
            <h1 className="text-ui-fg-base text-2xl font-bold">Gestión de Roles</h1>
          </div>
          {isFiltered && (
            <p className="text-ui-fg-muted text-sm mt-1 flex items-center space-x-1">
              <span className="text-blue-500">ℹ️</span>
              <span>Vista filtrada - No se muestran roles de Super Administrador</span>
            </p>
          )}
        </div>
        {/* Solo Super Admin puede crear roles */}
        {!isFiltered ? (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-ui-button-neutral text-ui-fg-on-color rounded-md hover:bg-ui-button-neutral-hover transition-colors text-sm font-medium flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>{showCreateForm ? "Cancelar" : "Crear Rol"}</span>
          </button>
        ) : (
          <div className="px-4 py-2 bg-ui-bg-subtle text-ui-fg-muted text-sm rounded-md border border-ui-border-base flex items-center space-x-2">
            <span>🔒</span>
            <span>Solo Super Admin puede crear roles</span>
          </div>
        )}
      </div>

      {/* Create/Edit Form - Solo visible para Super Admin */}
      {showCreateForm && !isFiltered && (
        <div className="mb-8 p-6 border border-ui-border-base rounded-md bg-ui-bg-base shadow-card-rest edit-form-container">
          <h2 className="text-ui-fg-base text-lg font-medium mb-4 flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>{editingRole ? "Editar Rol" : "Crear Nuevo Rol"}</span>
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-ui-fg-base text-sm font-medium mb-2">Nombre del Rol</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-ui-border-base rounded-md bg-ui-bg-base text-ui-fg-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  placeholder="Ej: Asistente de Cocina"
                />
              </div>

              <div>
                <label className="block text-ui-fg-base text-sm font-medium mb-2">Tipo de Rol</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-3 border border-ui-border-base rounded-md bg-ui-bg-base text-ui-fg-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {getFilteredRoleTypes().map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-ui-fg-base text-sm font-medium mb-2">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border border-ui-border-base rounded-md bg-ui-bg-base text-ui-fg-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Describe las responsabilidades de este rol..."
              />
            </div>

            <div>
              <label className="block text-ui-fg-base text-sm font-medium mb-3">Permisos</label>
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <div key={category} className="border border-ui-border-base rounded-lg p-4">
                    <h4 className="text-sm font-medium text-ui-fg-base mb-3 text-blue-700">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {permissions.map((permission) => (
                        <label key={permission.key} className="flex items-center space-x-2 text-sm hover:bg-ui-bg-subtle p-2 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission.key)}
                            onChange={() => handlePermissionChange(permission.key)}
                            className="rounded border-ui-border-base text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-ui-fg-base flex-1">{permission.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 p-3 bg-ui-bg-subtle rounded-md">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="rounded border-ui-border-base text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-ui-fg-base text-sm font-medium flex items-center space-x-1">
                <span>Rol Activo</span>
                <span className="text-ui-fg-muted text-xs">(Los roles inactivos no pueden ser asignados)</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-ui-border-base">
              <button
                type="submit"
                className="px-6 py-2 bg-ui-button-neutral text-ui-fg-on-color rounded-md hover:bg-ui-button-neutral-hover transition-colors text-sm font-medium flex items-center space-x-2"
              >
                <span>{editingRole ? "Actualizar" : "Crear"}</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-ui-button-transparent text-ui-fg-base rounded-md hover:bg-ui-button-transparent-hover transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Roles List */}
      <div className="bg-ui-bg-base rounded-md border border-ui-border-base shadow-card-rest">
        <div className="p-4 border-b border-ui-border-base bg-ui-bg-subtle">
          <h2 className="text-ui-fg-base text-lg font-medium flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Roles Existentes ({roles.length})</span>
          </h2>
        </div>
        
        {roles.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-ui-fg-muted mx-auto mb-4" />
            <p className="text-ui-fg-muted text-lg mb-2">No hay roles definidos</p>
            <p className="text-ui-fg-subtle text-sm mb-4">Crea el primer rol para comenzar a gestionar permisos</p>
            {!isFiltered ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-ui-button-neutral text-ui-fg-on-color rounded-md hover:bg-ui-button-neutral-hover transition-colors text-sm font-medium"
              >
                Crear Primer Rol
              </button>
            ) : (
              <div className="px-4 py-2 bg-ui-bg-subtle text-ui-fg-muted text-sm rounded-md border border-ui-border-base inline-flex items-center space-x-2">
                <span>🔒</span>
                <span>Solo Super Admin puede crear roles</span>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-ui-border-base">
            {roles.map((role) => {
              // Validación defensiva para cada rol
              if (!role || !role.id) {
                console.warn("🔧 RENDER DEBUG - Skipping invalid role:", role)
                return null
              }
              
              const roleTypeInfo = getRoleTypeInfo(role.type)
              return (
                <div key={role.id} className="p-6 hover:bg-ui-bg-subtle transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-ui-fg-base font-semibold text-lg">{role.name || 'Sin nombre'}</h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${roleTypeInfo.color}`}>
                          {roleTypeInfo.label}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          role.is_active 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {role.is_active ? "✓ Activo" : "✗ Inactivo"}
                        </span>
                      </div>
                      {role.description && (
                        <p className="text-ui-fg-muted text-sm mb-3 leading-relaxed">{role.description}</p>
                      )}
                      <div className="text-ui-fg-subtle text-sm">
                        <div className="flex items-center space-x-1 mb-1">
                          <span className="font-medium">Permisos ({Array.isArray(role.permissions) ? role.permissions.length : 0}):</span>
                        </div>
                        {Array.isArray(role.permissions) && role.permissions.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {role.permissions.slice(0, 5).map((permission, index) => (
                              <span 
                                key={`${role.id}-permission-${index}`} 
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border"
                                title={getPermissionLabel(permission)}
                              >
                                {getPermissionLabel(permission)}
                              </span>
                            ))}
                            {role.permissions.length > 5 && (
                              <span className="px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded border">
                                +{role.permissions.length - 5} más
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-ui-fg-muted italic">Sin permisos asignados</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      {/* Solo Super Admin puede editar y eliminar roles */}
                      {!isFiltered ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              console.log("🔧 EDIT BUTTON DEBUG - Clicked for role:", role)
                              handleEdit(role)
                            }}
                            className="px-4 py-2 bg-ui-button-neutral text-ui-fg-on-color text-sm rounded-md hover:bg-ui-button-neutral-hover transition-colors flex items-center space-x-1"
                            title="Editar rol"
                            type="button"
                          >
                            <span>✏️</span>
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleDeleteClick(role)
                            }}
                            className="px-4 py-2 bg-ui-button-danger text-ui-fg-on-color text-sm rounded-md hover:bg-ui-button-danger-hover transition-colors flex items-center space-x-1"
                            title="Eliminar rol"
                            type="button"
                          >
                            <span>🗑️</span>
                            <span>Eliminar</span>
                          </button>
                        </>
                      ) : (
                        <div className="px-4 py-2 bg-ui-bg-subtle text-ui-fg-muted text-sm rounded-md border border-ui-border-base flex items-center space-x-1">
                          <span>🔒</span>
                          <span>Solo Super Admin puede gestionar roles</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            }).filter(Boolean)}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-ui-bg-base rounded-lg border border-ui-border-base shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-lg">⚠️</span>
                </div>
                <h3 className="text-lg font-medium text-ui-fg-base">
                  Confirmar eliminación
                </h3>
              </div>
              <p className="text-ui-fg-muted mb-6 leading-relaxed">
                ¿Estás seguro de que quieres eliminar el rol <strong>"{roleToDelete?.name}"</strong>?
                <br />
                <span className="text-sm text-ui-fg-danger mt-2 block font-medium">
                  ⚠️ Esta acción no se puede deshacer y eliminará permanentemente el rol.
                </span>
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setRoleToDelete(null)
                  }}
                  className="px-4 py-2 bg-ui-button-transparent text-ui-fg-base rounded-md hover:bg-ui-button-transparent-hover transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-ui-button-danger text-ui-fg-on-color rounded-md hover:bg-ui-button-danger-hover transition-colors text-sm font-medium flex items-center space-x-1"
                >
                  <span>🗑️</span>
                  <span>Eliminar rol</span>
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
  label: "Roles de Usuario",
  icon: Users,
})

export default UserRolesManagement