import PropTypes from 'prop-types';
import { useState } from 'react';

const DataControl = ({ people, items, setPeople, setItems }) => {
  const [importError, setImportError] = useState('');

  // Function to export data as a JSON file
  const exportData = () => {
    const data = {
      people,
      items,
      exportDate: new Date().toISOString()
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(data, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link and trigger click
    const link = document.createElement('a');
    link.href = url;
    link.download = `split-bill-export-${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Function to handle file import
  const handleImport = (event) => {
    setImportError('');
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // Validate the data structure
        if (!importedData.people || !importedData.items ||
            !Array.isArray(importedData.people) || !Array.isArray(importedData.items)) {
          throw new Error('Invalid data format');
        }
        
        // Update state with imported data
        setPeople(importedData.people);
        setItems(importedData.items);
        
        // Clear the input
        event.target.value = null;
      } catch (error) {
        console.error('Error importing data:', error);
        setImportError('Invalid data format. Please select a valid export file.');
        
        // Clear the input
        event.target.value = null;
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="data-control">
      <h3>Data Management</h3>
      
      <div className="data-actions">
        <button onClick={exportData} className="export-btn" disabled={people.length === 0 && items.length === 0}>
          Export Data
        </button>
        
        <div className="import-container">
          <button className="import-label" onClick={() => document.getElementById('import-data').click()}>
            Import Data
          </button>
          <input 
            id="import-data"
            type="file" 
            accept=".json" 
            onChange={handleImport} 
            className="import-input"
            style={{ display: 'none' }}
          />
        </div>
      </div>
      
      {importError && <p className="import-error">{importError}</p>}
    </div>
  );
};

DataControl.propTypes = {
  people: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      assignedTo: PropTypes.arrayOf(PropTypes.string).isRequired
    })
  ).isRequired,
  setPeople: PropTypes.func.isRequired,
  setItems: PropTypes.func.isRequired
};

export default DataControl;
