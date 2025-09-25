import PropTypes from 'prop-types';

const Tax = ({ tax, setTax }) => {
  // Update tax (percentage) directly when input changes
  const handleTaxChange = (valueString) => {
    let value = parseFloat(valueString) || 0;
    if (value > 100) value = 100;
    if (value < 0) value = 0;
    setTax(value);
  };

  return (
    <div className="card">
      <h2 className="section-title" style={{ color: '#2563eb', marginBottom: '1rem' }}>Tax</h2>
      <div className="tax-group">
        <label htmlFor="tax" className="additional-costs-label">Tax (%)</label>
        <span className="additional-costs-desc">Tax is calculated as a percentage of subtotal and divided equally</span>
        <div className="input-currency-row">
          <input
            id="tax"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={tax}
            onChange={(e) => handleTaxChange(e.target.value.replace(/\D/g, ''))}
            className="input input-currency"
            aria-label="Tax percentage"
            style={{ maxWidth: '80px' }}
          />
          <span className="input-currency-prefix">%</span>
        </div>
      </div>
    </div>
  );
};

Tax.propTypes = {
  tax: PropTypes.number.isRequired,
  setTax: PropTypes.func.isRequired,
};

export default Tax;
