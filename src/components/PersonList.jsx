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
      {people.length > 0 ? (
        <ul className="person-list">
          {people.map((person) => (
            <li
              key={person.id}
              className={`person-item${person.id === activePerson ? ' active' : ''}`}
              tabIndex={0}
              onClick={() => handlePersonClick(person.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handlePersonClick(person.id);
              }}
              aria-current={person.id === activePerson ? 'true' : undefined}
            >
              <span className="person-name">{person.name}</span>
              <button
                className="btn-icon remove"
                aria-label={`Remove ${person.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  removePerson(person.id);
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
