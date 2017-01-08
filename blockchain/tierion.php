<?php
// Functions to interact with tierion

require_once(dirname(__FILE__) . '/../config.php');
require_once(CONFIG_DIR . '/tierion.php');
require_once(dirname(__FILE__) . '/../db/connect.php');
require_once(dirname(__FILE__) . '/../db/tables.php');
require_once(dirname(__FILE__) . '/../utilities/webutils.php');
require_once(dirname(__FILE__) . '/blockexplorer.php');


function save_tierion_token($tierion_json, $pdo)
{
    $token = $tierion_json['access_token'];
    $refresh_token = $tierion_json['refresh_token'];
    $exp_secs = (int)$tierion_json['expires_in'];
    $expires = time() + $exp_secs;
    $stmt = $pdo->prepare("INSERT INTO " . TIERION_TOKEN_CLASS . "(token, refresh_token, expires) ".
            "VALUES (:token, :rtoken, :expires)");
    $stmt->execute(array('token'=> $token, 'rtoken'=>$refresh_token, 'expires'=> $expires));
    $stmt = null;
}

function get_new_tierion_token($pdo)
{
    $payload = array('username'=> TIERION_USER, 'password'=> TIERION_PW);
    $response = do_curl('https://hashapi.tierion.com/v1/auth/token', $payload);
    $r_json = json_decode($response, true);
    $token = $r_json['access_token'];
    save_tierion_token($r_json, $pdo);

    return $token;
}

function get_tierion_token($token_obj)
{
    if ($token_obj->expires <= time()) {
	    $payload = array("refreshToken"=> $token_obj->refresh_token);
	    $response = do_curl('https://hashapi.tierion.com/v1/auth/refresh', $payload);
	    $r_json = json_decode($response, true);
	    $token = $r_json['access_token'];
	    save_tierion_token($r_json, $pdo);

    } else {
        $token = $token_obj->token;
    }


    return $token;
}

function check_token_expired($response_json) {
    if (array_key_exists('error', $response_json)) {
        $err_msg = $response_json['error'];
        print("Error: " . $err_msg . PHP_EOL);
        if (strpos($err_msg, 'Your access token has expired') !== false) {
            get_new_tierion_token();

            $payload = array('hash' => $data_hash);
            $response = do_curl('https://hashapi.tierion.com/v1/hashitems',
                    $payload, get_tierion_header_array());
            $r_json = json_decode($response, true);
            return $r_json;
        }
    }
    return $response_json;
}

function post_tierion_hash($data_hash)
{
    $payload = array('hash' => $data_hash);
    $response = do_curl(TIERION_URL,
            $payload, get_tierion_header_array());
    $r_json = json_decode($response, true);
    $r_json = check_token_expired($r_json);
    $receipt_id = $r_json['receiptId'];
    $timestamp = (int)$r_json['timestamp'];

    return array('receipt_id'=> $receipt_id, 'timestamp'=> $timestamp);
}

function get_tierion_proof($receipt_id)
{
    $response = do_curl(TIERION_RECP,
            'https://hashapi.tierion.com/v1/receipts/' . $receipt_id,
            NULL, get_tierion_header_array());
    $r_json = json_decode($response, true);

    $receipt_json_str = $r_json['receipt'];
    return $receipt_json_str;
}



