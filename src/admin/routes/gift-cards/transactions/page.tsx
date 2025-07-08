import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Receipt, MagnifyingGlass } from "@medusajs/icons"
import { useState, useEffect } from "react"

const GiftCardsTransactionsPage = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      // Primero obtenemos todas las gift cards
      const giftCardsResponse = await fetch('/admin/longhorn/gift-cards')
      if (giftCardsResponse.ok) {
        const giftCardsData = await giftCardsResponse.json()
        const giftCards = giftCardsData.gift_cards || []

        // Luego obtenemos las transacciones de cada gift card
        const allTransactions = []
        for (const giftCard of giftCards) {
          try {
            const transactionsResponse = await fetch(`/admin/longhorn/gift-cards/${giftCard.id}/transactions`)
            if (transactionsResponse.ok) {
              const transactionsData = await transactionsResponse.json()
              const cardTransactions = transactionsData.transactions || []
              
              // Agregamos información de la gift card a cada transacción
              cardTransactions.forEach(transaction => {
                transaction.gift_card_code = giftCard.code
                transaction.gift_card_recipient = giftCard.recipient_name
                allTransactions.push(transaction)
              })
            }
          } catch (error) {
            console.error(`Error fetching transactions for gift card ${giftCard.id}:`, error)
          }
        }

        // Ordenar por fecha de creación (más recientes primero)
        allTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setTransactions(allTransactions)
      }
    } catch (error) {
      console.error('Error in fetchTransactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter((transaction: any) =>
    transaction.gift_card_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.transaction_type?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(Number(amount))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionTypeBadge = (type: string) => {
    const types = {
      purchase: { bg: 'bg-green-100', text: 'text-green-600', label: 'Compra' },
      redemption: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Redención' },
      refund: { bg: 'bg-orange-100', text: 'text-orange-600', label: 'Reembolso' },
      adjustment: { bg: 'bg-purple-100', text: 'text-purple-600', label: 'Ajuste' },
      expiration: { bg: 'bg-red-100', text: 'text-red-600', label: 'Expiración' },
      transfer: { bg: 'bg-indigo-100', text: 'text-indigo-600', label: 'Transferencia' }
    }
    
    const typeConfig = types[type as keyof typeof types] || { bg: 'bg-gray-100', text: 'text-gray-600', label: type }
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${typeConfig.bg} ${typeConfig.text}`}>
        {typeConfig.label}
      </span>
    )
  }

  const getAmountClass = (type: string) => {
    if (type === 'redemption' || type === 'expiration') {
      return 'text-red-600'
    }
    if (type === 'refund' || type === 'purchase') {
      return 'text-green-600'
    }
    return 'text-ui-fg-base'
  }

  const formatAmount = (amount: string | number, type: string) => {
    const formattedAmount = formatCurrency(amount)
    if (type === 'redemption' || type === 'expiration') {
      return `-${formattedAmount}`
    }
    if (type === 'refund' || type === 'purchase') {
      return `+${formattedAmount}`
    }
    return formattedAmount
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-ui-fg-base text-2xl font-bold mb-6">Transacciones de Gift Cards</h1>
        <div className="text-ui-fg-muted">Cargando transacciones...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-ui-fg-base text-2xl font-bold">Transacciones de Gift Cards</h1>
        <p className="text-ui-fg-muted mt-2">
          Historial completo de todas las transacciones de gift cards
        </p>
      </div>

      {/* Search */}
      <div className="bg-ui-bg-base rounded-md border border-ui-border-base shadow-card-rest p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlass className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-ui-fg-muted" />
            <input
              type="text"
              placeholder="Buscar por código, descripción o tipo de transacción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-ui-border-base rounded-md bg-ui-bg-field text-ui-fg-base placeholder-ui-fg-muted focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-ui-bg-base rounded-md border border-ui-border-base shadow-card-rest overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-ui-bg-subtle border-b border-ui-border-base">
              <tr>
                <th className="text-left py-3 px-4 text-ui-fg-muted text-sm font-medium">Gift Card</th>
                <th className="text-left py-3 px-4 text-ui-fg-muted text-sm font-medium">Tipo</th>
                <th className="text-left py-3 px-4 text-ui-fg-muted text-sm font-medium">Monto</th>
                <th className="text-left py-3 px-4 text-ui-fg-muted text-sm font-medium">Balance Anterior</th>
                <th className="text-left py-3 px-4 text-ui-fg-muted text-sm font-medium">Balance Posterior</th>
                <th className="text-left py-3 px-4 text-ui-fg-muted text-sm font-medium">Descripción</th>
                <th className="text-left py-3 px-4 text-ui-fg-muted text-sm font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <Receipt className="w-12 h-12 text-ui-fg-muted mx-auto mb-4" />
                    <p className="text-ui-fg-muted">No se encontraron transacciones</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction: any) => (
                  <tr key={transaction.id} className="border-b border-ui-border-base hover:bg-ui-bg-subtle">
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-mono text-sm font-medium text-ui-fg-base">{transaction.gift_card_code}</span>
                        {transaction.gift_card_recipient && (
                          <p className="text-ui-fg-muted text-xs">{transaction.gift_card_recipient}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getTransactionTypeBadge(transaction.transaction_type)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${getAmountClass(transaction.transaction_type)}`}>
                        {formatAmount(transaction.amount, transaction.transaction_type)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-ui-fg-base">{formatCurrency(transaction.balance_before)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-ui-fg-base font-medium">{formatCurrency(transaction.balance_after)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-ui-fg-base text-sm">{transaction.description || '—'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-ui-fg-muted text-sm">{formatDate(transaction.created_at)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-ui-bg-subtle rounded-md p-4">
        <p className="text-ui-fg-muted text-sm">
          Mostrando {filteredTransactions.length} transacciones
        </p>
      </div>
    </div>
  )
}

// ✅ Configuration
export const config = defineRouteConfig({
  label: "Transacciones",
})

export default GiftCardsTransactionsPage
