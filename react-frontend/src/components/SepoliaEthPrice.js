import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const SepoliaEthPrice = ({abi}) => {

    const [price, setPrice] = useState("");

    useEffect(() => {
        const fetchPrice = async () => {
          try {
            if (!window.ethereum) {
              console.error('MetaMask is not installed');
              return;
            }
            await (window).ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xAA36A7' }], // chainId must be in hexadecimal numbers
          });
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contractAddress = "0xD16A6ad63a7c63F933afFAF2b62D153B580fE9Da";
            const contract = new ethers.Contract(contractAddress, abi, signer);

    const price = await contract.getChainlinkPrice();
    setPrice(price);
    console.log("Current price:", ethers.utils.formatUnits(price, 6));
    
    
}
catch (error) {
    console.error('Error fetching: ', error);
  }
}
fetchPrice();
}, [abi]);

  return (
    <div>
      <h1>Current Sepolia Price: {price.toString()}  </h1>
    </div>
  );
};

export default SepoliaEthPrice;
