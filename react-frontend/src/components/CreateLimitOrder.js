import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  arrayify,
  hexlify,
  SigningKey,
  keccak256,
  recoverPublicKey,
} from "ethers/lib/utils";
import { ecdh, chacha20_poly1305_seal } from "@solar-republic/neutrino";
import {
  bytes,
  bytes_to_base64,
  json_to_bytes,
  sha256,
  concat,
  text_to_bytes,
  base64_to_bytes,
} from "@blake.regalia/belt";
import secretpath_abi from "../config/abi.js";
import SuccessModal from './SuccessModal';


export default function CreateLimitOrder({ abi, onTransactionSuccess }) {
  const [usdcAmount, setUsdcAmount] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [price, setPrice] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTransactionSuccess = () => {
    setIsModalOpen(true);
    onTransactionSuccess();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const encrypt = async (e, usdcAmount, targetPrice) => {
    e.preventDefault();

    const iface = new ethers.utils.Interface(secretpath_abi);
    const routing_contract = 'secret15xvyk8yacfqt2y6dcycgdcpc9vcl79zp97d92j';
    const routing_code_hash = "2516b5072c613499284c9ae6fbbba8f9140f914d8da20a423a83af407afc80e1";

    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

    const [myAddress] = await provider.send("eth_requestAccounts", []);

    const wallet = ethers.Wallet.createRandom();
    const userPrivateKeyBytes = arrayify(wallet.privateKey);
    const userPublicKey = new SigningKey(wallet.privateKey).compressedPublicKey;
    const userPublicKeyBytes = arrayify(userPublicKey);
    const gatewayPublicKey = "A20KrD7xDmkFXpNMqJn1CLpRaDLcdKpO1NdBBS7VpWh3";
    const gatewayPublicKeyBytes = base64_to_bytes(gatewayPublicKey);

    const sharedKey = await sha256(
      ecdh(userPrivateKeyBytes, gatewayPublicKeyBytes)
    );

    const callbackSelector = iface.getSighash(
      iface.getFunction("upgradeHandler")
    );
    const callbackGasLimit = 300000;

    const data = JSON.stringify({
      user: myAddress,
      usdc_amount: usdcAmount,
      target_price: targetPrice
    });

    let publicClientAddress = "0x3879E146140b627a5C858a08e507B171D9E43139";

    const callbackAddress = publicClientAddress.toLowerCase();
    console.log("callback address: ", callbackAddress);
    console.log("my data: ", data);

    const payload = {
      data: data,
      routing_info: routing_contract,
      routing_code_hash: routing_code_hash,
      user_address: myAddress,
      user_key: bytes_to_base64(userPublicKeyBytes),
      callback_address: bytes_to_base64(arrayify(callbackAddress)),
      callback_selector: bytes_to_base64(arrayify(callbackSelector)),
      callback_gas_limit: callbackGasLimit,
    };

    const payloadJson = JSON.stringify(payload);
    const plaintext = json_to_bytes(payload);
    const nonce = crypto.getRandomValues(bytes(12));

    const [ciphertextClient, tagClient] = chacha20_poly1305_seal(
      sharedKey,
      nonce,
      plaintext
    );
    const ciphertext = concat([ciphertextClient, tagClient]);
    const ciphertextHash = keccak256(ciphertext);
    const payloadHash = keccak256(
      concat([
        text_to_bytes("\x19Ethereum Signed Message:\n32"),
        arrayify(ciphertextHash),
      ])
    );
    const msgParams = ciphertextHash;

    const params = [myAddress, msgParams];
    const method = "personal_sign";
    const payloadSignature = await provider.send(method, params);
    const user_pubkey = recoverPublicKey(payloadHash, payloadSignature);

    const _info = {
      user_key: hexlify(userPublicKeyBytes),
      user_pubkey: user_pubkey,
      routing_code_hash: routing_code_hash,
      task_destination_network: "pulsar-3",
      handle: "create_limit_order",
      nonce: hexlify(nonce),
      payload: hexlify(ciphertext),
      payload_signature: payloadSignature,
      callback_gas_limit: callbackGasLimit,
    };

    const functionData = iface.encodeFunctionData("send", [
      payloadHash,
      myAddress,
      routing_contract,
      _info,
    ]);

    const gasFee = await provider.getGasPrice();
    let amountOfGas = gasFee.mul(callbackGasLimit).mul(3).div(2);

    const tx_params = {
      gas: hexlify(150000),
      to: publicClientAddress,
      from: myAddress,
      value: hexlify(amountOfGas),
      data: functionData,
    };

    try {
      const txHash = await provider.send("eth_sendTransaction", [tx_params]);
      console.log(`Transaction Hash: ${txHash}`);
      handleTransactionSuccess(); // Call the success handler after successful transaction
    } catch (error) {
      console.error("Error submitting transaction:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    encrypt(e, usdcAmount, targetPrice);
  };

  //get current Sepolia price from Chainlink oracle
  function formatNumber(input) {
    let dividedNum = input / 100000000;
    let roundedNum = Math.round(dividedNum);
    let numStr = roundedNum.toString();
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
      } catch (error) {
        console.error('Error fetching:', error);
      }
    }
    fetchPrice();
  }, [abi]);

  return (
    <div className="flex flex-col full-height justify-start items-center px-6 lg:px-8 text-brand-orange ">
      <div className="mt-4">
        <form onSubmit={handleSubmit} className="space-y-4" style={{ width: '460px' }}>
          <div className="border-4 border-brand-orange rounded-lg p-4">
            <div>
              <label className="block text-sm font-medium leading-6  w-full">
                USDC Amount (amount of USDC you want to swap for ETH)
              </label>
              <input
                type="text"
                value={usdcAmount}
                onChange={(e) => setUsdcAmount(e.target.value)}
                placeholder="USDC Amount"
                required
                className="mt-2 block w-full pl-2 text-brand-blue rounded-md border border-brand-orange bg-brand-tan py-1.5  shadow-sm focus:ring-2 focus:ring-brand-blue sm:text-sm"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium leading-6">
                ETH Target Price (Current Sepolia ETH Price: {`$${price}.00`})
              </label>
              <textarea
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="ETH Target Price"
                required
                className="mt-2 block w-full pl-2 text-brand-blue rounded-md border border-brand-orange bg-brand-tan py-1.5  shadow-sm focus:ring-2 focus:ring-brand-blue sm:text-sm"
                rows="4"
              ></textarea>
            </div>
            <div className="flex justify-center mt-4">
              <button
                type="submit"
                className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-orange hover:bg-brand-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Store Limit Order on Secret Network
              </button>
            </div>
          </div>
        </form>
      </div>
      <SuccessModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}
