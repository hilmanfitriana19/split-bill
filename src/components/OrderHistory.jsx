import { useState } from 'react';
import PropTypes from 'prop-types';

const OrderHistory = ({ orderHistory, loadHistoryOrder, deleteHistoryOrder, editHistoryOrder }) => {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', billDate: '' });

  // Format currency in IDR
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return `${dateString.slice(8, 10)}-${dateString.slice(5, 7)}-${dateString.slice(0, 4)}`;
  };

  const handleToggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleLoadOrder = (historyOrder) => {
    if (window.confirm('Loading this order will replace your current data. Continue?')) {
      loadHistoryOrder(historyOrder);
    }
  };

  const handleDeleteOrder = (orderId, orderName) => {
    if (window.confirm(`Are you sure you want to delete "${orderName}"? This action cannot be undone.`)) {
      deleteHistoryOrder(orderId);
    }
  };

  const handleEditOrder = (historyOrder) => {
    setEditingOrder(historyOrder.id);
    setEditForm({
      name: historyOrder.name,
      billDate: historyOrder.billDate
    });
  };

  const handleSaveEdit = () => {
    if (editForm.name.trim()) {
      editHistoryOrder(editingOrder, {
        name: editForm.name.trim(),
        billDate: editForm.billDate
      });
      setEditingOrder(null);
      setEditForm({ name: '', billDate: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
    setEditForm({ name: '', billDate: '' });
  };

  if (orderHistory.length === 0) {
    return (
      <div style={{ 
        padding: '1rem',
        backgroundColor: '#fff',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
      }}>
        <h3 style={{ 
          fontSize: '1.1rem', 
          fontWeight: '600',
          marginBottom: '1rem',
          color: '#0078d4'
        }}>Order History</h3>
        <p className="empty-message" style={{ fontSize: '0.9rem', color: '#666' }}>No saved orders yet</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '1rem',
      backgroundColor: '#fff',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
    }}>
      <h3 style={{ 
        fontSize: '1.1rem', 
        fontWeight: '600',
        marginBottom: '1rem',
        color: '#0078d4'
      }}>Order History</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {orderHistory.map((historyOrder) => (
          <div 
            key={historyOrder.id} 
            style={{ 
              border: '1px solid #e2e8f0', 
              borderRadius: '6px', 
              overflow: 'hidden', 
              background: '#fff',
              fontSize: '0.85rem'
            }}
          >
            <div 
              onClick={() => handleToggleExpand(historyOrder.id)}
              style={{
                padding: '0.75rem',
                cursor: 'pointer',
                borderBottom: expandedOrder === historyOrder.id ? '1px solid #f1f5f9' : 'none',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <div>
                <div style={{ 
                  fontWeight: 600, 
                  fontSize: '0.9rem', 
                  color: '#1e293b',
                  marginBottom: '0.25rem'
                }}>
                  {historyOrder.name}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#64748b',
                  marginBottom: '0.5rem'
                }}>
                  {formatDate(historyOrder.savedAt)} • {historyOrder.restaurantName || 'All'}
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <span style={{ 
                    fontWeight: 600, 
                    color: '#0f766e',
                    fontSize: '0.8rem'
                  }}>
                    {formatCurrency(historyOrder.totalBill)}
                  </span>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLoadOrder(historyOrder);
                      }}
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.75rem',
                        backgroundColor: '#0078d4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Load
                    </button>
                    {/* Edit button removed per request */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteOrder(historyOrder.id, historyOrder.name);
                      }}
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.75rem',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Del
                    </button>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {expandedOrder === historyOrder.id ? '▼' : '▶'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {expandedOrder === historyOrder.id && (
              <div className="history-details">
                <div className="history-summary">
                  <table className="summary-table">
                    <tbody>
                      <tr>
                        <td>Bill Date:</td>
                        <td>{formatDate(historyOrder.billDate)}</td>
                      </tr>
                      <tr>
                        <td>People:</td>
                        <td>{historyOrder.people.length}</td>
                      </tr>
                      <tr>
                        <td>Orders:</td>
                        <td>{historyOrder.orders.length}</td>
                      </tr>
                      <tr>
                        <td>Subtotal:</td>
                        <td className="price-value">{formatCurrency(historyOrder.subtotal)}</td>
                      </tr>
                      {historyOrder.discount > 0 && (
                        <tr>
                          <td>Discount:</td>
                          <td className="price-value">-{formatCurrency(historyOrder.discount)}</td>
                        </tr>
                      )}
                      {historyOrder.tax > 0 && (
                        <tr>
                          <td>Tax ({historyOrder.taxRate}%):</td>
                          <td className="price-value">{formatCurrency(historyOrder.tax)}</td>
                        </tr>
                      )}
                      {historyOrder.shippingCost > 0 && (
                        <tr>
                          <td>Shipping:</td>
                          <td className="price-value">{formatCurrency(historyOrder.shippingCost)}</td>
                        </tr>
                      )}
                      {historyOrder.otherCost > 0 && (
                        <tr>
                          <td>Other Costs:</td>
                          <td className="price-value">{formatCurrency(historyOrder.otherCost)}</td>
                        </tr>
                      )}
                      <tr className="history-total-row">
                        <td><strong>Total:</strong></td>
                        <td className="price-value"><strong>{formatCurrency(historyOrder.totalBill)}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="history-people">
                  <h5>People & Orders:</h5>
                  {historyOrder.people.map((person) => {
                    const personOrders = historyOrder.orders.filter(order => order.personId === person.id);
                    const personTotal = historyOrder.finalAmounts[person.id] || 0;
                    
                    return (
                      <div key={person.id} className="history-person">
                        <div className="person-info">
                          <span className="person-name">{person.name}</span>
                          <span className="person-total">{formatCurrency(personTotal)}</span>
                        </div>
                        {personOrders.length > 0 && (
                          <div className="person-orders">
                            {personOrders.map((order) => (
                              <div key={order.id} className="history-order-items">
                                {order.items.map((itemId) => {
                                  const menuItem = historyOrder.menuItems.find(item => item.id === itemId);
                                  return menuItem ? (
                                    <span key={itemId} className="history-order-item">
                                      {menuItem.name} ({formatCurrency(menuItem.price)})
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Edit Modal */}
      {editingOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            width: '300px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>Edit Order</h4>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151'
              }}>
                Order Name:
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter order name"
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151'
              }}>
                Bill Date:
              </label>
              <input
                type="date"
                value={editForm.billDate}
                onChange={(e) => setEditForm({ ...editForm, billDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCancelEdit}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#0078d4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  opacity: !editForm.name.trim() ? 0.5 : 1
                }}
                disabled={!editForm.name.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

OrderHistory.propTypes = {
  orderHistory: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      savedAt: PropTypes.string.isRequired,
      billDate: PropTypes.string.isRequired,
      people: PropTypes.array.isRequired,
      menuItems: PropTypes.array.isRequired,
      orders: PropTypes.array.isRequired,
      restaurants: PropTypes.array.isRequired,
      selectedRestaurant: PropTypes.string,
      restaurantName: PropTypes.string,
      subtotal: PropTypes.number.isRequired,
      discount: PropTypes.number.isRequired,
      tax: PropTypes.number.isRequired,
      taxRate: PropTypes.number.isRequired,
      shippingCost: PropTypes.number.isRequired,
      otherCost: PropTypes.number.isRequired,
      totalBill: PropTypes.number.isRequired,
      finalAmounts: PropTypes.object.isRequired
    })
  ).isRequired,
  loadHistoryOrder: PropTypes.func.isRequired,
  deleteHistoryOrder: PropTypes.func.isRequired,
  editHistoryOrder: PropTypes.func.isRequired
};

export default OrderHistory;