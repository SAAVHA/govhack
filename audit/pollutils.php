<?php
require_once(dirname(__FILE__) . '/../db/tables.php');


function write_poll_log($app_id, $msg, $start_ts, $end_ts)
{
    $pdo = connect_to_db();
    
    $stmt = $pdo->prepare('INSERT INTO ' . APP_POLL_LOG_CLASS .
            '(app_id, message, start_ts, end_ts) ' .
            'VALUES (:app_id, :msg, :start_ts, :end_ts)');
    $stmt->execute(array('app_id'=>$app_id,
                         'msg'=> $msg,
                         'start_ts'=> $start_ts,
                         'end_ts'=> $end_ts));
    
    $stmt = null;
    $pdo = null;
}
