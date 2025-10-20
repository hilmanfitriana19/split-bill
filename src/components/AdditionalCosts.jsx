import PropTypes from 'prop-types';

const AdditionalCosts = ({ 
  shippingCost, 
  otherCost, 
  setShippingCost, 
  setOtherCost,
  shippingDistribution,
  setShippingDistribution,
  otherCostDistribution,
  setOtherCostDistribution
}) => {
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
  <h2 className="section-title" style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Additional Costs</h2>
        <div className="additional-costs-grid">
          <div className="additional-costs-group">
            <label htmlFor="shipping-cost" className="additional-costs-label">Shipping Cost</label>
            <div className="distribution-options" style={{ marginBottom: '0.75rem' }}>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="shipping-distribution"
                    value="equal"
                    checked={shippingDistribution === 'equal'}
                    onChange={(e) => setShippingDistribution(e.target.value)}
                  />
                  <span>Split equally among all people</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="shipping-distribution"
                    value="proportional"
                    checked={shippingDistribution === 'proportional'}
                    onChange={(e) => setShippingDistribution(e.target.value)}
                  />
                  <span>Split proportionally based on order value</span>
                </label>
              </div>
            </div>
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
            <div className="distribution-options" style={{ marginBottom: '0.75rem' }}>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="other-distribution"
                    value="equal"
                    checked={otherCostDistribution === 'equal'}
                    onChange={(e) => setOtherCostDistribution(e.target.value)}
                  />
                  <span>Split equally among all people</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="other-distribution"
                    value="proportional"
                    checked={otherCostDistribution === 'proportional'}
                    onChange={(e) => setOtherCostDistribution(e.target.value)}
                  />
                  <span>Split proportionally based on order value</span>
                </label>
              </div>
            </div>
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
  shippingDistribution: PropTypes.string.isRequired,
  setShippingDistribution: PropTypes.func.isRequired,
  otherCostDistribution: PropTypes.string.isRequired,
  setOtherCostDistribution: PropTypes.func.isRequired,
};

export default AdditionalCosts;
