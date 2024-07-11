import "./App.css";
import CreateLimitOrder from "./components/CreateLimitOrder";
import ABI from "./config/LimitOrder.json";
import MyImage from "./secret-logo.png";
import React, { useState, useEffect } from 'react';
import AnimatedText from './components/AnimatedText'; 
import QueryLimitOrder from "./components/QueryLimitOrder";

function App() {
  const [abi, setAbi] = useState(null);

  useEffect(() => {
      setAbi(ABI.abi);
  }, [abi]);
 


  return (
    <div className="bg-brand-tan text-brand-orange min-h-screen flex flex-col items-center">
      <p className="text-xl font-bold mt-4">Confidential Limit Orders on Secret Network</p>
      <h6 className="text-xs hover:underline text-brand-blue">
        <a
          href="https://docs.scrt.network/secret-network-documentation/confidential-computing-layer/ethereum-evm-developer-toolkit/usecases/"
          target="_blank"
          rel="noopener noreferrer"
        >
          [click here for docs]
        </a>
      </h6>
      <div className=" flex flex-col items-start mt-4 ">
        <a href="https://faucet.circle.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline">1. Get testnet Sepolia USDC from faucet</a>
        <AnimatedText />
      </div>
      <CreateLimitOrder abi={abi} />
      <QueryLimitOrder />
      <img
        src={MyImage}
        alt="Descriptive Text"
        className="w-18 h-12 mt-8 mb-4"
      />
    </div>
  );
}

export default App;
