import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import './App.css'
import PersonList from './components/PersonList'
import MenuManager from './components/MenuManager'
import OrderSelection from './components/OrderSelection'
import AdditionalCosts from './components/AdditionalCosts'
import Summary from './components/Summary'
import Discount from './components/Discount'
import Tax from './components/Tax'

function App() {
  // Initialize state from localStorage if available, otherwise empty arrays
  const [people, setPeople] = useState(() => {
    const savedPeople = localStorage.getItem('splitBillPeople');
    return savedPeople ? JSON.parse(savedPeople) : [];
  });
  
    // Restaurant management
  const [restaurants, setRestaurants] = useState(() => {
    const saved = localStorage.getItem('splitBillRestaurants');
    return saved ? JSON.parse(saved) : [];
  });

  const [menuItems, setMenuItems] = useState(() => {
    const savedMenuItems = localStorage.getItem('splitBillMenuItems');
    return savedMenuItems ? JSON.parse(savedMenuItems) : [];
  });
  
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem('splitBillOrders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });
  
  // State for shipping cost, tax, discount, other cost, and tax method
  const [taxMethod, setTaxMethod] = useState(() => {
    const saved = localStorage.getItem('splitBillTaxMethod');
    return saved || 'before';
  });
  const [shippingCost, setShippingCost] = useState(() => {
    const savedShipping = localStorage.getItem('splitBillShipping');
    return savedShipping ? parseFloat(savedShipping) : 0;
  });
  
  const [tax, setTax] = useState(() => {
    const savedTax = localStorage.getItem('splitBillTax');
    return savedTax ? parseFloat(savedTax) : 0;
  });
  
  const [discount, setDiscount] = useState(() => {
    const savedDiscount = localStorage.getItem('splitBillDiscount');
    return savedDiscount ? parseFloat(savedDiscount) : 0;
  });
  
  const [otherCost, setOtherCost] = useState(() => {
    const savedOther = localStorage.getItem('splitBillOtherCost');
    return savedOther ? parseFloat(savedOther) : 0;
  });

  // State for active person (single selection)
  const [activePerson, setActivePerson] = useState(null);

  // State for excluding people with no orders
  const [excludeNoOrder, setExcludeNoOrder] = useState(true);
  
  // Date state for custom bill date
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  };
  const [billDate, setBillDate] = useState(getTodayString());

  // State for selected restaurant (global)
  const [selectedRestaurant, setSelectedRestaurant] = useState(restaurants[0]?.id || '');

  // Helper function to show save notification
  const showSaveIndicator = () => {
    // Simple console log for now - we'll implement a custom notification later
    console.log('Data saved to local storage');
  };

  // Save to localStorage whenever state changes

  useEffect(() => {
    localStorage.setItem('splitBillRestaurants', JSON.stringify(restaurants));
  }, [restaurants]);

  useEffect(() => {
    localStorage.setItem('splitBillPeople', JSON.stringify(people));
    if (people.length > 0) {
      showSaveIndicator();
    }
  }, [people]);

  useEffect(() => {
    localStorage.setItem('splitBillMenuItems', JSON.stringify(menuItems));
    if (menuItems.length > 0) {
      showSaveIndicator();
    }
  }, [menuItems]);
  
  useEffect(() => {
    localStorage.setItem('splitBillOrders', JSON.stringify(orders));
    if (orders.length > 0) {
      showSaveIndicator();
    }
  }, [orders]);
  
  useEffect(() => {
    localStorage.setItem('splitBillShipping', shippingCost.toString());
    showSaveIndicator();
  }, [shippingCost]);
  
  useEffect(() => {
    localStorage.setItem('splitBillTax', tax.toString());
    showSaveIndicator();
  }, [tax]);
  useEffect(() => {
    localStorage.setItem('splitBillTaxMethod', taxMethod);
    showSaveIndicator();
  }, [taxMethod]);
  
  useEffect(() => {
    localStorage.setItem('splitBillDiscount', discount.toString());
    showSaveIndicator();
  }, [discount]);
  
  useEffect(() => {
    localStorage.setItem('splitBillOtherCost', otherCost.toString());
    showSaveIndicator();
  }, [otherCost]);

  // Person management
  const addPerson = (name) => {
    setPeople([...people, { id: uuidv4(), name }]);
  };

  const removePerson = (id) => {
    // Remove person
    setPeople(people.filter(person => person.id !== id));
    
    // Remove orders associated with this person
    setOrders(orders.filter(order => order.personId !== id));
  };

  // Menu item management
  const addMenuItem = (item) => {
    setMenuItems([...menuItems, item]);
  };

  const removeMenuItem = (id) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
    
    // Also remove this item from any orders
    setOrders(orders.map(order => ({
      ...order,
      items: order.items.filter(itemId => itemId !== id)
    })).filter(order => order.items.length > 0)); // Remove orders with no items
  };

  // Order management
  const addOrder = (order) => {
    setOrders([...orders, order]);
  };

  const removeOrder = (id) => {
    setOrders(orders.filter(order => order.id !== id));
  };

  // Restaurant management
  const addRestaurant = (name) => {
    setRestaurants([...restaurants, { id: uuidv4(), name }]);
  };

  const removeRestaurant = (id) => {
    setRestaurants(restaurants.filter(r => r.id !== id));
  };

  // Clear all data
  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setPeople([]);
      setMenuItems([]);
      setOrders([]);
      setShippingCost(0);
      setTax(0);
      setDiscount(0);
      setOtherCost(0);
      localStorage.removeItem('splitBillPeople');
      localStorage.removeItem('splitBillMenuItems');
      localStorage.removeItem('splitBillOrders');
      localStorage.removeItem('splitBillShipping');
      localStorage.removeItem('splitBillTax');
      localStorage.removeItem('splitBillDiscount');
      localStorage.removeItem('splitBillOtherCost');
    }
  };

  // Handle export data
  const exportData = () => {
    const data = {
      people,
      menuItems,
      orders,
      shippingCost,
      tax,
      discount,
      otherCost,
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
  
  // Handle import data
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // Validate the data structure
        if (!importedData.people || !importedData.menuItems || !importedData.orders ||
            !Array.isArray(importedData.people) || !Array.isArray(importedData.menuItems) ||
            !Array.isArray(importedData.orders)) {
          throw new Error('Invalid data format');
        }
        
        // Update state with imported data
        setPeople(importedData.people);
        setMenuItems(importedData.menuItems);
        setOrders(importedData.orders);
        
        // Import shipping cost, tax, discount, and other cost if present
        if (importedData.shippingCost !== undefined) {
          setShippingCost(parseFloat(importedData.shippingCost));
        }
        
        if (importedData.tax !== undefined) {
          setTax(parseFloat(importedData.tax));
        }
        
        if (importedData.discount !== undefined) {
          setDiscount(parseFloat(importedData.discount));
        }
        
        if (importedData.otherCost !== undefined) {
          setOtherCost(parseFloat(importedData.otherCost));
        }
        
        // Clear the input
        event.target.value = null;
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Invalid data format. Please select a valid export file.');
        
        // Clear the input
        event.target.value = null;
      }
    };
    
    reader.readAsText(file);
  };

  // When selectedRestaurant changes, reset all orders
  useEffect(() => {
    if (!selectedRestaurant) return;
    // Remove all orders that have items not in the selected restaurant
    setOrders(prevOrders => prevOrders
      .map(order => ({
        ...order,
        items: order.items.filter(itemId => {
          const menuItem = menuItems.find(item => item.id === itemId);
          return menuItem && menuItem.restaurantId === selectedRestaurant;
        })
      }))
      .filter(order => order.items.length > 0)
    );
  }, [selectedRestaurant, menuItems]);

  return (
    <div className="app-container">
      <header>
        <h1>Split Bill App</h1>
        <p className="tagline">Split your bills with friends easily</p>
        <div className="actions">
          <button className="btn danger outline" onClick={clearAllData}>
            Clear All Data
          </button>
          <button className="btn primary" onClick={exportData}>
            Export Data
          </button>
          <label className="btn success">
            Import Data
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <h2 className="sidebar-title">People</h2>
          <PersonList 
            people={people} 
            addPerson={addPerson} 
            removePerson={removePerson}
            activePerson={activePerson}
            setActivePerson={setActivePerson}
          />
          {/* Menu manager moved under People for easier access */}
          <div className="sidebar-menu" style={{ marginTop: '1rem' }}>
            <MenuManager 
              menuItems={menuItems} 
              addMenuItem={addMenuItem} 
              removeMenuItem={removeMenuItem} 
              restaurants={restaurants}
              addRestaurant={addRestaurant}
              removeRestaurant={removeRestaurant}
            />
          </div>
        </aside>

        <div className="content">
          <div className="card">
            <OrderSelection
              people={people}
              menuItems={menuItems}
              orders={orders}
              addOrder={addOrder}
              removeOrder={removeOrder}
              activePerson={activePerson}
              restaurants={restaurants}
              selectedRestaurant={selectedRestaurant}
              setSelectedRestaurant={setSelectedRestaurant}
            />
          </div>
          
          <AdditionalCosts 
            shippingCost={shippingCost}
            otherCost={otherCost}
            setShippingCost={setShippingCost}
            setOtherCost={setOtherCost}
          />
          <Tax 
            tax={tax}
            setTax={setTax}
            taxMethod={taxMethod}
            setTaxMethod={setTaxMethod}
          />
          <Discount 
            discount={discount}
            setDiscount={setDiscount}
          />
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '0.5em' }}>
              <label htmlFor="bill-date" style={{ marginRight: '0.5em', fontWeight: 500 }}>Bill Date:</label>
              <input
                id="bill-date"
                type="date"
                value={billDate}
                onChange={e => setBillDate(e.target.value)}
                style={{ fontSize: '1em', padding: '0.2em 0.5em', borderRadius: '4px', border: '1px solid #ccc' }}
                max={getTodayString()}
              />
            </div>
            <Summary 
              people={people}
              menuItems={menuItems}
              orders={orders}
              shippingCost={shippingCost}
              tax={tax}
              discount={discount}
              otherCost={otherCost}
              billDate={billDate}
              excludeNoOrder={true}
              taxMethod={taxMethod}
              selectedRestaurant={selectedRestaurant}
              restaurants={restaurants}
            />
          </div>
        </div>
      </div>
      
      {/* Notification element for save indicators */}
      <div id="notification" className="notification"></div>
    </div>
  );
}

export default App
