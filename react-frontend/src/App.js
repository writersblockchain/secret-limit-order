import React, { useState, useEffect } from 'react';
import './App.css';
import CreateLimitOrder from './components/CreateLimitOrder';
import QueryLimitOrder from './components/QueryLimitOrder';
import ABI from './config/LimitOrder.json';
import MyImage from './secret-logo.png';
import AnimatedText from './components/AnimatedText';
import { ClipLoader } from 'react-spinners';
import SuccessModal from './components/SuccessModal';

function App() {
  const [abi, setAbi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setAbi(ABI.abi);
  }, []);

  const handleTransactionSuccess = (txHash) => {
    setTransactionHash(txHash);
    setLoading(true);
    setIsModalOpen(true);
    setTimeout(() => {
      setLoading(false);
      setIsModalOpen(false);
    }, 20000); // 20 seconds
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

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
      <div className="flex flex-col items-start mt-4">
        <a
          href="https://faucet.circle.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          1. Get testnet Sepolia USDC from faucet
        </a>
        <AnimatedText />
      </div>
      <CreateLimitOrder abi={abi} handleTransactionSuccess={handleTransactionSuccess} />
      {loading ? (
        <div className="flex justify-center mt-4">
          <ClipLoader size={50} color={"#123abc"} />
        </div>
      ) : (
        transactionHash && <QueryLimitOrder />
      )}
      <img
        src={MyImage}
        alt="Descriptive Text"
        className="w-18 h-12 mt-8 mb-4"
      />
      <SuccessModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}

export default App;
