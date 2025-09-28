import { useState } from 'react';
import PropTypes from 'prop-types';

const PersonList = ({ people, addPerson, removePerson, activePerson, setActivePerson }) => {
  const [newName, setNewName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newName.trim()) {
      addPerson(newName.trim());
      setNewName('');
    }
  };

  const handlePersonClick = (personId) => {
    setActivePerson(personId === activePerson ? null : personId);
  };
  
  return (
    <div className="people-section card">
      {/* No inner People heading for clarity */}
      <form onSubmit={handleSubmit} className="add-form">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Enter name"
          className="input"
          aria-label="Person name"
        />
        <button
          type="submit"
          className="btn primary"
          aria-label="Add person"
          disabled={!newName.trim()}
        >
          +
        </button>
      </form>
      {people.filter(person => person.name?.trim()).length > 0 ? (
        <ul className="person-list">
  {people
    .filter(person => person.name?.trim())
    .map((person) => (
      <li
        key={person.id}
        className={`person-item${person.id === activePerson ? ' active' : ''}`}
        onClick={() => handlePersonClick(person.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          padding: '0.5rem 0.75rem',
          borderBottom: '1px solid #e5e7eb',
          cursor: 'pointer',
        }}
      >
        <span
          className="person-name"
          style={{
            flex: 1,                       // ambil semua ruang tersisa
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '1rem',
            fontWeight: 500,
            color: '#111827',
          }}
        >
          {person.name || 'No Name'}
        </span>
        <button
          type="button"
          aria-label={`Remove ${person.name}`}
          onClick={(e) => {
            e.stopPropagation();
            removePerson(person.id);
          }}
          style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '0.875rem',
            fontWeight: 600,
            width: '1.75rem',
            height: '1.75rem',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,      // tombol tidak mengecilkan nama
          }}
        >
          ×
        </button>
      </li>
    ))}
</ul>

      ) : (
        <p className="empty-message">No people added yet</p>
      )}
    </div>
  );
};

PersonList.propTypes = {
  people: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  addPerson: PropTypes.func.isRequired,
  removePerson: PropTypes.func.isRequired,
  activePerson: PropTypes.string,
  setActivePerson: PropTypes.func.isRequired
};

export default PersonList;
