import React, { useState, useEffect, useRef } from "react";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Gift, Plus, MagnifyingGlass, EllipsisHorizontal, XMark, Trash, Eye, PencilSquare, CheckCircleSolid, ExclamationCircleSolid, ArrowPath } from "@medusajs/icons";

const GiftCardsManagementPage = () => {
  const [giftCards, setGiftCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    initial_value: '',
    recipient_name: '',
    recipient_email: '',
    sender_name: '',
    message: '',
    expires_at: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGiftCard, setEditingGiftCard] = useState(null);
  const [editForm, setEditForm] = useState({
    recipient_name: '',
    recipient_email: '',
    sender_name: '',
    message: '',
    expires_at: '',
    is_active: true,
    notes: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState('');

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedGiftCard, setSelectedGiftCard] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [showDropdown, setShowDropdown] = useState({});
  const dropdownRefs = useRef({});

  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingGiftCard, setDeletingGiftCard] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchGiftCards();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(showDropdown).forEach(cardId => {
        if (showDropdown[cardId] && dropdownRefs.current[cardId] && !dropdownRefs.current[cardId].contains(event.target)) {
          setShowDropdown(prev => ({ ...prev, [cardId]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 5000);
  };

  const fetchGiftCards = async () => {
    try {
      const response = await fetch('/admin/longhorn/gift-cards');
      if (response.ok) {
        const data = await response.json();
        setGiftCards(data.gift_cards || []);
      } else {
        const errorData = await response.json();
        showNotification('error', `Error cargando gift cards: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error in fetchGiftCards:', error);
      showNotification('error', 'Error de conexión al cargar gift cards');
    } finally {
      setLoading(false);
    }
  };

  const generateGiftCardCode = async () => {
    try {
      const response = await fetch('/admin/longhorn/gift-cards/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prefix: "GIFT" })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.code;
      } else {
        throw new Error('Error generando código');
      }
    } catch (error) {
      console.error('Error generating code:', error);
      throw error;
    }
  };

  const handleCreateGiftCard = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError('');
    
    try {
      const generatedCode = await generateGiftCardCode();
      
      const response = await fetch('/admin/longhorn/gift-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: generatedCode,
          ...createForm,
          initial_value: parseFloat(createForm.initial_value) || 0,
          expiration_date: createForm.expires_at || null
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setGiftCards(prev => [data.gift_card, ...prev]);
        setShowCreateModal(false);
        setCreateForm({
          initial_value: '',
          recipient_name: '',
          recipient_email: '',
          sender_name: '',
          message: '',
          expires_at: ''
        });
        showNotification('success', '¡Gift card creada exitosamente!');
      } else {
        const errorData = await response.json();
        setCreateError(errorData.message || 'Error creando gift card');
      }
    } catch (error) {
      console.error('Error in handleCreateGiftCard:', error);
      setCreateError('Error de conexión al crear gift card');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditGiftCard = async (e) => {
    e.preventDefault();
    if (!editingGiftCard) return;
    
    setIsEditing(true);
    setEditError('');
    
    try {
      const response = await fetch(`/admin/longhorn/gift-cards/${editingGiftCard.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editForm,
          expiration_date: editForm.expires_at || null
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setGiftCards(prev => prev.map(card => 
          card.id === editingGiftCard.id ? data.gift_card : card
        ));
        setShowEditModal(false);
        setEditingGiftCard(null);
        showNotification('success', '¡Gift card actualizada exitosamente!');
      } else {
        const errorData = await response.json();
        setEditError(errorData.message || 'Error actualizando gift card');
      }
    } catch (error) {
      console.error('Error in handleEditGiftCard:', error);
      setEditError('Error de conexión al actualizar gift card');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteClick = (giftCard) => {
    setDeletingGiftCard(giftCard);
    setShowDeleteModal(true);
    setShowDropdown(prev => ({ ...prev, [giftCard.id]: false }));
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGiftCard) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/admin/longhorn/gift-cards/${deletingGiftCard.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setGiftCards(prev => prev.filter(card => card.id !== deletingGiftCard.id));
        showNotification('success', 'Gift card eliminada exitosamente');
        setShowDeleteModal(false);
        setDeletingGiftCard(null);
      } else {
        const errorData = await response.json();
        showNotification('error', `Error eliminando gift card: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error in handleDeleteConfirm:', error);
      showNotification('error', 'Error de conexión al eliminar gift card');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeletingGiftCard(null);
  };

  const handleViewDetails = async (giftCard) => {
    setSelectedGiftCard(giftCard);
    setLoadingDetails(true);
    setShowDetailsModal(true);
    
    try {
      const response = await fetch(`/admin/longhorn/gift-cards/${giftCard.id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedGiftCard(data.gift_card);
      } else {
        showNotification('error', 'Error cargando detalles de la gift card');
      }
    } catch (error) {
      console.error('Error loading gift card details:', error);
      showNotification('error', 'Error de conexión al cargar detalles');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleEditClick = (giftCard) => {
    setEditingGiftCard(giftCard);
    setEditForm({
      recipient_name: giftCard.recipient_name || '',
      recipient_email: giftCard.recipient_email || '',
      sender_name: giftCard.sender_name || '',
      message: giftCard.message || '',
      expires_at: giftCard.expiration_date ? giftCard.expiration_date.split('T')[0] : '',
      is_active: giftCard.is_active !== false,
      notes: giftCard.notes || ''
    });
    setShowEditModal(true);
    setShowDropdown(prev => ({ ...prev, [giftCard.id]: false }));
  };

  const toggleDropdown = (cardId) => {
    setShowDropdown(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const filteredGiftCards = giftCards.filter((card) =>
    card.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.sender_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(Number(amount));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-PE');
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('es-PE');
  };

  const getStatusBadge = (card) => {
    if (!card.is_active) {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Inactiva</span>;
    }
    if (card.is_redeemed) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">Redimida</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">Activa</span>;
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-ui-fg-base text-2xl font-bold mb-6">Gestión de Gift Cards</h1>
        <div className="flex items-center justify-center py-12">
          <ArrowPath className="w-6 h-6 animate-spin text-ui-fg-muted mr-2" />
          <span className="text-ui-fg-muted">Cargando gift cards...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 max-w-md rounded-md shadow-lg p-4 ${
          notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? 
              <CheckCircleSolid className="w-5 h-5 text-green-600 mr-2" /> : 
              <ExclamationCircleSolid className="w-5 h-5 text-red-600 mr-2" />
            }
            <p className={`text-sm ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {notification.message}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-ui-fg-base text-2xl font-bold">Gestión de Gift Cards</h1>
          <p className="text-ui-fg-muted mt-2">
            Administra todas las tarjetas de regalo del sistema
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Gift Card
        </button>
      </div>

      <div className="bg-ui-bg-base rounded-md border border-ui-border-base shadow-card-rest p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por código, remitente o destinatario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-ui-border-base rounded-md bg-ui-bg-field text-ui-fg-base placeholder-ui-fg-muted focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
            />
          </div>
        </div>
      </div>

      <div className="bg-ui-bg-base border border-ui-border-base shadow-card-rest mb-20">
        <div className="relative">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
            <thead className="bg-ui-bg-subtle border-b border-ui-border-base">
              <tr>
                <th className="text-left py-3 px-4 text-ui-fg-muted text-sm font-medium">Código</th>
                <th className="text-left py-3 px-4 text-ui-fg-muted text-sm font-medium">Valor Inicial</th>
                <th className="text-left py-3 px-4 text-ui-fg-muted text-sm font-medium">Balance</th>
                <th className="text-left py-3 px-4 text-ui-fg-muted text-sm font-medium">Estado</th>
                <th className="text-left py-3 px-4 text-ui-fg-muted text-sm font-medium">Destinatario</th>
                <th className="text-left py-3 px-4 text-ui-fg-muted text-sm font-medium">Creada</th>
                <th className="text-left py-3 px-4 text-ui-fg-muted text-sm font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredGiftCards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <Gift className="w-12 h-12 text-ui-fg-muted mx-auto mb-4" />
                    <p className="text-ui-fg-muted">No se encontraron gift cards</p>
                  </td>
                </tr>
              ) : (
                filteredGiftCards.map((card) => (
                  <tr key={card.id} className="border-b border-ui-border-base hover:bg-ui-bg-subtle">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm font-medium text-ui-fg-base">{card.code}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-ui-fg-base">{formatCurrency(card.initial_value)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-ui-fg-base font-medium">{formatCurrency(card.balance)}</span>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(card)}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-ui-fg-base text-sm">{card.recipient_name || '—'}</p>
                        <p className="text-ui-fg-muted text-xs">{card.recipient_email || ''}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-ui-fg-muted text-sm">{formatDate(card.created_at)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative inline-block text-left" ref={el => dropdownRefs.current[card.id] = el}>
                        <button
                          onClick={() => toggleDropdown(card.id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-ui-fg-muted hover:bg-ui-bg-subtle focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
                        >
                          <EllipsisHorizontal className="w-4 h-4" />
                        </button>
                        {showDropdown[card.id] && (
                          <div className="fixed z-[9999] mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 border border-gray-200"
                               style={{
                                 top: dropdownRefs.current[card.id]?.getBoundingClientRect().bottom + window.scrollY + 4 || 0,
                                 right: window.innerWidth - (dropdownRefs.current[card.id]?.getBoundingClientRect().right || 0)
                               }}>
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  handleViewDetails(card);
                                  setShowDropdown(prev => ({ ...prev, [card.id]: false }));
                                }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalles
                              </button>
                              <button
                                onClick={() => handleEditClick(card)}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <PencilSquare className="w-4 h-4 mr-2" />
                                Editar
                              </button>
                              <hr className="my-1" />
                              <button
                                onClick={() => handleDeleteClick(card)}
                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                              >
                                <Trash className="w-4 h-4 mr-2" />
                                Eliminar
                              </button>
                            </div>
                          </div>
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

      <div className="mt-6 bg-ui-bg-subtle rounded-md p-4">
        <p className="text-ui-fg-muted text-sm">
          Mostrando {filteredGiftCards.length} de {giftCards.length} gift cards
        </p>
      </div>

      {/* Create Gift Card Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-ui-bg-overlay" onClick={() => setShowCreateModal(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-ui-bg-base rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-ui-border-base">
              <form onSubmit={handleCreateGiftCard}>
                <div className="bg-ui-bg-base px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg leading-6 font-medium text-ui-fg-base">
                          Nueva Gift Card
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowCreateModal(false)}
                          className="text-ui-fg-muted hover:text-ui-fg-base"
                        >
                          <XMark className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-sm text-ui-fg-muted mb-6">
                        Crear una nueva tarjeta de regalo para el sistema. El código se generará automáticamente.
                      </p>

                      {createError && (
                        <div className="mb-4 p-3 rounded-md bg-ui-bg-error border border-ui-border-error">
                          <div className="flex">
                            <ExclamationCircleSolid className="w-5 h-5 text-ui-fg-error mr-2" />
                            <span className="text-sm text-ui-fg-error">{createError}</span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="initial_value" className="block text-sm font-medium text-ui-fg-base">
                              Valor Inicial (S/)*
                            </label>
                            <input
                              id="initial_value"
                              type="number"
                              step="0.01"
                              min="0.01"
                              placeholder="100.00"
                              value={createForm.initial_value}
                              onChange={(e) => setCreateForm(prev => ({ ...prev, initial_value: e.target.value }))}
                              required
                              className="mt-1 block w-full px-3 py-2 border border-ui-border-base rounded-md shadow-sm focus:outline-none focus:ring-ui-border-interactive focus:border-ui-border-interactive sm:text-sm bg-ui-bg-field text-ui-fg-base"
                            />
                          </div>
                          <div>
                            <label htmlFor="expires_at" className="block text-sm font-medium text-ui-fg-base">
                              Fecha de Expiración
                            </label>
                            <input
                              id="expires_at"
                              type="date"
                              value={createForm.expires_at}
                              onChange={(e) => setCreateForm(prev => ({ ...prev, expires_at: e.target.value }))}
                              className="mt-1 block w-full px-3 py-2 border border-ui-border-base rounded-md shadow-sm focus:outline-none focus:ring-ui-border-interactive focus:border-ui-border-interactive sm:text-sm bg-ui-bg-field text-ui-fg-base"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="recipient_name" className="block text-sm font-medium text-ui-fg-base">
                              Nombre del Destinatario
                            </label>
                            <input
                              id="recipient_name"
                              type="text"
                              placeholder="Juan Pérez"
                              value={createForm.recipient_name}
                              onChange={(e) => setCreateForm(prev => ({ ...prev, recipient_name: e.target.value }))}
                              className="mt-1 block w-full px-3 py-2 border border-ui-border-base rounded-md shadow-sm focus:outline-none focus:ring-ui-border-interactive focus:border-ui-border-interactive sm:text-sm bg-ui-bg-field text-ui-fg-base"
                            />
                          </div>
                          <div>
                            <label htmlFor="recipient_email" className="block text-sm font-medium text-ui-fg-base">
                              Email del Destinatario
                            </label>
                            <input
                              id="recipient_email"
                              type="email"
                              placeholder="juan@example.com"
                              value={createForm.recipient_email}
                              onChange={(e) => setCreateForm(prev => ({ ...prev, recipient_email: e.target.value }))}
                              className="mt-1 block w-full px-3 py-2 border border-ui-border-base rounded-md shadow-sm focus:outline-none focus:ring-ui-border-interactive focus:border-ui-border-interactive sm:text-sm bg-ui-bg-field text-ui-fg-base"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="sender_name" className="block text-sm font-medium text-ui-fg-base">
                            Nombre del Remitente
                          </label>
                          <input
                            id="sender_name"
                            type="text"
                            placeholder="María García"
                            value={createForm.sender_name}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, sender_name: e.target.value }))}
                            className="mt-1 block w-full px-3 py-2 border border-ui-border-base rounded-md shadow-sm focus:outline-none focus:ring-ui-border-interactive focus:border-ui-border-interactive sm:text-sm bg-ui-bg-field text-ui-fg-base"
                          />
                        </div>

                        <div>
                          <label htmlFor="message" className="block text-sm font-medium text-ui-fg-base">
                            Mensaje Personal
                          </label>
                          <textarea
                            id="message"
                            rows={3}
                            placeholder="¡Feliz cumpleaños! Disfruta esta gift card."
                            value={createForm.message}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, message: e.target.value }))}
                            className="mt-1 block w-full px-3 py-2 border border-ui-border-base rounded-md shadow-sm focus:outline-none focus:ring-ui-border-interactive focus:border-ui-border-interactive sm:text-sm bg-ui-bg-field text-ui-fg-base"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-ui-bg-subtle px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-ui-button-primary text-base font-medium text-ui-fg-on-color hover:bg-ui-button-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ui-border-interactive sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? (
                      <>
                        <ArrowPath className="w-4 h-4 animate-spin mr-2" />
                        Creando...
                      </>
                    ) : (
                      'Crear Gift Card'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    disabled={isCreating}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-ui-border-base shadow-sm px-4 py-2 bg-ui-bg-base text-base font-medium text-ui-fg-base hover:bg-ui-bg-subtle focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ui-border-interactive sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingGiftCard && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-ui-bg-overlay" onClick={handleDeleteCancel}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-ui-bg-base rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-ui-border-base">
              <div className="bg-ui-bg-base px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-ui-tag-red-bg sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationCircleSolid className="h-6 w-6 text-ui-tag-red-text" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-ui-fg-base" id="modal-title">
                      Eliminar Gift Card
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-ui-fg-muted">
                        ¿Estás seguro de que quieres eliminar la gift card <strong className="text-ui-fg-base">{deletingGiftCard.code}</strong>?
                        Esta acción no se puede deshacer.
                      </p>
                      {deletingGiftCard.balance > 0 && (
                        <div className="mt-3 p-3 rounded-md bg-ui-tag-orange-bg border border-ui-tag-orange-border">
                          <div className="flex">
                            <ExclamationCircleSolid className="w-5 h-5 text-ui-tag-orange-icon mr-2" />
                            <div>
                              <p className="text-sm text-ui-tag-orange-text font-medium">Advertencia</p>
                              <p className="text-sm text-ui-tag-orange-text">
                                Esta gift card tiene un balance de {formatCurrency(deletingGiftCard.balance)}.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-ui-bg-subtle px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteConfirm}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-ui-button-danger text-base font-medium text-ui-button-danger-text hover:bg-ui-button-danger-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ui-button-danger sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <ArrowPath className="w-4 h-4 animate-spin mr-2" />
                      Eliminando...
                    </>
                  ) : (
                    'Eliminar Gift Card'
                  )}
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteCancel}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-ui-border-base shadow-sm px-4 py-2 bg-ui-bg-base text-base font-medium text-ui-fg-base hover:bg-ui-bg-subtle focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ui-border-interactive sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const config = defineRouteConfig({
  label: "Gestión",
});

export default GiftCardsManagementPage;
