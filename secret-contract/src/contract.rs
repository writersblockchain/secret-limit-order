use crate::{
    msg::{
        ExecuteMsg, GatewayMsg, InstantiateMsg, QueryMsg, ResponseRetrieveLimitOrderMsg, ResponseStoreLimitOrderMsg, 
    },
    state::{Input, LimitOrder, State, CONFIG, STORED_LIMIT_ORDER, },
};
use cosmwasm_std::{
    entry_point, to_binary, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdError, StdResult,
};
use secret_toolkit::utils::{pad_handle_result, pad_query_result, HandleCallback};
use tnls::{
    msg::{PostExecutionMsg, PrivContractHandleMsg},
    state::Task,
};

/// pad handle responses and log attributes to blocks of 256 bytes to prevent leaking info based on
/// response size
pub const BLOCK_SIZE: usize = 256;

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    let state = State {
        gateway_address: msg.gateway_address,
        gateway_hash: msg.gateway_hash,
        gateway_key: msg.gateway_key,
    };

    CONFIG.save(deps.storage, &state)?;

    Ok(Response::default())
}

#[entry_point]
pub fn execute(deps: DepsMut, env: Env, info: MessageInfo, msg: ExecuteMsg) -> StdResult<Response> {
    let response = match msg {
        ExecuteMsg::Input { message } => try_handle(deps, env, info, message),
    };
    pad_handle_result(response, BLOCK_SIZE)
}

#[entry_point]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    let response = match msg {
        QueryMsg::RetrieveLimitOrder {} => try_limit_order_query(deps),
    };
    pad_query_result(response, BLOCK_SIZE)
}

// acts like a gateway message handle filter
fn try_handle(
    deps: DepsMut,
    env: Env,
    _info: MessageInfo,
    msg: PrivContractHandleMsg,
) -> StdResult<Response> {
    // verify signature with stored gateway public key
    let gateway_key = CONFIG.load(deps.storage)?.gateway_key;
    deps.api
        .secp256k1_verify(
            msg.input_hash.as_slice(),
            msg.signature.as_slice(),
            gateway_key.as_slice(),
        )
        .map_err(|err| StdError::generic_err(err.to_string()))?;

    // determine which function to call based on the included handle
    let handle = msg.handle.as_str();
    match handle {
        "create_limit_order" => try_create_limit_order(deps, env, msg.input_values, msg.task, msg.input_hash),
        _ => Err(StdError::generic_err("invalid handle".to_string())),
    }
}

fn try_create_limit_order(
    deps: DepsMut,
    _env: Env,
    input_values: String,
    task: Task,
    input_hash: Binary,
) -> StdResult<Response> {
    let config = CONFIG.load(deps.storage)?;

    let input: Input = serde_json_wasm::from_str(&input_values)
        .map_err(|err| StdError::generic_err(err.to_string()))?;

    let user = input.user; 

    let target_price = input.target_price;
    
    let usdc_amount = input.usdc_amount;

    let limit_order = LimitOrder {
        user: user.clone(),
        usdc_amount: usdc_amount.clone(),
        target_price: target_price.clone(),
    };

    STORED_LIMIT_ORDER
        // .add_suffix(user.as_bytes())
        .insert(deps.storage, &true, &limit_order)?;

        let data = ResponseStoreLimitOrderMsg {
            message: "Confidential limit order stored successfully".to_string(),
        };
    
        let json_string =
            serde_json_wasm::to_string(&data).map_err(|err| StdError::generic_err(err.to_string()))?;
    
        let result = base64::encode(json_string);

    let callback_msg = GatewayMsg::Output {
        outputs: PostExecutionMsg {
            result,
            task,
            input_hash,
        },
    }
    .to_cosmos_msg(
        config.gateway_hash,
        config.gateway_address.to_string(),
        None,
    )?;

    Ok(Response::new()
        .add_message(callback_msg)
        .add_attribute("status", "Limit order stored successfully"))
}

fn try_limit_order_query(deps: Deps) -> StdResult<Binary> {
    let value = STORED_LIMIT_ORDER
        // .add_suffix(user.as_bytes())
        .get(deps.storage, &true)
        .ok_or_else(|| StdError::generic_err("Value not found"))?;

    to_binary(&ResponseRetrieveLimitOrderMsg {
        user: value.user,
        usdc_amount: value.usdc_amount,
        target_price: value.target_price,
    })
}


