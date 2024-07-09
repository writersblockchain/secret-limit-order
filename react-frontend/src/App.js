import "./App.css";
import SepoliaEthPrice from "./components/SepoliaEthPrice";
import CreateLimitOrder from "./components/CreateLimitOrder";
import ABI from "./config/LimitOrder.json";

import React, { useState, useEffect } from 'react';

function App() {
  const [abi, setAbi] = useState(null);

  useEffect(() => {
      setAbi(ABI.abi);
  }, [abi]);
 


  return (
    <div className="text-3xl font-bold underline">
      <p>My Tailwind Template</p>
      <SepoliaEthPrice abi = {abi} />
      <CreateLimitOrder />
    </div>
  );
}

export default App;
