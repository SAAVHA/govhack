<?php
require_once(dirname(__FILE__) . '/../blockchain/tierion.php');
require_once(dirname(__FILE__) . '/../blockchain/blockexplorer.php');
require_once(dirname(__FILE__) . '/../audit/archiveutils.php');
require_once(dirname(__FILE__) . '/../audit/logutils.php');

function write_audit_data_log($audit_data, $poll_id=NULL) 
{
    if ($audit_data) {
        $pdo = connect_to_db();
        $stmt = $pdo->prepare('INSERT INTO ' . APP_AUDIT_LOG_CLASS . 
                            ' (audit_id, create_ts, num_suspicious, num_restored, app_id, audit_description, poll_id)' .
                            ' VALUES (:audit_id, :create_ts, :num_suspicious, :num_restored, :app_id, :audit_description, :poll_id)');
        $stmt->execute(array('audit_id'=> $audit_data['audit_id'],
                             'create_ts'=> time(),
                             'num_suspicious'=> $audit_data['num_suspicious'],
                             'num_restored'=> 0,
                             'app_id'=>$audit_data['app_id'],
                             'audit_description'=> 'Initial data audit (read-only)',
                             'poll_id'=> $poll_id
        ));
        $stmt = null;
        $pdo = null;
    }
}

function log_error_array($start_ts, $end_ts, $err_str)
{
    return array('start_ts'=> $start_ts,
                 'end_ts'=> $end_ts,
                 'error'=> $err_str,
                 'changes'=> 'Archive data possibly deleted'
    );
}

