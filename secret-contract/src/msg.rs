use cosmwasm_std::{Addr, Binary};
use secret_toolkit::utils::HandleCallback;
use tnls::msg::{PostExecutionMsg, PrivContractHandleMsg};

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
    pub gateway_address: Addr,
    pub gateway_hash: String,
    pub gateway_key: Binary,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    Input { message: PrivContractHandleMsg },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct LimitOrderStoreMsg {
    pub user: String, 
    pub eth_amount: String, 
    pub usdc_amount: String, 
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct ResponseRetrieveLimitOrderMsg {
    pub user: String, 
    pub eth_amount: String, 
    pub usdc_amount: String, 
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    RetrieveLimitOrder {user: String},
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum GatewayMsg {
    Output { outputs: PostExecutionMsg },
}

impl HandleCallback for GatewayMsg {
    const BLOCK_SIZE: usize = 256;
}
