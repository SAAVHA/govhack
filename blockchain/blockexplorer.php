<?php
require_once(dirname(__FILE__) . '/../utilities/webutils.php');

define('MAX_CREATE_TS_BC_TS_DIFF_MINUTES', 30);

function check_proof_is_on_bc($merkle_root, $bc_source, $unix_proof_ts)
{
    $url = 'https://blockexplorer.com/api/tx/' . $bc_source;
    $resp = do_curl($url);
    if (strpos($resp, $merkle_root) === false) return 'Merkle root not found on blockchain';

    return null;
}
