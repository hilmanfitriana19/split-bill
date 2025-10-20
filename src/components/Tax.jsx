import PropTypes from 'prop-types';

const Tax = ({ tax, setTax, taxMethod, setTaxMethod, taxDistribution, setTaxDistribution }) => {
  // Update tax (percentage) directly when input changes
  const handleTaxChange = (valueString) => {
    let value = parseFloat(valueString) || 0;
    if (value > 100) value = 100;
    if (value < 0) value = 0;
    setTax(value);
  };

  return (
    <div className="card">
  <h2 className="section-title" style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Tax</h2>
      <div className="tax-group">
        <label htmlFor="tax" className="additional-costs-label">Tax (%)</label>
        <div className="distribution-options" style={{ marginBottom: '0.75rem' }}>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="tax-distribution"
                value="equal"
                checked={taxDistribution === 'equal'}
                onChange={(e) => setTaxDistribution(e.target.value)}
              />
              <span>Split equally among all people</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="tax-distribution"
                value="proportional"
                checked={taxDistribution === 'proportional'}
                onChange={(e) => setTaxDistribution(e.target.value)}
              />
              <span>Split proportionally based on order value</span>
            </label>
          </div>
        </div>
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
        <div style={{ marginTop: '1em' }}>
          <label htmlFor="tax-method" style={{ fontWeight: 500, marginRight: '1em' }}>Tax Calculation Method:</label>
          <select id="tax-method" value={taxMethod} onChange={e => setTaxMethod(e.target.value)}>
            <option value="before">Before shipping & other costs (default)</option>
            <option value="after">After shipping & other costs</option>
          </select>
        </div>
      </div>
    </div>
  );
};

Tax.propTypes = {
  tax: PropTypes.number.isRequired,
  setTax: PropTypes.func.isRequired,
  taxMethod: PropTypes.string.isRequired,
  setTaxMethod: PropTypes.func.isRequired,
  taxDistribution: PropTypes.string.isRequired,
  setTaxDistribution: PropTypes.func.isRequired,
};

export default Tax;
