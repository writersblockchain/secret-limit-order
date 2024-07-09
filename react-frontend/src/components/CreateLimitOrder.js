import React, { useState } from 'react';
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
import Confetti from 'react-confetti';

export default function CreateNFT() {
  const [usdcAmount, setUsdcAmount] = useState("");
  const [ethAmount, setEthAmount] = useState("");
  const [transactionHash, setTransactionHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false); 

  const CONTRACT_ADDRESS = "";

  const encrypt = async (e) => {
    e.preventDefault();

    const iface = new ethers.utils.Interface(secretpath_abi);
    const routing_contract = 'secret1tg9nldf4ukuz9fk9jna7l3k2p4efp5hl0j8cw0';
    const routing_code_hash = "83c4b20f99efdc942c76ca329eff483ad8cb19c03498dcf3887a751a37246bcf";

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
      eth_amount: ethAmount,
      usdc_amount: usdcAmount,
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
    } catch (error) {
      console.error("Error submitting transaction:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    encrypt(e);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setConfetti(false);
  };

  return (
    <div className="flex flex-col full-height justify-start items-center px-6 lg:px-8 ">
      <div className="mt-8">
        <form onSubmit={handleSubmit} className="space-y-4" style={{ width: '360px' }}>
          <div className="text-black text-lg font-bold mb-4">Create NFT</div>
          <div className="border-4 rounded-lg p-4">
            <div>
              <label className="block text-sm font-medium leading-6 text-black w-full">
                USDC Amount
              </label>
              <input
                type="text"
                value={usdcAmount}
                onChange={(e) => setUsdcAmount(e.target.value)}
                placeholder="USDC Amount"
                required
                className="mt-2 block w-full pl-2 rounded-md border border-gray-300 bg-white py-1.5 text-black shadow-sm focus:ring-2 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium leading-6 text-black">
                ETH Amount
              </label>
              <textarea
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                placeholder="ETH Amount"
                required
                className="mt-2 block w-full pl-2 rounded-md border border-gray-300 bg-white py-1.5 text-black shadow-sm focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                rows="4"
              ></textarea>
            </div>
            <div className="flex justify-center mt-4">
              <button
                type="submit"
                disabled={buttonDisabled}
                className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Limit Order
              </button>
            </div>
          </div>
        </form>
        {loading && (
          <div className="flex justify-center mt-4">
            <p className="text-black">Creating Limit Order...</p>
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleCloseModal}
        >
          <div className="bg-white p-4 rounded-lg">
            <p>Close Modal</p>
          </div>
          {confetti && <Confetti />}
        </div>
      )}
    </div>
  );
}
