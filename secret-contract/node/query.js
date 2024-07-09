import { SecretNetworkClient } from "secretjs"
import dotenv from "dotenv"
dotenv.config()

let query = async () => {
  const secretjs = new SecretNetworkClient({
    url: "https://lcd.testnet.secretsaturn.net",
    chainId: "pulsar-3",
  })

  const query_tx = await secretjs.query.compute.queryContract({
    contract_address: "secret1tg9nldf4ukuz9fk9jna7l3k2p4efp5hl0j8cw0",
    code_hash: "83c4b20f99efdc942c76ca329eff483ad8cb19c03498dcf3887a751a37246bcf",
    query: { retrieve_limit_order: {user: "0x4B808ec5A5d53871e0b7bf53bC2A4Ee89dd1ddB1"} },
  })
  console.log(query_tx)
}

query()
