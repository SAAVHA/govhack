<?php
// Functions to support logging of the archive data.
require_once(dirname(__FILE__) . '/../blockchain/tierion.php');
require_once(dirname(__FILE__) . '/../audit/archiveutils.php');


function get_periodic_log_last_entry_ts($pdo, $app_id, $default_start_ts)
{
    $stmt = $pdo->prepare('SELECT end_ts FROM ' . PERIODIC_LOG_CLASS .
            ' WHERE app_id=:app_id' .
            ' ORDER BY create_ts DESC LIMIT 1');
    $stmt->execute(array('app_id'=> $app_id));

    $end_ts_row = $stmt->fetch();
    if ($end_ts_row) {
        $default_start_ts = (int)$end_ts_row['end_ts'];
    }

    $stmt = null;

    return $default_start_ts;
}

function get_archive_data_hash_list($pdo, $app_id, $start_ts, $end_ts)
{
    // Get archive data hashes for the given app id between the given times
    $sql = 'SELECT t2.hash FROM ' . ARCHIVE_DATA_CLASS . ' t1 ' .
            '	LEFT JOIN ' . ARCHIVE_RAW_DATA_CLASS . ' t2 ' .
            '       LEFT JOIN ' . ARCHIVE_DATA_PROOF_CLASS . ' t3 ON ' .
            '       t2.data_id = t3.data_fk ' .
            '	ON t1.archive_data_id = t2.archive_data_fk ' .
            'WHERE t1.app_id = :app_id AND ' .
            '   t3.ts >= :start_ts AND t3.ts < :end_ts ' .
            'ORDER BY t3.ts';

    $stmt = $pdo->prepare($sql);
    $stmt->execute(array('app_id'=> $app_id,
                         'start_ts'=> $start_ts,
                         'end_ts'=> $end_ts));

    $hashes = [];
    $hash_row = $stmt->fetch();
    while ($hash_row) {
        $hashes[] = $hash_row['hash'];
        $hash_row = $stmt->fetch();
    }
    $stmt = null;

    return $hashes;
}

function create_json_from_hash_list($app_id, $hash_list, $log_start_ts, $log_end_ts, $log_create_ts, $salt)
{
    $out_arr = array($app_id, (int)$log_start_ts, (int)$log_end_ts, 
                    (int)$log_create_ts, $hash_list, $salt);

    return get_canonical_json_string($out_arr);
}

