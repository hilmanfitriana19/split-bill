import PropTypes from 'prop-types';

const Summary = ({ people, menuItems, orders, shippingCost, tax, discount, otherCost, billDate, excludeNoOrder, taxMethod, selectedRestaurant, restaurants, saveOrderToHistory }) => {
  // Format currency in IDR
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format billDate as DD-MM-YYYY
  const dateString = billDate
    ? `${billDate.slice(8, 10)}-${billDate.slice(5, 7)}-${billDate.slice(0, 4)}`
    : '';

  // Filter orders and menuItems by selectedRestaurant
  const filteredOrders = selectedRestaurant
    ? orders.filter(order => order.items.some(itemId => {
        const menuItem = menuItems.find(item => item.id === itemId);
        return menuItem && menuItem.restaurantId === selectedRestaurant;
      }))
    : orders;
  const filteredMenuItems = selectedRestaurant
    ? menuItems.filter(item => item.restaurantId === selectedRestaurant)
    : menuItems;
  // Filter people if excludeNoOrder is true
  const filteredPeople = excludeNoOrder
    ? people.filter(person => filteredOrders.some(order => order.personId === person.id))
    : people;

  // Calculate what each person owes
  const rawAmounts = (() => {
    // Initialize amounts for each person
    const amounts = filteredPeople.reduce((acc, person) => {
      acc[person.id] = 0;
      return acc;
    }, {});
    
    // Calculate each person's total based on orders
    filteredOrders.forEach(order => {
      const personId = order.personId;
      const orderTotal = order.items.reduce((total, itemId) => {
        const menuItem = filteredMenuItems.find(item => item.id === itemId);
        return menuItem ? total + menuItem.price : total;
      }, 0);
      amounts[personId] = (amounts[personId] || 0) + orderTotal;
    });
    
    return amounts;
  })();
  const subtotal = Object.values(rawAmounts).reduce((sum, amount) => sum + amount, 0);

  // Calculate tax (percentage of subtotal after discount)
  const discountedSubtotal = subtotal - discount;
  const totalOtherCost = otherCost || 0;
  let taxBase = discountedSubtotal;
  if (taxMethod === 'after') {
    taxBase += shippingCost + totalOtherCost;
  }
  const taxAmount = tax > 0 ? (taxBase * tax / 100) : 0;

  // Calculate individual discounts for each person
  const calculatePersonDiscounts = (rawAmounts, totalDiscount) => {
    if (totalDiscount <= 0 || subtotal <= 0) {
      return filteredPeople.reduce((acc, person) => {
        acc[person.id] = 0;
        return acc;
      }, {});
    }
    
    const personDiscounts = {};
    
    // Calculate discount proportion for each person
    Object.keys(rawAmounts).forEach(personId => {
      const personRatio = rawAmounts[personId] / subtotal;
      personDiscounts[personId] = personRatio * totalDiscount;
    });
    
    return personDiscounts;
  };
  
  // Get individual shipping, tax, and other costs
  const perPersonShipping = filteredPeople.length > 0 ? shippingCost / filteredPeople.length : 0;
  const perPersonTax = filteredPeople.length > 0 ? taxAmount / filteredPeople.length : 0;
  const perPersonOther = filteredPeople.length > 0 ? totalOtherCost / filteredPeople.length : 0;
  const personShippingCosts = filteredPeople.reduce((acc, person) => {
    acc[person.id] = perPersonShipping;
    return acc;
  }, {});
  const personTaxCosts = filteredPeople.reduce((acc, person) => {
    acc[person.id] = perPersonTax;
    return acc;
  }, {});
  const personOtherCosts = filteredPeople.reduce((acc, person) => {
    acc[person.id] = perPersonOther;
    return acc;
  }, {});

  // Calculate all cost components
  const personDiscounts = calculatePersonDiscounts(rawAmounts, discount);
  
  // Calculate final amounts
  const finalAmounts = {};
  filteredPeople.forEach(person => {
    const subtotal = rawAmounts[person.id] || 0;
    const personDiscount = personDiscounts[person.id] || 0;
    const personShipping = personShippingCosts[person.id] || 0;
    const personTax = personTaxCosts[person.id] || 0;
    const personOther = personOtherCosts[person.id] || 0;
    finalAmounts[person.id] = subtotal - personDiscount + personShipping + personTax + personOther;
  });
  
  // Calculate totals for display
  const totalBill = discountedSubtotal + taxAmount + shippingCost + totalOtherCost;
  
  // Get person's ordered items
  const getPersonItems = (personId) => {
    const personOrders = filteredOrders.filter(order => order.personId === personId);
    const itemsMap = new Map();
    
    personOrders.forEach(order => {
      order.items.forEach(itemId => {
        const menuItem = filteredMenuItems.find(item => item.id === itemId);
        if (menuItem) {
          if (itemsMap.has(menuItem.id)) {
            itemsMap.set(menuItem.id, {
              ...menuItem,
              quantity: itemsMap.get(menuItem.id).quantity + 1
            });
          } else {
            itemsMap.set(menuItem.id, {
              ...menuItem,
              quantity: 1
            });
          }
        }
      });
    });
    
    return Array.from(itemsMap.values());
  };
  
  // Get selected restaurant name
  let restaurantName = '';
  if (selectedRestaurant && Array.isArray(restaurants) && restaurants.length > 0) {
    const foundRestaurant = restaurants.find(r => r.id === selectedRestaurant);
    if (foundRestaurant) {
      restaurantName = foundRestaurant.name;
    }
  }

  // Handle save order
  const handleSaveOrder = () => {
    const orderName = prompt('Enter a name for this order:', 
      `${restaurantName || 'Order'} - ${dateString}`);
    
    if (orderName && orderName.trim()) {
      const success = saveOrderToHistory(orderName.trim());
      if (success) {
        alert('Order saved to history successfully!');
      }
    }
  };

  return (
    <div className="summary-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Summary Order{restaurantName ? ` ${restaurantName}` : ''}</h2>
        {filteredPeople.length > 0 && totalBill > 0 && (
          <button 
            className="btn success" 
            onClick={handleSaveOrder}
            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
          >
            💾 Save Order
          </button>
        )}
      </div>
      <div className="card summary-card">
        <div className="card-header">
          <h3>Bill Summary</h3>
        </div>
        <div className="card-body">
          <table className="summary-table summary-total">
            <tbody>
              <tr>
                <td>Subtotal</td>
                <td className="price-value">{formatCurrency(subtotal)}</td>
              </tr>
              {discount > 0 && (
                <tr className="discount-row">
                  <td>Discount</td>
                  <td className="price-value">-{formatCurrency(discount)}</td>
                </tr>
              )}
              {taxAmount > 0 && (
                <tr>
                  <td>Tax ({tax}%)</td>
                  <td className="price-value">{formatCurrency(taxAmount)}</td>
                </tr>
              )}
              {shippingCost > 0 && (
                <tr>
                  <td>Shipping</td>
                  <td className="price-value">{formatCurrency(shippingCost)}</td>
                </tr>
              )}
              {totalOtherCost > 0 && (
                <tr>
                  <td>Other Costs</td>
                  <td className="price-value">{formatCurrency(totalOtherCost)}</td>
                </tr>
              )}
              <tr>
                <td>Total Bill</td>
                <td className="price-value price-total">{formatCurrency(totalBill)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 style={{ marginTop: '2em', marginBottom: '0.5em', color: '#4338ca', fontWeight: 700 }}>Individual Breakdown</h3>
        {filteredPeople.length > 0 ? (
          <div className="person-breakdown-table-wrapper">
            <table className="summary-table person-breakdown-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Items</th>
                  <th>Subtotal</th>
                  <th>Discount</th>
                  <th>Tax</th>
                  <th>Shipping</th>
                  <th>Other</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredPeople.map(person => {
                  const subtotal = rawAmounts[person.id] || 0;
                  const personDiscount = personDiscounts[person.id] || 0;
                  const personShipping = personShippingCosts[person.id] || 0;
                  const personTax = personTaxCosts[person.id] || 0;
                  const personOther = personOtherCosts[person.id] || 0;
                  const total = finalAmounts[person.id] || 0;
                  const personItems = getPersonItems(person.id);
                  return (
                    <tr key={person.id}>
                      <td>{person.name}</td>
                      <td>{personItems.length > 0 ? personItems.map(item => (
  <div key={item.id} style={{ display: 'block' }}>
    {item.name}{item.quantity > 1 ? ` x${item.quantity}` : ''}
  </div>
)) : '-'}</td>
                      <td className="price-value">{formatCurrency(subtotal)}</td>
                      <td className="price-value">{personDiscount > 0 ? `-${formatCurrency(personDiscount)}` : personDiscount < 0 ? formatCurrency(personDiscount) : '-'}</td>
                      <td className="price-value">{personTax > 0 ? formatCurrency(personTax) : '-'}</td>
                      <td className="price-value">{personShipping > 0 ? formatCurrency(personShipping) : '-'}</td>
                      <td className="price-value">{personOther > 0 ? formatCurrency(personOther) : '-'}</td>
                      <td className="price-value price-total">{formatCurrency(total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-message">
            Add people to see the breakdown
          </p>
        )}
      </div>
    </div>
  );
};

Summary.propTypes = {
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
  shippingCost: PropTypes.number.isRequired,
  tax: PropTypes.number.isRequired,
  discount: PropTypes.number.isRequired,
  otherCost: PropTypes.number.isRequired,
  excludeNoOrder: PropTypes.bool,
  selectedRestaurant: PropTypes.string,
  restaurants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  saveOrderToHistory: PropTypes.func.isRequired
};

export default Summary;
