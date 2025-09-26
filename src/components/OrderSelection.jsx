import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

const OrderSelection = ({ people, menuItems, orders, addOrder, removeOrder, activePerson, restaurants, selectedRestaurant, setSelectedRestaurant }) => {
  const [selectedPerson, setSelectedPerson] = useState(activePerson || '');
  const [selectedItems, setSelectedItems] = useState([]);

  // Update selectedPerson when activePerson changes
  useEffect(() => {
    if (activePerson) {
      setSelectedPerson(activePerson);
    }
  }, [activePerson]);

  // When restaurant changes, reset orders to only include items from that restaurant
  useEffect(() => {
    if (!selectedRestaurant) return;
    setSelectedItems(prevItems => prevItems.filter(itemId => {
      const menuItem = menuItems.find(item => item.id === itemId);
      return menuItem ? menuItem.restaurantId === selectedRestaurant : false;
    }));
  }, [selectedRestaurant, menuItems]);

  // When restaurant changes, reset selected items (order detail selection)
  useEffect(() => {
    setSelectedItems([]);
  }, [selectedRestaurant]);

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
      {restaurants.length > 0 && (
        <div style={{ marginBottom: '1em' }}>
          <label htmlFor="restaurant-select" style={{ fontWeight: 500, marginRight: 8 }}>Restaurant:</label>
          <select
            id="restaurant-select"
            value={selectedRestaurant}
            onChange={e => setSelectedRestaurant(e.target.value)}
            style={{ padding: '0.3em 0.7em', borderRadius: 6 }}
          >
            {restaurants.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      )}
      {people.length === 0 ? (
        <div className="message info">
          <p>Please add people first</p>
        </div>
      ) : (
        <>
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
                {/* Menu list for this person */}
                <div className="person-menu-list">
                  {menuItems.filter(item => item.restaurantId === selectedRestaurant).length === 0 ? (
                    <div className="message info"><p>No menu items available</p></div>
                  ) : (
                    <ul className="menu-list">
                      {menuItems.filter(item => item.restaurantId === selectedRestaurant).map(item => (
                        <li key={item.id} className="menu-list-item">
                          <button
                            className="btn small add"
                            onClick={() => addOrder({
                              id: uuidv4(),
                              personId: person.id,
                              items: [item.id]
                            })}
                          >
                            <span className="plus-icon">+</span> {item.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {/* Current orders for this person */}
                {ordersByPerson[person.id] && ordersByPerson[person.id].filter(order =>
                  order.items.some(itemId => {
                    const menuItem = menuItems.find(item => item.id === itemId);
                    return menuItem && menuItem.restaurantId === selectedRestaurant;
                  })
                ).length > 0 ? (
                  <ul className="order-list">
                    {ordersByPerson[person.id]
                      .map(order => {
                        // Only show items from the selected restaurant
                        const filteredItems = order.items.filter(itemId => {
                          const menuItem = menuItems.find(item => item.id === itemId);
                          return menuItem && menuItem.restaurantId === selectedRestaurant;
                        });
                        if (filteredItems.length === 0) return null;
                        const totalPrice = filteredItems.reduce((total, itemId) => {
                          const menuItem = menuItems.find(item => item.id === itemId);
                          return menuItem ? total + menuItem.price : total;
                        }, 0);
                        return (
                          <li key={order.id} className="order-item">
                            <div className="order-details">
                              <p className="order-items">
                                {filteredItems.map(itemId => {
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
