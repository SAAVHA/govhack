<?php
require_once(dirname(__FILE__) . '/../audit/logutils.php');

function create_all_logs($lookback_min, $window_min)
{
    $pdo = connect_to_db();

    $stmt = $pdo->prepare('SELECT DISTINCT app_id FROM ' . ARCHIVE_DATA_CLASS);
    $stmt->execute();
    
    $app_ids = [];
    $data_row = $stmt->fetch();
    while ($data_row) {
        $app_ids[] = $data_row['app_id'];
        $data_row = $stmt->fetch();
    }
    $stmt = null;
    $pdo = null;
    
    foreach ($app_ids as $app_id) {
        print('Creating log for ' . $app_id . PHP_EOL);
        create_log($app_id, $lookback_min, $window_min);
    }
}

function create_log($app_id, $lookback_min, $window_min) 
{
    $pdo = connect_to_db();

    $now_ts = time();
    $end_ts = $now_ts - 60 * $lookback_min;
    $start_ts = $end_ts - 60 * $window_min;
    $start_ts = get_periodic_log_last_entry_ts($pdo, $app_id, $start_ts);
    $fmt = 'Y-m-d H:i:s';
    $hash_list = get_archive_data_hash_list($pdo, $app_id, $start_ts, $end_ts);
    $salt = get_hash_salt();
    $log_json_str = create_json_from_hash_list($app_id, $hash_list, $start_ts, $end_ts, $now_ts, $salt);
    $hash = do_hashing($log_json_str);
    $stmt = $pdo->prepare("INSERT INTO " . PERIODIC_LOG_CLASS .
            '(app_id, start_ts, end_ts, create_ts, salt, hash) ' .
            "VALUES (:app_id, :start_ts, :end_ts, :create_ts, :salt, :hash)");
    $stmt->execute(array('app_id'=> $app_id,
                         'start_ts'=> $start_ts,
                         'end_ts'=> $end_ts,
                         'create_ts'=> $now_ts,
                         'salt'=> $salt,
                         'hash'=> $hash,
                         ));
    $stmt = null;
    $pdo = null;
}

