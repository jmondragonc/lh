import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ShoppingCart, Calendar, CreditCard, Envelope, Eye, ArrowPath } from "@medusajs/icons"
import { useState, useEffect } from "react"
import { Button, Badge, Input } from "@medusajs/ui"

const GiftCardsPurchasesPage = () => {
  const [purchases, setPurchases] = useState([])
  const [stats, setStats] = useState({
    total_purchases: 0,
    total_revenue: 0,
    pending_purchases: 0,
    completed_purchases: 0,
    pending_deliveries: 0
  })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    searchTerm: "",
    status: "",
    startDate: "",
    endDate: ""
  })

  useEffect(() => {
    fetchPurchases()
  }, [filters])

  const fetchPurchases = async () => {
    try {
      setLoading(true)
      
      // Construir query parameters
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.startDate) params.append('start_date', filters.startDate)
      if (filters.endDate) params.append('end_date', filters.endDate)
      
      const response = await fetch(`/admin/longhorn/gift-cards/purchases?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setPurchases(data.purchases || [])
        setStats(data.stats || {})
      } else {
        console.error('Error fetching purchases')
      }
    } catch (error) {
      console.error('Error in fetchPurchases:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPurchases = purchases.filter(purchase =>
    purchase.gift_card?.code?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
    purchase.customer?.email?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
    purchase.sender?.name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
    purchase.recipient?.name?.toLowerCase().includes(filters.searchTerm.toLowerCase())
  )

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(Number(amount))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-PE')
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('es-PE')
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { color: "orange", label: "Pendiente" },
      completed: { color: "green", label: "Completado" },
      failed: { color: "red", label: "Fallido" },
      cancelled: { color: "grey", label: "Cancelado" }
    }
    
    const config = statusMap[status] || { color: "grey", label: status }
    return <Badge color={config.color}>{config.label}</Badge>
  }

  const getDeliveryStatusBadge = (status) => {
    const statusMap = {
      pending: { color: "orange", label: "Pendiente" },
      sent: { color: "blue", label: "Enviado" },
      delivered: { color: "green", label: "Entregado" },
      failed: { color: "red", label: "Fallo" }
    }
    
    const config = statusMap[status] || { color: "grey", label: status }
    return <Badge color={config.color}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-ui-fg-base text-2xl font-bold mb-6">Compras Online de Gift Cards</h1>
        <div className="flex items-center justify-center py-12">
          <ArrowPath className="w-6 h-6 animate-spin text-ui-fg-muted mr-2" />
          <span className="text-ui-fg-muted">Cargando compras...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-ui-fg-base text-2xl font-bold">Compras Online de Gift Cards</h1>
        <p className="text-ui-fg-muted mt-2">
          Gestiona todas las compras de gift cards realizadas desde el frontend
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-ui-bg-base rounded-md border border-ui-border-base shadow-card-rest p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ui-fg-muted text-sm">Total Compras</p>
              <p className="text-ui-fg-base text-xl font-bold">{stats.total_purchases}</p>
            </div>
            <ShoppingCart className="w-5 h-5 text-ui-fg-base" />
          </div>
        </div>

        <div className="bg-ui-bg-base rounded-md border border-ui-border-base shadow-card-rest p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ui-fg-muted text-sm">Ingresos Totales</p>
              <p className="text-ui-fg-base text-xl font-bold">{formatCurrency(stats.total_revenue)}</p>
            </div>
            <CreditCard className="w-5 h-5 text-ui-fg-base" />
          </div>
        </div>

        <div className="bg-ui-bg-base rounded-md border border-ui-border-base shadow-card-rest p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ui-fg-muted text-sm">Pendientes</p>
              <p className="text-ui-fg-base text-xl font-bold">{stats.pending_purchases}</p>
            </div>
            <Calendar className="w-5 h-5 text-orange-500" />
          </div>
        </div>

        <div className="bg-ui-bg-base rounded-md border border-ui-border-base shadow-card-rest p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ui-fg-muted text-sm">Completadas</p>
              <p className="text-ui-fg-base text-xl font-bold">{stats.completed_purchases}</p>
            </div>
            <Calendar className="w-5 h-5 text-green-500" />
          </div>
        </div>

        <div className="bg-ui-bg-base rounded-md border border-ui-border-base shadow-card-rest p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ui-fg-muted text-sm">Entregas Pendientes</p>
              <p className="text-ui-fg-base text-xl font-bold">{stats.pending_deliveries}</p>
            </div>
            <Envelope className="w-5 h-5 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-ui-bg-base rounded-md border border-ui-border-base shadow-card-rest p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Buscar por código, email, nombre..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            />
          </div>
          
          <div>
            <select
              className="w-full px-3 py-2 border border-ui-border-base rounded-md bg-ui-bg-field text-ui-fg-base focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="completed">Completado</option>
              <option value="failed">Fallido</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          <div>
            <input
              type="date"
              className="w-full px-3 py-2 border border-ui-border-base rounded-md bg-ui-bg-field text-ui-fg-base focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              placeholder="Fecha inicio"
            />
          </div>

          <div>
            <input
              type="date"
              className="w-full px-3 py-2 border border-ui-border-base rounded-md bg-ui-bg-field text-ui-fg-base focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              placeholder="Fecha fin"
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button
            variant="secondary"
            size="base"
            onClick={() => setFilters({ searchTerm: "", status: "", startDate: "", endDate: "" })}
          >
            Limpiar Filtros
          </Button>
        </div>
      </div>

      {/* Tabla de Compras */}
      <div className="bg-ui-bg-base border border-ui-border-base shadow-card-rest mb-20">
        <div className="relative">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-ui-bg-subtle border-b border-ui-border-base">
                <tr>
                  <th className="text-left py-3 px-4 text-ui-fg-muted text-sm font-medium">Gift Card</th>
                  <th className="text-left py-3 px-4 text-ui-fg-muted text-sm font-medium">Cliente</th>
                  <th className="text-left py-3 px-4 text-ui-fg-muted text-sm font-medium">Destinatario</th>
                  <th className="text-left py-3 px-4 text-ui-fg-muted text-sm font-medium">Monto</th>
                  <th className="text-left py-3 px-4 text-ui-fg-muted text-sm font-medium">Estado Pago</th>
                  <th className="text-left py-3 px-4 text-ui-fg-muted text-sm font-medium">Estado Entrega</th>
                  <th className="text-left py-3 px-4 text-ui-fg-muted text-sm font-medium">Fecha Compra</th>
                  <th className="text-left py-3 px-4 text-ui-fg-muted text-sm font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8">
                      <ShoppingCart className="w-12 h-12 text-ui-fg-muted mx-auto mb-4" />
                      <p className="text-ui-fg-muted">No se encontraron compras</p>
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b border-ui-border-base hover:bg-ui-bg-subtle">
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-mono text-sm font-medium text-ui-fg-base">
                            {purchase.gift_card?.code}
                          </span>
                          <p className="text-ui-fg-muted text-xs">
                            Balance: {formatCurrency(purchase.gift_card?.balance || 0)}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-ui-fg-base text-sm font-medium">{purchase.customer?.name}</p>
                          <p className="text-ui-fg-muted text-xs">{purchase.customer?.email}</p>
                          {purchase.customer?.phone && (
                            <p className="text-ui-fg-muted text-xs">{purchase.customer.phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-ui-fg-base text-sm">{purchase.recipient?.name}</p>
                          <p className="text-ui-fg-muted text-xs">{purchase.recipient?.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <span className="text-ui-fg-base font-medium">
                            {formatCurrency(purchase.payment?.amount)}
                          </span>
                          <p className="text-ui-fg-muted text-xs">
                            {purchase.payment?.method?.toUpperCase()}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(purchase.payment?.status)}
                      </td>
                      <td className="py-3 px-4">
                        {getDeliveryStatusBadge(purchase.delivery?.status)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-ui-fg-muted text-sm">
                          {formatDateTime(purchase.purchased_at)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-ui-fg-muted hover:bg-ui-bg-subtle focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {purchase.delivery?.status === 'failed' && (
                            <button
                              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-ui-fg-muted hover:bg-ui-bg-subtle focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
                              title="Reenviar email"
                            >
                              <Envelope className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-ui-bg-subtle rounded-md p-4">
        <p className="text-ui-fg-muted text-sm">
          Mostrando {filteredPurchases.length} de {purchases.length} compras online
        </p>
      </div>
    </div>
  )
}

// Configuration
export const config = defineRouteConfig({
  label: "Compras Online",
})

export default GiftCardsPurchasesPage
