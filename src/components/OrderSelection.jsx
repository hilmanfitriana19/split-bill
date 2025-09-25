import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

const OrderSelection = ({ people, menuItems, orders, addOrder, removeOrder, activePerson }) => {
  const [selectedPerson, setSelectedPerson] = useState(activePerson || '');
  const [selectedItems, setSelectedItems] = useState([]);

  // Update selectedPerson when activePerson changes
  useEffect(() => {
    if (activePerson) {
      setSelectedPerson(activePerson);
    }
  }, [activePerson]);

  // Format currency in IDR
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedPerson && selectedItems.length > 0) {
      // Add a new order
      addOrder({
        id: uuidv4(),
        personId: selectedPerson,
        items: [...selectedItems]
      });
      
      // Reset selected items but keep the same person selected
      setSelectedItems([]);
    }
  };

  const handleItemToggle = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // Group orders by person
  const ordersByPerson = {};
  orders.forEach(order => {
    if (!ordersByPerson[order.personId]) {
      ordersByPerson[order.personId] = [];
    }
    ordersByPerson[order.personId].push(order);
  });
  
  // Get active person's name
  const activePerson_name = selectedPerson ? 
    people.find(p => p.id === selectedPerson)?.name || 'Selected Person' : '';

  return (
    <div>
      <h2>Orders</h2>
      
      {people.length === 0 ? (
        <div className="message info">
          <p>Please add people first</p>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="order-form">
            <div className="form-group">
              <label htmlFor="person-select">Person</label>
              <select
                id="person-select"
                value={selectedPerson}
                onChange={(e) => setSelectedPerson(e.target.value)}
                required
              >
                <option value="">Select a person</option>
                {people.map(person => (
                  <option key={person.id} value={person.id}>{person.name}</option>
                ))}
              </select>
            </div>
            
            {selectedPerson && (
              <div className="order-selection">
                <label>Select items ordered by {activePerson_name}:</label>
                <div className="menu-item-grid">
                  {menuItems.map((item) => (
                    <div key={item.id} className="menu-item-card">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleItemToggle(item.id)}
                        />
                        <span className="item-name">{item.name}</span>
                        <span className="item-price">{formatCurrency(item.price)}</span>
                      </label>
                    </div>
                  ))}
                </div>
                
                <button 
                  type="submit"
                  className="btn primary"
                  disabled={selectedItems.length === 0}
                >
                  + Add to Order
                </button>
              </div>
            )}
          </form>
          
          <hr className="divider" />
          
          <h3>Current Orders</h3>
          <div className="order-vertical-list">
            {people.map(person => (
              <div key={person.id} className="order-person-block">
                <div className="order-person-header">
                  <span className="order-person-name">{person.name}</span>
                  {ordersByPerson[person.id]?.length > 0 && (
                    <span className="badge">{ordersByPerson[person.id].length}</span>
                  )}
                </div>
                {ordersByPerson[person.id] && ordersByPerson[person.id].length > 0 ? (
                  <ul className="order-list">
                    {ordersByPerson[person.id].map(order => {
                      const totalPrice = order.items.reduce((total, itemId) => {
                        const menuItem = menuItems.find(item => item.id === itemId);
                        return menuItem ? total + menuItem.price : total;
                      }, 0);
                      return (
                        <li key={order.id} className="order-item">
                          <div className="order-details">
                            <p className="order-items">
                              {order.items.map(itemId => {
                                const menuItem = menuItems.find(item => item.id === itemId);
                                return menuItem ? menuItem.name : '';
                              }).filter(Boolean).join(', ')}
                            </p>
                            <p className="order-price">{formatCurrency(totalPrice)}</p>
                          </div>
                          <button 
                            onClick={() => removeOrder(order.id)}
                            className="btn-icon remove"
                            aria-label="Remove order"
                          >
                            ×
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="message info">
                    <p>No orders yet for {person.name}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

OrderSelection.propTypes = {
  people: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired
    })
  ).isRequired,
  orders: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      personId: PropTypes.string.isRequired,
      items: PropTypes.arrayOf(PropTypes.string).isRequired
    })
  ).isRequired,
  addOrder: PropTypes.func.isRequired,
  removeOrder: PropTypes.func.isRequired,
  activePerson: PropTypes.string
};

export default OrderSelection;
