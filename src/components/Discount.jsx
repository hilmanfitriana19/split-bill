import PropTypes from 'prop-types';

const Discount = ({ discount, setDiscount, discountDistribution, setDiscountDistribution }) => {
  // Update discount directly when input changes
  const handleDiscountChange = (valueString) => {
    const value = parseFloat(valueString) || 0;
    setDiscount(value);
  };

  return (
    <div className="card">
  <h2 className="section-title" style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Discount</h2>
      <div className="discount-group">
        <label htmlFor="discount" className="additional-costs-label">Discount</label>
        <div className="distribution-options" style={{ marginBottom: '0.75rem' }}>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="discount-distribution"
                value="equal"
                checked={discountDistribution === 'equal'}
                onChange={(e) => setDiscountDistribution(e.target.value)}
              />
              <span>Split equally among all people</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="discount-distribution"
                value="proportional"
                checked={discountDistribution === 'proportional'}
                onChange={(e) => setDiscountDistribution(e.target.value)}
              />
              <span>Split proportionally based on order value</span>
            </label>
          </div>
        </div>
        <div className="input-currency-row">
          <span className="input-currency-prefix">Rp</span>
          <input
            id="discount"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={discount}
            onChange={(e) => handleDiscountChange(e.target.value.replace(/\D/g, ''))}
            className="input input-currency"
            aria-label="Discount"
          />
        </div>
      </div>
    </div>
  );
};

Discount.propTypes = {
  discount: PropTypes.number.isRequired,
  setDiscount: PropTypes.func.isRequired,
  discountDistribution: PropTypes.string.isRequired,
  setDiscountDistribution: PropTypes.func.isRequired,
};

export default Discount;
