import PropTypes from 'prop-types';
import { Save } from 'react-feather';

const Summary = ({ 
  people, 
  menuItems, 
  orders, 
  shippingCost, 
  tax, 
  discount, 
  otherCost, 
  billDate, 
  excludeNoOrder, 
  taxMethod, 
  shippingDistribution,
  taxDistribution,
  discountDistribution,
  otherCostDistribution,
  selectedRestaurant, 
  restaurants, 
  saveOrderToHistory 
}) => {
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
    if (totalDiscount <= 0) {
      return filteredPeople.reduce((acc, person) => {
        acc[person.id] = 0;
        return acc;
      }, {});
    }
    
    const personDiscounts = {};
    
    if (discountDistribution === 'proportional' && subtotal > 0) {
      // Calculate discount proportion for each person
      Object.keys(rawAmounts).forEach(personId => {
        const personRatio = rawAmounts[personId] / subtotal;
        personDiscounts[personId] = personRatio * totalDiscount;
      });
    } else {
      // Equal distribution
      const perPersonDiscount = filteredPeople.length > 0 ? totalDiscount / filteredPeople.length : 0;
      Object.keys(rawAmounts).forEach(personId => {
        personDiscounts[personId] = perPersonDiscount;
      });
    }
    
    return personDiscounts;
  };
  
  // Calculate individual shipping costs for each person
  const calculatePersonShippingCosts = (rawAmounts) => {
    const personShippingCosts = {};
    
    if (shippingDistribution === 'proportional' && subtotal > 0) {
      // Proportional distribution
      Object.keys(rawAmounts).forEach(personId => {
        const personRatio = rawAmounts[personId] / subtotal;
        personShippingCosts[personId] = personRatio * shippingCost;
      });
    } else {
      // Equal distribution
      const perPersonShipping = filteredPeople.length > 0 ? shippingCost / filteredPeople.length : 0;
      Object.keys(rawAmounts).forEach(personId => {
        personShippingCosts[personId] = perPersonShipping;
      });
    }
    
    return personShippingCosts;
  };
  
  // Calculate individual tax costs for each person
  const calculatePersonTaxCosts = (rawAmounts) => {
    const personTaxCosts = {};
    
    if (taxDistribution === 'proportional' && subtotal > 0) {
      // Proportional distribution
      Object.keys(rawAmounts).forEach(personId => {
        const personRatio = rawAmounts[personId] / subtotal;
        personTaxCosts[personId] = personRatio * taxAmount;
      });
    } else {
      // Equal distribution
      const perPersonTax = filteredPeople.length > 0 ? taxAmount / filteredPeople.length : 0;
      Object.keys(rawAmounts).forEach(personId => {
        personTaxCosts[personId] = perPersonTax;
      });
    }
    
    return personTaxCosts;
  };
  
  // Calculate individual other costs for each person
  const calculatePersonOtherCosts = (rawAmounts) => {
    const personOtherCosts = {};
    
    if (otherCostDistribution === 'proportional' && subtotal > 0) {
      // Proportional distribution
      Object.keys(rawAmounts).forEach(personId => {
        const personRatio = rawAmounts[personId] / subtotal;
        personOtherCosts[personId] = personRatio * totalOtherCost;
      });
    } else {
      // Equal distribution
      const perPersonOther = filteredPeople.length > 0 ? totalOtherCost / filteredPeople.length : 0;
      Object.keys(rawAmounts).forEach(personId => {
        personOtherCosts[personId] = perPersonOther;
      });
    }
    
    return personOtherCosts;
  };
  
  // Get individual costs using the new calculation methods
  const personShippingCosts = calculatePersonShippingCosts(rawAmounts);
  const personTaxCosts = calculatePersonTaxCosts(rawAmounts);
  const personOtherCosts = calculatePersonOtherCosts(rawAmounts);

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
            <Save size={14} style={{ marginRight: 8 }} />Save Order
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
                <td className="price-value price-total amount-total">{formatCurrency(totalBill)}</td>
              </tr>
            </tbody>
          </table>
          
          {/* Distribution Methods Information */}
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-subtle, #f8fafc)', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border, #e2e8f0)' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: 600, color: 'black' }}>Distribution Methods</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-sm, 6px)', border: '1px solid var(--border-light, #f1f5f9)' }}>
                  <span style={{ color: 'black', fontWeight: 500 }}>Discount:</span>
                  <span style={{ fontWeight: 600, color: 'black' }}>
                    {discountDistribution === 'proportional' ? '📊 Proportional' : '⚖️ Equal'}
                  </span>
                </div>
              )}
              {taxAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-sm, 6px)', border: '1px solid var(--border-light, #f1f5f9)' }}>
                  <span style={{ color: 'black', fontWeight: 500 }}>Tax:</span>
                  <span style={{ fontWeight: 600, color: 'black' }}>
                    {taxDistribution === 'proportional' ? '📊 Proportional' : '⚖️ Equal'}
                  </span>
                </div>
              )}
              {shippingCost > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-sm, 6px)', border: '1px solid var(--border-light, #f1f5f9)' }}>
                  <span style={{ color: 'black', fontWeight: 500 }}>Shipping:</span>
                  <span style={{ fontWeight: 600, color: 'black' }}>
                    {shippingDistribution === 'proportional' ? '📊 Proportional' : '⚖️ Equal'}
                  </span>
                </div>
              )}
              {totalOtherCost > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-sm, 6px)', border: '1px solid var(--border-light, #f1f5f9)' }}>
                  <span style={{ color: 'black', fontWeight: 500 }}>Other Costs:</span>
                  <span style={{ fontWeight: 600, color: 'black' }}>
                    {otherCostDistribution === 'proportional' ? '📊 Proportional' : '⚖️ Equal'}
                  </span>
                </div>
              )}
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'black', fontStyle: 'italic', textAlign: 'center', padding: '0.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-sm, 6px)' }}>
              📊 Proportional = Based on order value • ⚖️ Equal = Split evenly
            </div>
          </div>
        </div>

        <h3 style={{ marginTop: '2em', marginBottom: '0.5em', color: 'var(--primary)', fontWeight: 700 }}>Individual Breakdown</h3>

        {filteredPeople.length > 0 && (
          <div className="person-breakdown-wrapper">
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
                    const personSubtotal = rawAmounts[person.id] || 0;
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
                          <div key={item.id} style={{ display: 'block' }}>{item.name}{item.quantity > 1 ? ` x${item.quantity}` : ''}</div>
                        )) : '-'}</td>
                        <td className="price-value">{formatCurrency(personSubtotal)}</td>
                        <td className="price-value">{personDiscount > 0 ? `-${formatCurrency(personDiscount)}` : personDiscount < 0 ? formatCurrency(personDiscount) : '-'}</td>
                        <td className="price-value">{personTax > 0 ? formatCurrency(personTax) : '-'}</td>
                        <td className="price-value">{personShipping > 0 ? formatCurrency(personShipping) : '-'}</td>
                        <td className="price-value">{personOther > 0 ? formatCurrency(personOther) : '-'}</td>
                        <td className="price-value price-total amount-total">{formatCurrency(total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredPeople.length === 0 && (
          <p className="empty-message">Add people to see the breakdown</p>
        )}

        {/* Distribution Methods for Mobile */}
        {filteredPeople.length > 0 && (
          <div className="distribution-info-mobile" style={{ 
            display: 'none', 
            marginTop: '1rem', 
            padding: '0.75rem', 
            backgroundColor: 'var(--bg-subtle, #f8fafc)', 
            borderRadius: 'var(--radius-md, 8px)', 
            border: '1px solid var(--border, #e2e8f0)' 
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 600, color: 'black' }}>Distribution Methods</h4>
            <div style={{ fontSize: '0.8rem', lineHeight: '1.4', color: 'black' }}>
              {discount > 0 && (
                <div style={{ marginBottom: '0.25rem' }}>
                  <strong>Discount:</strong> {discountDistribution === 'proportional' ? '📊 Proportional' : '⚖️ Equal'}
                </div>
              )}
              {taxAmount > 0 && (
                <div style={{ marginBottom: '0.25rem' }}>
                  <strong>Tax:</strong> {taxDistribution === 'proportional' ? '📊 Proportional' : '⚖️ Equal'}
                </div>
              )}
              {shippingCost > 0 && (
                <div style={{ marginBottom: '0.25rem' }}>
                  <strong>Shipping:</strong> {shippingDistribution === 'proportional' ? '📊 Proportional' : '⚖️ Equal'}
                </div>
              )}
              {totalOtherCost > 0 && (
                <div style={{ marginBottom: '0.25rem' }}>
                  <strong>Other Costs:</strong> {otherCostDistribution === 'proportional' ? '📊 Proportional' : '⚖️ Equal'}
                </div>
              )}
              <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'black', fontStyle: 'italic' }}>
                📊 = Based on order value • ⚖️ = Split evenly
              </div>
            </div>
          </div>
        )}

        {/* Mobile: per-person card view (visible only at <=1000px via CSS) */}
        <div className="person-cards">
          {filteredPeople.map(person => {
            const personSubtotal = rawAmounts[person.id] || 0;
            const personDiscount = personDiscounts[person.id] || 0;
            const personShipping = personShippingCosts[person.id] || 0;
            const personTax = personTaxCosts[person.id] || 0;
            const personOther = personOtherCosts[person.id] || 0;
            const total = finalAmounts[person.id] || 0;
            const items = getPersonItems(person.id);
            return (
              <div className="person-card" key={`card-${person.id}`}>
                <div className="person-name">{person.name}</div>
                <div className="item-list">
                  {items.length > 0 ? items.map(i => (
                    <div key={i.id}>{i.name}{i.quantity > 1 ? ` x${i.quantity}` : ''}</div>
                  )) : <div className="small">-</div>}
                </div>
                <div className="card-row"><div className="label">Subtotal</div><div className="value">{formatCurrency(personSubtotal)}</div></div>
                <div className="card-row"><div className="label">Discount</div><div className="value">{personDiscount > 0 ? `-${formatCurrency(personDiscount)}` : personDiscount < 0 ? formatCurrency(personDiscount) : '-'}</div></div>
                <div className="card-row"><div className="label">Tax</div><div className="value">{personTax > 0 ? formatCurrency(personTax) : '-'}</div></div>
                <div className="card-row"><div className="label">Shipping</div><div className="value">{personShipping > 0 ? formatCurrency(personShipping) : '-'}</div></div>
                <div className="card-row"><div className="label">Other</div><div className="value">{personOther > 0 ? formatCurrency(personOther) : '-'}</div></div>
                <div className="card-row"><div className="label">Total</div><div className="value amount-total">{formatCurrency(total)}</div></div>
              </div>
            )
          })}
        </div>

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
  billDate: PropTypes.string.isRequired,
  taxMethod: PropTypes.string,
  shippingDistribution: PropTypes.string.isRequired,
  taxDistribution: PropTypes.string.isRequired,
  discountDistribution: PropTypes.string.isRequired,
  otherCostDistribution: PropTypes.string.isRequired,
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
