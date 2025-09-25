import { useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';

const MenuManager = ({ menuItems, addMenuItem, removeMenuItem }) => {
  const [newItem, setNewItem] = useState({ name: '', price: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newItem.name.trim() && newItem.price) {
      addMenuItem({
        id: uuidv4(),
        name: newItem.name.trim(),
        price: parseFloat(newItem.price)
      });
      setNewItem({ name: '', price: '' });
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
      
      <form onSubmit={handleSubmit}>
        <div style={{ 
          display: 'flex',
          gap: '1rem',
          marginBottom: '1rem',
          alignItems: 'flex-end'
        }}>
          <div style={{ flex: 2 }}>
            <label htmlFor="item-name" style={{ 
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'block',
              marginBottom: '0.25rem'
            }}>Item Name</label>
            <input
              id="item-name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="Enter item name"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem'
              }}
            />
          </div>
          
          <div style={{ flex: 1 }}>
            <label htmlFor="item-price" style={{ 
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'block',
              marginBottom: '0.25rem'
            }}>Price (Rp)</label>
            <input
              id="item-price"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value.replace(/[^0-9]/g, '') })}
              placeholder="Enter price"
              className="input"
              aria-label="Price"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem'
              }}
            />
          </div>
          
          <button
            type="submit"
            aria-label="Add menu item"
            disabled={!newItem.name.trim() || !newItem.price}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: !newItem.name.trim() || !newItem.price ? '#CBD5E0' : '#3182CE',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: !newItem.name.trim() || !newItem.price ? 'not-allowed' : 'pointer'
            }}
          >
            +
          </button>
        </div>
      </form>
      
      {menuItems.length > 0 ? (
        <div style={{
          marginTop: '1rem',
          border: '1px solid #e2e8f0',
          borderRadius: '0.375rem',
          overflow: 'hidden'
        }}>
          <div style={{ 
            display: 'flex',
            padding: '0.75rem',
            fontWeight: '500',
            backgroundColor: '#F7FAFC',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div style={{ flex: 2 }}>Item</div>
            <div style={{ flex: 1, textAlign: 'right' }}>Price</div>
            <div style={{ width: '50px' }}></div>
          </div>
          
          {menuItems.map((item, index) => (
            <div 
              key={item.id} 
              style={{
                display: 'flex',
                padding: '0.75rem',
                alignItems: 'center',
                borderBottom: index === menuItems.length - 1 ? 'none' : '1px solid #e2e8f0'
              }}
            >
              <div style={{ flex: 2 }}>{item.name}</div>
              <div style={{ flex: 1, textAlign: 'right' }}>{formatCurrency(item.price)}</div>
              <div style={{ width: '50px', textAlign: 'right' }}>
                <button
                  style={{
                    backgroundColor: 'transparent',
                    color: '#E53E3E',
                    border: 'none',
                    borderRadius: '0.25rem',
                    padding: '0.25rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                  onClick={() => removeMenuItem(item.id)}
                  aria-label={`Remove ${item.name}`}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ 
          color: '#718096', 
          textAlign: 'center',
          marginTop: '1rem'
        }}>
          No menu items added yet
        </p>
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
  removeMenuItem: PropTypes.func.isRequired
};

export default MenuManager;
