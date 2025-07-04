import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useState, useEffect } from "react"

interface Role {
  id: string
  name: string
  type: string
  permissions?: string[]
  description?: string
}

interface UserRoleAssignment {
  id: string
  role_id: string
  user_id: string
  restaurant_location_id?: string | null
  is_active: boolean
  role?: Role
  // Direct properties for convenience
  name?: string
  description?: string
  permissions?: string[]
}

interface Location {
  id: string
  name: string
  address: string
}

interface UserData {
  id: string
  email: string
  first_name?: string
  last_name?: string
}

// Widget para mostrar y gestionar roles de usuario usando APIs de Longhorn
const UserRolesWidget = ({ data }: { data: UserData }) => {
  const [userRoles, setUserRoles] = useState<UserRoleAssignment[]>([])
  const [availableRoles, setAvailableRoles] = useState<Role[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")

  const userId = data?.id

  // Fetch user roles and available data
  useEffect(() => {
    if (userId) {
      Promise.all([
        fetchUserRoles(),
        fetchAvailableRoles(),
        fetchLocations()
      ]).finally(() => setLoading(false))
    }
  }, [userId])

  const fetchUserRoles = async () => {
    try {
      const response = await fetch(`/admin/longhorn/users/${userId}/roles`)
      const data = await response.json()
      setUserRoles(data.roles || [])
    } catch (error) {
      console.error("Error fetching user roles:", error)
    }
  }

  const fetchAvailableRoles = async () => {
    try {
      const response = await fetch("/admin/longhorn/roles")
      const data = await response.json()
      setAvailableRoles(data.roles || [])
    } catch (error) {
      console.error("Error fetching available roles:", error)
    }
  }

  const fetchLocations = async () => {
    try {
      const response = await fetch("/admin/longhorn/stores")
      const data = await response.json()
      setLocations(data.stores || [])
    } catch (error) {
      console.error("Error fetching locations:", error)
    }
  }

  const assignRole = async () => {
    if (!selectedRole) return

    try {
      const response = await fetch(`/admin/longhorn/users/${userId}/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role_id: selectedRole,
          restaurant_location_id: selectedLocation || null,
        }),
      })

      if (response.ok) {
        await fetchUserRoles()
        setShowAssignForm(false)
        setSelectedRole("")
        setSelectedLocation("")
        alert("Rol asignado exitosamente")
      }
    } catch (error) {
      console.error("Error assigning role:", error)
      alert("Error al asignar rol")
    }
  }

  const removeRole = async (roleId: string, locationId: string | null = null) => {
    if (!confirm("¿Estás seguro de que quieres remover este rol?")) return

    try {
      const url = `/admin/longhorn/users/${userId}/roles/${roleId}${locationId ? `?restaurant_location_id=${locationId}` : ""}`
      const response = await fetch(url, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchUserRoles()
        alert("Rol removido exitosamente")
      }
    } catch (error) {
      console.error("Error removing role:", error)
      alert("Error al remover rol")
    }
  }

  const getRoleDisplayName = (role: any) => {
    return `${role.name} (${role.type})`
  }

  const getLocationName = (locationId: string | null) => {
    if (!locationId) return "Global"
    const location = locations.find(loc => loc.id === locationId)
    return location ? location.name : "Global"
  }

  if (loading) {
    return (
      <div className="bg-ui-bg-base rounded-lg border border-ui-border-base shadow-card-rest p-6">
        <h3 className="text-ui-fg-base text-lg font-medium mb-4">Roles de Usuario - Longhorn</h3>
        <div className="text-ui-fg-muted">Cargando roles...</div>
      </div>
    )
  }

  return (
    <div className="bg-ui-bg-base rounded-lg border border-ui-border-base shadow-card-rest p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-ui-fg-base text-lg font-medium">Roles de Usuario - Longhorn</h3>
        <button
          onClick={() => setShowAssignForm(!showAssignForm)}
          className="px-4 py-2 bg-ui-button-neutral text-ui-fg-on-color rounded-md hover:bg-ui-button-neutral-hover transition-colors text-sm font-medium"
        >
          {showAssignForm ? "Cancelar" : "Asignar Rol"}
        </button>
      </div>

      {/* Assign Role Form */}
      {showAssignForm && (
        <div className="mb-6 p-4 border border-ui-border-base rounded-md bg-ui-bg-subtle">
          <h4 className="text-ui-fg-base font-medium mb-3">Asignar Nuevo Rol</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-ui-fg-base text-sm font-medium mb-1">Rol</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full p-2 border border-ui-border-base rounded-md bg-ui-bg-base text-ui-fg-base"
              >
                <option value="">Seleccionar rol...</option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {getRoleDisplayName(role)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-ui-fg-base text-sm font-medium mb-1">
                Sucursal (opcional)
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full p-2 border border-ui-border-base rounded-md bg-ui-bg-base text-ui-fg-base"
              >
                <option value="">Global (todas las sucursales)</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={assignRole}
              disabled={!selectedRole}
              className="px-4 py-2 bg-ui-button-neutral text-ui-fg-on-color rounded-md hover:bg-ui-button-neutral-hover disabled:bg-ui-bg-disabled disabled:text-ui-fg-disabled transition-colors text-sm font-medium"
            >
              Asignar
            </button>
            <button
              onClick={() => setShowAssignForm(false)}
              className="px-4 py-2 bg-ui-button-transparent text-ui-fg-base rounded-md hover:bg-ui-button-transparent-hover transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Current Roles */}
      <div>
        <h4 className="text-ui-fg-base font-medium mb-3">Roles Actuales</h4>
        {userRoles.length === 0 ? (
          <p className="text-ui-fg-muted text-sm">
            Este usuario no tiene roles asignados.
          </p>
        ) : (
          <div className="space-y-2">
            {userRoles.map((role, index) => (
              <div
                key={`${role.id}-${index}`}
                className="flex items-center justify-between p-3 border border-ui-border-base rounded-md bg-ui-bg-subtle"
              >
                <div>
                  <div className="text-ui-fg-base font-medium">{getRoleDisplayName(role)}</div>
                  <div className="text-ui-fg-muted text-sm">
                    {role.description || "Sin descripción"}
                  </div>
                  <div className="text-ui-fg-subtle text-xs mt-1">
                    Sucursal: {getLocationName(role.restaurant_location_id)}
                  </div>
                </div>
                <button
                  onClick={() => removeRole(role.id, role.restaurant_location_id || null)}
                  className="px-3 py-1 bg-ui-button-danger text-ui-fg-on-color text-sm rounded-md hover:bg-ui-button-danger-hover transition-colors"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permissions Info */}
      {userRoles.length > 0 && (
        <div className="mt-4 p-3 bg-ui-bg-highlight rounded-md">
          <h5 className="text-ui-fg-base font-medium mb-2">Permisos Actuales</h5>
          <div className="text-ui-fg-muted text-sm">
            {userRoles.map((role) => (
              <div key={role.id} className="mb-1">
                <strong className="text-ui-fg-base">{role.name}:</strong>{" "}
                {role.permissions?.join(", ") || "Sin permisos específicos"}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Configuration to inject this widget into user details page
export const config = defineWidgetConfig({
  zone: "user.details.after", // This will show after user details
})

export default UserRolesWidget
