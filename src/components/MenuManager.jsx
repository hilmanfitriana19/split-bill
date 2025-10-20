import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

const MenuManager = ({ menuItems, addMenuItem, removeMenuItem, restaurants, addRestaurant, removeRestaurant }) => {
  const [newItem, setNewItem] = useState({ name: '', price: '', restaurantId: '' });
  const [newRestaurant, setNewRestaurant] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingRestaurantName, setPendingRestaurantName] = useState('');

  // State for selected restaurant for menu management
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(restaurants.length > 0 ? restaurants[0].id : '');

  // State for toggling add restaurant form
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);

  // Filter menu items for selected restaurant
  const filteredMenuItems = menuItems
    .filter(item => item.restaurantId === selectedRestaurantId)
    .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Set default restaurantId when restaurants change and newItem.restaurantId is empty
  useEffect(() => {
    if (restaurants.length > 0 && !newItem.restaurantId) {
      setNewItem(item => ({ ...item, restaurantId: restaurants[0].id }));
    }
  }, [restaurants]);

  // When restaurants change, update selectedRestaurantId if needed
  useEffect(() => {
    if (restaurants.length === 0) {
      setSelectedRestaurantId('');
    } else if (!restaurants.find(r => r.id === selectedRestaurantId)) {
      setSelectedRestaurantId(restaurants[0].id);
    }
  }, [restaurants, selectedRestaurantId]);

  // When selected restaurant changes, reset newItem.restaurantId
  useEffect(() => {
    setNewItem(item => ({ ...item, restaurantId: selectedRestaurantId }));
  }, [selectedRestaurantId]);

  // Auto-select newly added restaurant when restaurants array changes
  useEffect(() => {
    if (pendingRestaurantName && restaurants.length > 0) {
      const newRestaurant = restaurants.find(r => r.name === pendingRestaurantName);
      if (newRestaurant) {
        setSelectedRestaurantId(newRestaurant.id);
        // Also update newItem.restaurantId to the new restaurant
        setNewItem(item => ({ ...item, restaurantId: newRestaurant.id }));
        setPendingRestaurantName(''); // Clear the pending name
      }
    }
  }, [restaurants, pendingRestaurantName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newItem.name.trim() && newItem.price && newItem.restaurantId) {
      addMenuItem({
        id: uuidv4(),
        name: newItem.name.trim(),
        price: parseFloat(newItem.price),
        restaurantId: newItem.restaurantId
      });
      // Keep the same restaurantId for the next item instead of resetting to first restaurant
      setNewItem({ name: '', price: '', restaurantId: selectedRestaurantId });
    }
  };

  const handleAddRestaurant = (e) => {
    e.preventDefault();
    if (newRestaurant.trim()) {
      const restaurantName = newRestaurant.trim();
      setPendingRestaurantName(restaurantName); // Set pending restaurant name
      addRestaurant(restaurantName);
      setNewRestaurant('');
      setShowAddRestaurant(false); // Hide the add restaurant form
    }
  };

  // Format currency in IDR
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Only show item form if a restaurant is selected
  const restaurantSelected = restaurants.length > 0 && !!newItem.restaurantId;

  return (
    <div style={{
      padding: '1rem',
      backgroundColor: '#fff',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
    }}>
      <h2 style={{ 
        fontSize: '1.2rem', 
        fontWeight: '600',
        marginBottom: '1rem'
      }}>Menu Items</h2>
      
  {/* Restaurant select for menu item */}
      <div style={{ marginBottom: '1em' }}>
        <div style={{ display: 'flex', gap: '1em', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
          {/* Bagian Label Restaurant */}
          <div style={{ flex: 4 }}>
            <label
              htmlFor="item-restaurant"
              style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                display: 'block',
                marginBottom: '0.25rem'
              }}
            >
              Restaurant
            </label>
          </div>

          {/* Button New Restaurant lebih kecil */}
          <button
            type="button"
            onClick={() => setShowAddRestaurant(v => !v)}
            style={{
              flex: 1,
              background: 'rgba(102,187,106,0.12)',
              color: 'var(--primary)',
              border: '1px solid var(--primary)',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: 500,
              padding: '0.5rem 0.75rem',
              whiteSpace: 'nowrap'
            }}
          >
            {showAddRestaurant ? 'Cancel' : 'New Restaurant'}
          </button>
        </div>

        {/* Restaurant List with Delete Icons */}
        {restaurants.length > 0 && !showAddRestaurant && (
          <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '0.375rem',
            backgroundColor: 'white',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {restaurants.map(restaurant => (
              <div
                key={restaurant.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  borderBottom: '1px solid #f1f5f9',
                  backgroundColor: selectedRestaurantId === restaurant.id ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onClick={() => setSelectedRestaurantId(restaurant.id)}
                onMouseEnter={(e) => {
                  if (selectedRestaurantId !== restaurant.id) {
                    e.target.style.backgroundColor = '#f8fafc';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedRestaurantId !== restaurant.id) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      border: `2px solid ${selectedRestaurantId === restaurant.id ? 'var(--primary, #16a34a)' : '#d1d5db'}`,
                      backgroundColor: selectedRestaurantId === restaurant.id ? 'var(--primary, #16a34a)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {selectedRestaurantId === restaurant.id && (
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: 'white'
                      }} />
                    )}
                  </div>
                  <span style={{
                    fontWeight: selectedRestaurantId === restaurant.id ? 600 : 400,
                    color: selectedRestaurantId === restaurant.id ? 'var(--primary, #16a34a)' : '#374151'
                  }}>
                    {restaurant.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Are you sure you want to delete "${restaurant.name}" restaurant? This will also remove all menu items associated with this restaurant.`)) {
                      removeRestaurant(restaurant.id);
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#dc2626',
                    fontSize: '1.2em',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                  title={`Delete ${restaurant.name}`}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search/filter for menu items */}
      {!showAddRestaurant && (
        <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
          <input
            aria-label="Search menu items"
            placeholder="Search items..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="menu-search"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem' }}
          />
        </div>
      )}

      {/* Add Restaurant (optional, collapsible) */}
      {showAddRestaurant && (
        <form onSubmit={handleAddRestaurant} style={{ marginBottom: '1em', alignItems: 'flex-end' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="restaurant-name" style={{ fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Add Restaurant</label>
            <input
              id="restaurant-name"
              value={newRestaurant}
              onChange={e => setNewRestaurant(e.target.value)}
              placeholder="Enter restaurant name"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem' }}
            />
          </div>
          <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Add</button>
        </form>
      )}
      
      {/* Show message when no restaurants exist */}
      {restaurants.length === 0 && !showAddRestaurant && (
        <div style={{ 
          textAlign: 'center', 
          color: '#6b7280', 
          padding: '2rem 1rem',
          backgroundColor: '#f9fafb',
          borderRadius: '0.5rem',
          border: '2px dashed #d1d5db',
          marginTop: '1rem'
        }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '500' }}>
            🍽️ No restaurants yet
          </p>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            Click "New Restaurant" to add your first restaurant and start adding menu items.
          </p>
        </div>
      )}

      {/* Only show menu item form if a restaurant is selected and not adding restaurant */}
      {selectedRestaurantId && !showAddRestaurant && (
        <form onSubmit={handleSubmit}>
          <div style={{ gap: '1rem', marginBottom: '2rem', alignItems: 'flex-end' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="item-name" style={{ fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Item Name</label>
              <input
                id="item-name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Enter item name"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem' }}
              />
            </div>
            <div style={{ flex: 1, marginBottom: '2rem' }}>
              <label htmlFor="item-price" style={{ fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Price (Rp)</label>
              <input
                id="item-price"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value.replace(/\D/g, '') })}
                placeholder="Enter price"
                className="input"
                aria-label="Price"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem' }}
              />
            </div>
            <button
              type="submit"
              aria-label="Add menu item"
              disabled={!newItem.name.trim() || !newItem.price}
              style={{ padding: '0.5 rem 1rem', backgroundColor: !newItem.name.trim() || !newItem.price ? 'var(--surface-high)' : 'var(--primary)', color: '#fff', border: 'none', borderRadius: '0.375rem', opacity: !newItem.name.trim() || !newItem.price ? 0.4 : 1, cursor: !newItem.name.trim() || !newItem.price ? 'not-allowed' : 'pointer' }}
            >
              +
            </button>
          </div>
        </form>
      )}
      
      {/* Table of menu items for selected restaurant */}
      {!showAddRestaurant && (
        <div className="menu-items-container" style={{ marginTop: '0.5rem' }}>
          {filteredMenuItems.length > 0 ? (
            <div>
              <table className="menu-table" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem' }}>Item</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem 0.75rem' }}>Price</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMenuItems.map(item => {
                    const rest = restaurants.find(r => r.id === item.restaurantId);
                    const restName = rest ? rest.name : '';
                    return (
                      <tr key={item.id} className="menu-table-row">
                        <td style={{ padding: '0.5rem 0.75rem' }}><strong>{item.name}</strong></td>
                        <td style={{ textAlign: 'right', padding: '0.5rem 0.75rem' }}><span className="menu-item-price">{formatCurrency(item.price)}</span></td>
                        <td style={{ textAlign: 'center', padding: '0.5rem 0.75rem' }}>
                          <button type="button" aria-label="Remove item" onClick={() => removeMenuItem(item.id)} style={{ background: 'none', border: 'none', color: '#e53e3e', fontSize: '1.1em', cursor: 'pointer' }}>×</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#a0aec0', padding: '1em' }}>No menu items yet for this restaurant.</div>
          )}
        </div>
      )}
    </div>
  );
};

MenuManager.propTypes = {
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired
    })
  ).isRequired,
  addMenuItem: PropTypes.func.isRequired,
  removeMenuItem: PropTypes.func.isRequired,
  restaurants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  addRestaurant: PropTypes.func.isRequired,
  removeRestaurant: PropTypes.func.isRequired
};

export default MenuManager;
