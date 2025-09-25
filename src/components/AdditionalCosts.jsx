import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const AdditionalCosts = ({ shippingCost, otherCost, setShippingCost, setOtherCost }) => {
  // Update shipping cost directly when input changes
  const handleShippingChange = (valueString) => {
    const value = parseFloat(valueString) || 0;
    setShippingCost(value);
  };

  // Update other cost directly when input changes
  const handleOtherCostChange = (valueString) => {
    const value = parseFloat(valueString) || 0;
    setOtherCost(value);
  };

  return (
    <div>
      <div className="card">
        <h2 className="section-title" style={{ color: '#2563eb', marginBottom: '1rem' }}>Additional Costs</h2>
        <div className="additional-costs-grid">
          <div className="additional-costs-group">
            <label htmlFor="shipping-cost" className="additional-costs-label">Shipping Cost</label>
            <span className="additional-costs-desc">Shipping is divided equally among all people</span>
            <div className="input-currency-row">
              <span className="input-currency-prefix">Rp</span>
              <input
                id="shipping-cost"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={shippingCost}
                onChange={(e) => handleShippingChange(e.target.value.replace(/\D/g, ''))}
                className="input input-currency"
                aria-label="Shipping cost"
              />
            </div>
          </div>
          <div className="additional-costs-group">
            <label htmlFor="other-cost" className="additional-costs-label">Other Costs</label>
            <span className="additional-costs-desc">Any other additional cost, divided equally among all people</span>
            <div className="input-currency-row">
              <span className="input-currency-prefix">Rp</span>
              <input
                id="other-cost"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={otherCost}
                onChange={(e) => handleOtherCostChange(e.target.value.replace(/\D/g, ''))}
                className="input input-currency"
                aria-label="Other cost"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

AdditionalCosts.propTypes = {
  shippingCost: PropTypes.number.isRequired,
  otherCost: PropTypes.number.isRequired,
  setShippingCost: PropTypes.func.isRequired,
  setOtherCost: PropTypes.func.isRequired,
};

export default AdditionalCosts;
