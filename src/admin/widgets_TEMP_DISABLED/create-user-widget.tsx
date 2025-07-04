import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useState, useEffect } from "react"

// Widget para mostrar botón de crear usuario en la página de lista de usuarios
const CreateUserWidget = () => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    avatar_url: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/admin/longhorn/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert("Usuario creado exitosamente")
        setShowCreateForm(false)
        setFormData({
          email: "",
          first_name: "",
          last_name: "",
          avatar_url: "",
        })
        // Recargar la página para mostrar el nuevo usuario
        window.location.reload()
      } else {
        const errorData = await response.json()
        alert(errorData.message || "Error al crear usuario")
      }
    } catch (error) {
      console.error("Error creating user:", error)
      alert("Error al crear usuario")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: "",
      first_name: "",
      last_name: "",
      avatar_url: "",
    })
    setShowCreateForm(false)
  }

  return (
    <div className="bg-ui-bg-base rounded-lg border border-ui-border-base shadow-card-rest p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-ui-fg-base text-lg font-medium">Gestión de Usuarios Longhorn</h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-ui-button-neutral text-ui-fg-on-color rounded-md hover:bg-ui-button-neutral-hover transition-colors text-sm font-medium"
        >
          {showCreateForm ? "Cancelar" : "Crear Usuario"}
        </button>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="p-4 border border-ui-border-base rounded-md bg-ui-bg-subtle">
          <h4 className="text-ui-fg-base font-medium mb-3">Crear Nuevo Usuario</h4>
          
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
                  placeholder="usuario@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-ui-fg-base text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  className="w-full p-2 border border-ui-border-base rounded-md bg-ui-bg-base text-ui-fg-base"
                  placeholder="Nombre"
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
                  placeholder="Apellido"
                />
              </div>

              <div>
                <label className="block text-ui-fg-base text-sm font-medium mb-1">URL del Avatar</label>
                <input
                  type="url"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                  className="w-full p-2 border border-ui-border-base rounded-md bg-ui-bg-base text-ui-fg-base"
                  placeholder="https://ejemplo.com/avatar.jpg"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || !formData.email}
                className="px-4 py-2 bg-ui-button-neutral text-ui-fg-on-color rounded-md hover:bg-ui-button-neutral-hover disabled:bg-ui-bg-disabled disabled:text-ui-fg-disabled transition-colors text-sm font-medium"
              >
                {loading ? "Creando..." : "Crear Usuario"}
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

          <div className="mt-4 p-3 bg-ui-bg-highlight rounded-md">
            <p className="text-ui-fg-muted text-sm">
              <strong className="text-ui-fg-base">Nota:</strong> El usuario será creado con las APIs de Longhorn. 
              Puedes asignar roles después de crear el usuario en la sección de gestión.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Configuration to inject this widget at the top of users page
export const config = defineWidgetConfig({
  zone: "user.list.before", // This shows before the user list
})

export default CreateUserWidget
