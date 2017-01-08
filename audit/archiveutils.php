<?php
require_once(dirname(__FILE__) . '/../blockchain/tierion.php');


function get_hash_salt() 
{
    return bin2hex(random_bytes(32));
}

function do_hashing($input_str) 
{
    return hash('sha256', $input_str);
}


function get_canonical_json_string($json_obj)
{
    return json_encode($json_obj);
}

function create_canonical_audit_data_hash($app_id, $db_id, $user_id, $data_id, $app_reference, 
        $data_bytes, $salt, $archive_ts, $ts)
{
    $canonical_json_str = get_canonical_json_string(
            array($app_id, $db_id, $user_id, $data_id, $app_reference, 
                            bin2hex($data_bytes), (int)$archive_ts, (int)$ts, $salt));
    $hash = do_hashing($canonical_json_str);
    return $hash;
}

function get_raw_data_for_time_window($pdo, $app_id, $start_ts, $end_ts) 
{
    $stmt = 'SELECT t2.data_id, t2.archive_data_fk, t2.user_id, t2.data,'.
            '    t2.salt, t2.hash, t2.create_ts, t2.receipt_json,' .
            '    UNIX_TIMESTAMP(t2.ts) as ts ' .
            ' FROM ' . ARCHIVE_DATA_CLASS . ' t1 ' .
            '   LEFT JOIN ' . ARCHIVE_RAW_DATA_CLASS . ' t2 ' .
            '   ON t1.archive_data_id = t2.archive_data_fk' .
            ' WHERE t1.app_id = :app_id ' .
            '    AND t2.create_ts < :time_end ' .
            '    AND t2.create_ts >= :time_start ' .
            ' ORDER BY create_ts';
    $stmt = $pdo->prepare($stmt);
    $stmt->execute(array('app_id'=> $app_id,
                         'time_end'=> $end_ts,
                         'time_start'=> $start_ts));
    $stmt->setFetchMode(PDO::FETCH_CLASS, 'ArchiveRawData');

    $data_objs = [];
    $data_obj = $stmt->fetch();
    while ($data_obj) {
        $data_objs[] = $data_obj;
        $data_obj = $stmt->fetch();
    }

    $stmt = null;
    return $data_objs;
}


function check_audit_data_row_consistency($row_obj, $proof_obj)
{
    assert($row_obj->audit_data_id === $proof_obj->audit_data_id);
    $hash = create_canonical_audit_data_hash($row_obj->data_id, $row_obj->user_id,
            $row_obj->app_id, $row_obj->saved_data, $row_obj->create_ts);
    if ($hash !== $row_obj->hash) return 'Data hash does not match stored hash';
    $valid_bc = check_hash_against_blockchain($row_obj->hash, $proof_obj->proof_json,
            $row_obj->create_ts);
    if ($valid_bc) return $valid_bc;

    return null;
}


