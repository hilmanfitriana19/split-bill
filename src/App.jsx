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
import OrderHistory from './components/OrderHistory'

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
  
  const [orders, setOrders] = useState([]);
  
  // State for shipping cost, tax, discount, other cost, and tax method
  const [taxMethod, setTaxMethod] = useState('percentage');
  const [shippingCost, setShippingCost] = useState(0);
  
  const [tax, setTax] = useState(0);
  
  const [discount, setDiscount] = useState(0);
  
  const [otherCost, setOtherCost] = useState(0);

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

  // Order history state
  const [orderHistory, setOrderHistory] = useState(() => {
    const savedHistory = localStorage.getItem('splitBillOrderHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

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
  
  // Orders are not persisted - they clear on page refresh
  

  


  

  


  useEffect(() => {
    localStorage.setItem('splitBillOrderHistory', JSON.stringify(orderHistory));
  }, [orderHistory]);

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

  // Save current order to history
  const saveOrderToHistory = (orderName) => {
    // Calculate summary data similar to Summary component
    const filteredOrders = selectedRestaurant
      ? orders.filter(order => order.items.some(itemId => {
          const menuItem = menuItems.find(item => item.id === itemId);
          return menuItem && menuItem.restaurantId === selectedRestaurant;
        }))
      : orders;
    
    const filteredMenuItems = selectedRestaurant
      ? menuItems.filter(item => item.restaurantId === selectedRestaurant)
      : menuItems;
    
    const filteredPeople = people.filter(person => 
      filteredOrders.some(order => order.personId === person.id)
    );

    // Calculate amounts
    const rawAmounts = filteredPeople.reduce((acc, person) => {
      acc[person.id] = 0;
      return acc;
    }, {});
    
    filteredOrders.forEach(order => {
      const orderTotal = order.items.reduce((total, itemId) => {
        const menuItem = filteredMenuItems.find(item => item.id === itemId);
        return menuItem ? total + menuItem.price : total;
      }, 0);
      rawAmounts[order.personId] = (rawAmounts[order.personId] || 0) + orderTotal;
    });

    const subtotal = Object.values(rawAmounts).reduce((sum, amount) => sum + amount, 0);
    const discountedSubtotal = subtotal - discount;
    const totalOtherCost = otherCost || 0;
    let taxBase = discountedSubtotal;
    if (taxMethod === 'after') {
      taxBase += shippingCost + totalOtherCost;
    }
    const taxAmount = tax > 0 ? (taxBase * tax / 100) : 0;
    const totalBill = discountedSubtotal + taxAmount + shippingCost + totalOtherCost;

    // Calculate final amounts for each person
    const finalAmounts = {};
    const perPersonShipping = filteredPeople.length > 0 ? shippingCost / filteredPeople.length : 0;
    const perPersonTax = filteredPeople.length > 0 ? taxAmount / filteredPeople.length : 0;
    const perPersonOther = filteredPeople.length > 0 ? totalOtherCost / filteredPeople.length : 0;
    
    filteredPeople.forEach(person => {
      const personSubtotal = rawAmounts[person.id] || 0;
      const personDiscount = subtotal > 0 ? (personSubtotal / subtotal) * discount : 0;
      finalAmounts[person.id] = personSubtotal - personDiscount + perPersonShipping + perPersonTax + perPersonOther;
    });

    // Get restaurant name
    const restaurant = restaurants.find(r => r.id === selectedRestaurant);
    const restaurantName = restaurant ? restaurant.name : '';

    const historyOrder = {
      id: uuidv4(),
      name: orderName,
      savedAt: new Date().toISOString().slice(0, 10),
      billDate,
      people: [...filteredPeople],
      menuItems: [...filteredMenuItems],
      orders: [...filteredOrders],
      restaurants: [...restaurants],
      selectedRestaurant,
      restaurantName,
      subtotal,
      discount,
      tax: taxAmount,
      taxRate: tax,
      taxMethod,
      shippingCost,
      otherCost: totalOtherCost,
      totalBill,
      finalAmounts
    };

    setOrderHistory(prev => [historyOrder, ...prev]);
    return true;
  };

  // Load order from history
  const loadHistoryOrder = (historyOrder) => {
    setPeople(historyOrder.people);
    setMenuItems(historyOrder.menuItems);
    setOrders(historyOrder.orders);
    setRestaurants(historyOrder.restaurants);
    setSelectedRestaurant(historyOrder.selectedRestaurant || '');
    setBillDate(historyOrder.billDate);
    setDiscount(historyOrder.discount);
    setTax(historyOrder.taxRate);
    setTaxMethod(historyOrder.taxMethod || 'before');
    setShippingCost(historyOrder.shippingCost);
    setOtherCost(historyOrder.otherCost);
  };

  // Delete order from history
  const deleteHistoryOrder = (orderId) => {
    setOrderHistory(prev => prev.filter(order => order.id !== orderId));
  };

  // Edit order in history
  const editHistoryOrder = (orderId, updatedData) => {
    setOrderHistory(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, ...updatedData, savedAt: new Date().toISOString() }
        : order
    ));
  };

  // Clear all data
  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setPeople([]);
      setMenuItems([]);
      setOrders([]);
      setRestaurants([]);
      setShippingCost(0);
      setTax(0);
      setDiscount(0);
      setOtherCost(0);
      setOrderHistory([]);
      localStorage.removeItem('splitBillPeople');
      localStorage.removeItem('splitBillMenuItems');
      localStorage.removeItem('splitBillRestaurants');
      localStorage.removeItem('splitBillShipping');
      localStorage.removeItem('splitBillTax');
      localStorage.removeItem('splitBillDiscount');
      localStorage.removeItem('splitBillOtherCost');
      localStorage.removeItem('splitBillOrderHistory');
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
    <div className="container app-container">
      <header className="card app-header">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <h1 className="app-title">Split Bill App</h1>
          <p className="small">Bagi tagihan dengan teman-teman dengan mudah</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
          <button className="btn btn-danger" onClick={clearAllData}>🗑 Hapus Semua Data</button>
          <button className="btn" onClick={exportData}>📤 Export Data</button>
          <label className="btn btn-success">
            📥 Import Data
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>
      </header>

      <main className="grid-2" style={{ marginTop: 'var(--space-4)' }}>
        <aside className="sidebar card">
          <h2 className="sidebar-title">People</h2>
          <PersonList
            people={people}
            addPerson={addPerson}
            removePerson={removePerson}
            activePerson={activePerson}
            setActivePerson={setActivePerson}
          />

          <div style={{ marginTop: 'var(--space-4)' }}>
            <MenuManager
              menuItems={menuItems}
              addMenuItem={addMenuItem}
              removeMenuItem={removeMenuItem}
              restaurants={restaurants}
              addRestaurant={addRestaurant}
              removeRestaurant={removeRestaurant}
            />
          </div>

          <div style={{ marginTop: 'var(--space-4)' }}>
            <OrderHistory
              orderHistory={orderHistory}
              loadHistoryOrder={loadHistoryOrder}
              deleteHistoryOrder={deleteHistoryOrder}
              editHistoryOrder={editHistoryOrder}
            />
          </div>
        </aside>

        <section className="content">
          {/* Mobile inline sidebar: appears only on small screens via CSS. Uses native details/summary for accessible accordions */}
          <div className="mobile-inline-sidebar">
            <details className="accordion-card" open>
              <summary>People</summary>
              <div style={{ marginTop: 'var(--space-3)' }}>
                <PersonList
                  people={people}
                  addPerson={addPerson}
                  removePerson={removePerson}
                  activePerson={activePerson}
                  setActivePerson={setActivePerson}
                />
              </div>
            </details>

            <details className="accordion-card">
              <summary>Menu Items</summary>
              <div style={{ marginTop: 'var(--space-3)' }}>
                <MenuManager
                  menuItems={menuItems}
                  addMenuItem={addMenuItem}
                  removeMenuItem={removeMenuItem}
                  restaurants={restaurants}
                  addRestaurant={addRestaurant}
                  removeRestaurant={removeRestaurant}
                />
              </div>
            </details>
          </div>

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

          <div className="grid-container grid-3" style={{ marginTop: 'var(--space-4)', gap: 'var(--space-4)' }}>
            <div className="card">
              <AdditionalCosts
                shippingCost={shippingCost}
                otherCost={otherCost}
                setShippingCost={setShippingCost}
                setOtherCost={setOtherCost}
              />
            </div>

            <div className="card">
              <Tax
                tax={tax}
                setTax={setTax}
                taxMethod={taxMethod}
                setTaxMethod={setTaxMethod}
              />
            </div>

            <div className="card">
              <Discount
                discount={discount}
                setDiscount={setDiscount}
              />
            </div>
          </div>

          <div className="card summary-card-mobile" style={{ marginTop: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '0.5em', gap: '8px' }}>
              <label htmlFor="bill-date" style={{ marginRight: '0.5em', fontWeight: 500 }}>Bill Date:</label>
              <input
                id="bill-date"
                type="date"
                value={billDate}
                onChange={e => setBillDate(e.target.value)}
                className="input"
                max={getTodayString()}
                style={{ width: '200px' }}
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
              saveOrderToHistory={saveOrderToHistory}
            />
          </div>
        </section>
      </main>

      <div id="notification" className="notification"></div>
    </div>
  );
}

export default App
