import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const SepoliaEthPrice = ({abi}) => {

    const [price, setPrice] = useState("");

    function formatNumber(input) {
     
      let dividedNum = input / 100000000;
    
      // Round the divided number to the nearest integer
      let roundedNum = Math.round(dividedNum);
    
      // Convert the rounded number to a string
      let numStr = roundedNum.toString();
    
      // Insert the comma at the correct position
      let formattedStr = numStr.slice(0, 1) + ',' + numStr.slice(1);
    
      return formattedStr;
    }

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
    let formatted_price = formatNumber(price);
    setPrice(formatted_price);
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
      <h1>Current Sepolia Price: {`$${price.toString()}.00`}  </h1>
    </div>
  );
};

export default SepoliaEthPrice;
