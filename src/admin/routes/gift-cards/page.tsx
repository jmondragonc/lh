import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Gift } from "@medusajs/icons"
import { useState, useEffect } from "react"

const GiftCardsMainPage = () => {
  const [stats, setStats] = useState({
    totalGiftCards: 0,
    activeGiftCards: 0,
    redeemedGiftCards: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/admin/longhorn/gift-cards/stats')
      if (response.ok) {
        const data = await response.json()
        setStats({
          totalGiftCards: data.stats.total_gift_cards,
          activeGiftCards: data.stats.active_gift_cards,
          redeemedGiftCards: data.stats.redeemed_gift_cards
        })
      } else {
        console.error('Error fetching gift card stats')
      }
    } catch (error) {
      console.error('Error in fetchStats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-ui-fg-base text-2xl font-bold mb-6">Gestión de Gift Cards</h1>
        <div className="text-ui-fg-muted">Cargando estadísticas...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-ui-fg-base text-2xl font-bold">Gestión de Gift Cards</h1>
        <p className="text-ui-fg-muted mt-2">
          Administra las tarjetas de regalo del sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-ui-bg-base rounded-md border border-ui-border-base shadow-card-rest p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ui-fg-muted text-sm">Total Gift Cards</p>
              <p className="text-ui-fg-base text-2xl font-bold">{stats.totalGiftCards}</p>
            </div>
            <div className="w-12 h-12 bg-ui-bg-highlight rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-ui-fg-base" />
            </div>
          </div>
        </div>

        <div className="bg-ui-bg-base rounded-md border border-ui-border-base shadow-card-rest p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ui-fg-muted text-sm">Gift Cards Activas</p>
              <p className="text-ui-fg-base text-2xl font-bold">{stats.activeGiftCards}</p>
            </div>
            <div className="w-12 h-12 bg-ui-bg-highlight rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-ui-fg-base" />
            </div>
          </div>
        </div>

        <div className="bg-ui-bg-base rounded-md border border-ui-border-base shadow-card-rest p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-ui-fg-muted text-sm">Gift Cards Redimidas</p>
              <p className="text-ui-fg-base text-2xl font-bold">{stats.redeemedGiftCards}</p>
            </div>
            <div className="w-12 h-12 bg-ui-bg-highlight rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-ui-fg-base" />
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
              href="/app/gift-cards/management"
              className="flex items-center justify-between p-3 border border-ui-border-base rounded-md hover:bg-ui-bg-subtle transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Gift className="w-5 h-5 text-ui-fg-base" />
                <div>
                  <p className="text-ui-fg-base font-medium">Gestionar Gift Cards</p>
                  <p className="text-ui-fg-muted text-sm">Crear, editar y administrar tarjetas de regalo</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-ui-fg-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>

            <a 
              href="/app/gift-cards/transactions"
              className="flex items-center justify-between p-3 border border-ui-border-base rounded-md hover:bg-ui-bg-subtle transition-colors"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-ui-fg-base" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <div>
                  <p className="text-ui-fg-base font-medium">Ver Transacciones</p>
                  <p className="text-ui-fg-muted text-sm">Historial de uso y redenciones</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-ui-fg-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        {/* Gift Card Features */}
        <div className="bg-ui-bg-base rounded-md border border-ui-border-base shadow-card-rest p-6">
          <h3 className="text-ui-fg-base text-lg font-medium mb-4">Funcionalidades</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <div>
                <p className="text-ui-fg-base font-medium">Generación de Códigos</p>
                <p className="text-ui-fg-muted text-sm">Códigos únicos automáticos</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <div>
                <p className="text-ui-fg-base font-medium">Múltiples Monedas</p>
                <p className="text-ui-fg-muted text-sm">Soporte para PEN y otras monedas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
              <div>
                <p className="text-ui-fg-base font-medium">Historial Completo</p>
                <p className="text-ui-fg-muted text-sm">Seguimiento de todas las transacciones</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
              <div>
                <p className="text-ui-fg-base font-medium">Fechas de Expiración</p>
                <p className="text-ui-fg-muted text-sm">Control de validez de las tarjetas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="bg-ui-bg-base rounded-md border border-ui-border-base shadow-card-rest p-6">
        <h3 className="text-ui-fg-base text-lg font-medium mb-4">Sistema de Gift Cards Longhorn</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-ui-bg-subtle rounded-md">
            <div className="flex items-center space-x-2 mb-2">
              <Gift className="w-5 h-5 text-ui-fg-base" />
              <h4 className="text-ui-fg-base font-medium">Tarjetas de Regalo</h4>
            </div>
            <p className="text-ui-fg-muted text-sm">Sistema completo para la gestión de gift cards con códigos únicos, balances automáticos y seguimiento de transacciones.</p>
          </div>

          <div className="p-4 bg-ui-bg-subtle rounded-md">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-ui-fg-base" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h4 className="text-ui-fg-base font-medium">Seguridad y Validaciones</h4>
            </div>
            <p className="text-ui-fg-muted text-sm">Códigos únicos, validación de saldos, verificación de estados activos y auditoría completa de todas las operaciones.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ✅ Configuration
export const config = defineRouteConfig({
  label: "Gift Cards",
  icon: Gift,
})

export default GiftCardsMainPage

