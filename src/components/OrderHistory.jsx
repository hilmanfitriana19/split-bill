import { useState } from 'react';
import PropTypes from 'prop-types';

const OrderHistory = ({ orderHistory, loadHistoryOrder, deleteHistoryOrder }) => {
  const [expandedOrder, setExpandedOrder] = useState(null);

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

  if (orderHistory.length === 0) {
    return (
      <div className="card">
        <h2>Order History</h2>
        <p className="empty-message">No saved orders yet</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Order History</h2>
      <div className="history-list">
        {orderHistory.map((historyOrder) => (
          <div key={historyOrder.id} className="history-item">
            <div className="history-header" onClick={() => handleToggleExpand(historyOrder.id)}>
              <div className="history-info">
                <h4 className="history-name">{historyOrder.name}</h4>
                <div className="history-meta">
                  <span className="history-date">Saved: {formatDate(historyOrder.savedAt)}</span>
                  <span className="history-restaurant">
                    {historyOrder.restaurantName || 'All Restaurants'}
                  </span>
                  <span className="history-total">{formatCurrency(historyOrder.totalBill)}</span>
                </div>
              </div>
              <div className="history-actions">
                <button
                  className="btn primary small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadOrder(historyOrder);
                  }}
                >
                  Load
                </button>
                <button
                  className="btn danger small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteOrder(historyOrder.id, historyOrder.name);
                  }}
                >
                  Delete
                </button>
                <button className="btn-icon">
                  {expandedOrder === historyOrder.id ? '▼' : '▶'}
                </button>
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
  deleteHistoryOrder: PropTypes.func.isRequired
};

export default OrderHistory;