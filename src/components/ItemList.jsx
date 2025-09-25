import { useState } from 'react';
import PropTypes from 'prop-types';

const ItemList = ({ items, addItem, removeItem, people }) => {
  const [newItem, setNewItem] = useState({ name: '', price: '', assignedTo: [] });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newItem.name.trim() && newItem.price && newItem.assignedTo.length > 0) {
      addItem({
        name: newItem.name.trim(),
        price: parseFloat(newItem.price),
        assignedTo: [...newItem.assignedTo]
      });
      setNewItem({ name: '', price: '', assignedTo: [] });
    }
  };

  const handlePersonToggle = (personId) => {
    setNewItem(prev => {
      const assignedTo = prev.assignedTo.includes(personId)
        ? prev.assignedTo.filter(id => id !== personId)
        : [...prev.assignedTo, personId];
      
      return { ...prev, assignedTo };
    });
  };

  return (
    <div className="item-list">
      <h2>Items</h2>
      <form onSubmit={handleSubmit} className="add-item-form">
        <div className="form-row">
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            placeholder="Item name"
            className="item-input"
          />
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            placeholder="Price"
            className="price-input"
            min="0"
            step="0.01"
          />
        </div>
        
        <div className="assign-people">
          <p>Assign to:</p>
          <div className="people-checkboxes">
            {people.map((person) => (
              <label key={person.id} className="person-checkbox">
                <input
                  type="checkbox"
                  checked={newItem.assignedTo.includes(person.id)}
                  onChange={() => handlePersonToggle(person.id)}
                />
                {person.name}
              </label>
            ))}
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={!newItem.name.trim() || !newItem.price || newItem.assignedTo.length === 0} 
          className="add-btn"
        >
          Add Item
        </button>
      </form>
      
      <div className="items-container">
        {items.length > 0 ? (
          <ul className="items">
            {items.map((item) => (
              <li key={item.id} className="item-entry">
                <div className="item-details">
                  <span className="item-name">{item.name}</span>
                  <span className="item-price">${item.price.toFixed(2)}</span>
                </div>
                <div className="item-people">
                  <small>
                    Shared by: {item.assignedTo.map(id => {
                      const person = people.find(p => p.id === id);
                      return person ? person.name : '';
                    }).filter(Boolean).join(', ')}
                  </small>
                </div>
                <button 
                  onClick={() => removeItem(item.id)} 
                  className="remove-btn"
                  aria-label={`Remove ${item.name}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-items">No items added yet</p>
        )}
      </div>
    </div>
  );
};

ItemList.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      assignedTo: PropTypes.arrayOf(PropTypes.string).isRequired
    })
  ).isRequired,
  addItem: PropTypes.func.isRequired,
  removeItem: PropTypes.func.isRequired,
  people: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired
};

export default ItemList;
