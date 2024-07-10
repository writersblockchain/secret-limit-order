import { SecretNetworkClient } from "secretjs"
import dotenv from "dotenv"
dotenv.config()

let query = async () => {
  const secretjs = new SecretNetworkClient({
    url: "https://lcd.testnet.secretsaturn.net",
    chainId: "pulsar-3",
  })

  const query_tx = await secretjs.query.compute.queryContract({
    contract_address: "secret1r6089slee2hnnt0pk460xww92xy8csdv5zcgfg",
    code_hash: "76eb12576011324034f09dfa279018cf4c4f26bf993565cca5f97215723a349e",
    query: { retrieve_limit_order: {} },
  })
  console.log(query_tx)
}

query()
