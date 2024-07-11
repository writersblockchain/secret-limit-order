import React, { useState, useEffect } from 'react';
import { SecretNetworkClient } from 'secretjs';

function QueryLimitOrder() {
  const [limitOrder, setLimitOrder] = useState({
    user: '',
    usdcAmount: '',
    targetPrice: '',
  });

  useEffect(() => {
    const fetchLimitOrder = async () => {
      try {
        const secretjs = new SecretNetworkClient({
          url: 'https://lcd.testnet.secretsaturn.net',
          chainId: 'pulsar-3'
        });

        const fetchedLimitOrder = await secretjs.query.compute.queryContract({
          contract_address: 'secret15xvyk8yacfqt2y6dcycgdcpc9vcl79zp97d92j',
          code_hash: "2516b5072c613499284c9ae6fbbba8f9140f914d8da20a423a83af407afc80e1",
          query: { retrieve_limit_order: {} }
        });

        setLimitOrder({
          user: fetchedLimitOrder.user,
          usdcAmount: fetchedLimitOrder.usdc_amount,
          targetPrice: fetchedLimitOrder.target_price,
        });

        console.log(fetchedLimitOrder);
      } catch (error) {
        console.error('Error fetching limit order:', error);
      }
    };

    fetchLimitOrder();
  }, []);

  return (
    <div className="flex flex-col items-center px-6 lg:px-8 text-brand-orange mt-8" >
      <div className="border-4 border-brand-orange rounded-lg p-4 " style={{ width: '460px' }}>
        <h2 className="text-lg font-bold mb-4">Confidential Limit Order Details</h2>
        <div className="mb-2">
          <label className="block text-sm font-medium leading-6">User:</label>
          <p className="mt-1 text-brand-blue">{limitOrder.user}</p>
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium leading-6">USDC Amount:</label>
          <p className="mt-1 text-brand-blue">{limitOrder.usdcAmount}</p>
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium leading-6">Target Price:</label>
          <p className="mt-1 text-brand-blue">${limitOrder.targetPrice} ETH</p>
        </div>
        <div className="flex justify-center mt-4">
              <button
                type="submit"
                className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-orange hover:bg-brand-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Execute Limit Order on EVM
              </button>
            </div>
      </div>
    </div>

  );
}

export default QueryLimitOrder;
