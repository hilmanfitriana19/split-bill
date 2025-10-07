import PropTypes from 'prop-types';

const Discount = ({ discount, setDiscount }) => {
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
        <span className="additional-costs-desc">Discount is applied proportionally based on order totals</span>
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
};

export default Discount;
