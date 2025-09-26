import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

const MenuManager = ({ menuItems, addMenuItem, removeMenuItem, restaurants, addRestaurant, removeRestaurant }) => {
  const [newItem, setNewItem] = useState({ name: '', price: '', restaurantId: '' });
  const [newRestaurant, setNewRestaurant] = useState('');

  // State for selected restaurant for menu management
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(restaurants.length > 0 ? restaurants[0].id : '');

  // State for toggling add restaurant form
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);

  // Filter menu items for selected restaurant
  const filteredMenuItems = menuItems.filter(item => item.restaurantId === selectedRestaurantId);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newItem.name.trim() && newItem.price && newItem.restaurantId) {
      addMenuItem({
        id: uuidv4(),
        name: newItem.name.trim(),
        price: parseFloat(newItem.price),
        restaurantId: newItem.restaurantId
      });
      setNewItem({ name: '', price: '', restaurantId: restaurants[0]?.id || '' });
    }
  };

  const handleAddRestaurant = (e) => {
    e.preventDefault();
    if (newRestaurant.trim()) {
      addRestaurant(newRestaurant.trim());
      setNewRestaurant('');
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
      <div style={{ marginBottom: '1em', display: 'flex', gap: '1em', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="item-restaurant" style={{ fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Restaurant</label>
          <select
            id="item-restaurant"
            value={selectedRestaurantId}
            onChange={e => setSelectedRestaurantId(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem' }}
            required
          >
            {restaurants.length === 0 && <option value="" disabled>No restaurant</option>}
            {restaurants.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setShowAddRestaurant(v => !v)}
          style={{ padding: '0.5rem 1rem', background: '#EDF2F7', color: '#3182CE', border: '1px solid #3182CE', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 500 }}
        >
          {showAddRestaurant ? 'Cancel' : 'Add Restaurant'}
        </button>
      </div>

      {/* Add Restaurant (optional, collapsible) */}
      {showAddRestaurant && (
        <form onSubmit={handleAddRestaurant} style={{ marginBottom: '1em', display: 'flex', gap: '0.5em', alignItems: 'flex-end' }}>
          <div style={{ flex: 2 }}>
            <label htmlFor="restaurant-name" style={{ fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Add Restaurant</label>
            <input
              id="restaurant-name"
              value={newRestaurant}
              onChange={e => setNewRestaurant(e.target.value)}
              placeholder="Enter restaurant name"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem' }}
            />
          </div>
          <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#3182CE', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Add</button>
        </form>
      )}

      {/* Only show menu item form if a restaurant is selected */}
      {selectedRestaurantId && (
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 2 }}>
              <label htmlFor="item-name" style={{ fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>Item Name</label>
              <input
                id="item-name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Enter item name"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem' }}
              />
            </div>
            <div style={{ flex: 1 }}>
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
              style={{ padding: '0.5rem 1rem', backgroundColor: !newItem.name.trim() || !newItem.price ? '#CBD5E0' : '#3182CE', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: !newItem.name.trim() || !newItem.price ? 'not-allowed' : 'pointer' }}
            >
              +
            </button>
          </div>
        </form>
      )}
      
      {/* Table of menu items for selected restaurant */}
      <div style={{ background: '#fff', borderRadius: '0.5rem', border: '1px solid #e2e8f0', marginTop: '1em', padding: '1em 0.5em' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.5em 1em' }}>Item</th>
              <th style={{ textAlign: 'right', padding: '0.5em 1em' }}>Price</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredMenuItems.map((item, idx) => (
              <tr key={item.id}>
                <td style={{ padding: '0.5em 1em' }}>{item.name}</td>
                <td style={{ textAlign: 'right', padding: '0.5em 1em' }}>{formatCurrency(item.price)}</td>
                <td style={{ textAlign: 'center' }}>
                  <button type="button" aria-label="Remove item" onClick={() => removeMenuItem(item.id)} style={{ background: 'none', border: 'none', color: '#e53e3e', fontSize: '1.25em', cursor: 'pointer' }}>×</button>
                </td>
              </tr>
            ))}
            {filteredMenuItems.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', color: '#a0aec0', padding: '1em' }}>No menu items yet for this restaurant.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
  removeMenuItem: PropTypes.func.isRequired
};

export default MenuManager;
