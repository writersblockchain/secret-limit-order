import React, { useEffect, useState } from 'react';
import { SecretNetworkClient } from 'secretjs';

export default function ExecuteLimitOrder() {
  const [limitOrder, setLimitOrder] = useState({
    user: '',
    ethAmount: '',
    usdcAmount: ''
  });

  useEffect(() => {
    const fetchLimitOrder = async () => {
      const secretjs = new SecretNetworkClient({
        url: 'https://lcd.testnet.secretsaturn.net',
        chainId: 'pulsar-3'
      });

      const fetchedLimitOrder = await secretjs.query.compute.queryContract({
        contract_address: 'secret1r6089slee2hnnt0pk460xww92xy8csdv5zcgfg',
        code_hash: '76eb12576011324034f09dfa279018cf4c4f26bf993565cca5f97215723a349e',
        query: { retrieve_limit_order: {} }
      });

      setLimitOrder({
        user: fetchedLimitOrder.user,
        ethAmount: fetchedLimitOrder.eth_amount,
        usdcAmount: fetchedLimitOrder.usdc_amount
      });

      console.log(fetchedLimitOrder);
    };

    fetchLimitOrder();
  }, []);

  return (
    <div className="flex flex-col full-height justify-start items-center px-6 lg:px-8">
      <div className="mt-8">
        <div className="space-y-4" style={{ width: '420px' }}>
          <div className="text-black text-lg font-bold mb-4">Limit Order Information</div>
          <div className="border-4 rounded-lg p-4">
            <div>
              <label className="block text-sm font-medium leading-6 text-black w-full">
                User
              </label>
              <div className="mt-2 block w-full pl-2 rounded-md border border-gray-300 bg-white py-1.5 text-black shadow-sm focus:ring-2 focus:ring-indigo-500 sm:text-sm">
                {limitOrder.user}
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium leading-6 text-black">
                USDC Amount
              </label>
              <div className="mt-2 block w-full pl-2 rounded-md border border-gray-300 bg-white py-1.5 text-black shadow-sm focus:ring-2 focus:ring-indigo-500 sm:text-sm">
                {limitOrder.usdcAmount}
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium leading-6 text-black">
                ETH Amount
              </label>
              <div className="mt-2 block w-full pl-2 rounded-md border border-gray-300 bg-white py-1.5 text-black shadow-sm focus:ring-2 focus:ring-indigo-500 sm:text-sm">
                {limitOrder.ethAmount}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
