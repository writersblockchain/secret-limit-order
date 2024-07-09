use cosmwasm_std::{Addr, Binary};
use secret_toolkit::storage::{Item, Keymap};

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

pub static CONFIG: Item<State> = Item::new(b"config");

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct State {
    pub gateway_address: Addr,
    pub gateway_hash: String,
    pub gateway_key: Binary,
}
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Input {
    pub user: String, 
    pub eth_amount: String, 
    pub usdc_amount: String, 
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct LimitOrder {
    pub user: String, 
    pub eth_amount: String, 
    pub usdc_amount: String, 
}

pub static STORED_LIMIT_ORDER: Keymap<bool, LimitOrder> = Keymap::new(b"stored_limit_orders");
