import { useState } from 'react';

function TestComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="test-component">
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

export default TestComponent;