import "./App.css";
import SepoliaEthPrice from "./components/SepoliaEthPrice";
import CreateLimitOrder from "./components/CreateLimitOrder";
import ABI from "./config/LimitOrder.json";

import React, { useState, useEffect } from 'react';
import ExecuteLimitOrder from "./components/ExecuteLimitOrder";

function App() {
  const [abi, setAbi] = useState(null);

  useEffect(() => {
      setAbi(ABI.abi);
  }, [abi]);
 


  return (
    <div className="">
    
      <SepoliaEthPrice abi = {abi} />
      <CreateLimitOrder />
      <ExecuteLimitOrder/>
    </div>
  );
}

export default App;
