<?php
// Web endpoint for running a mysql audit
// 
// Listens on a webserver for GETs
//
// Optionally takes GET parameters 
//      'poll_id', the index into the poll table to run
//      'app_id', though I think this needs to be 'poll'
//
// Echoes information to std out
require_once(dirname(__FILE__) . '/../api/mysql-poller-audit-api.php');
require_once(dirname(__FILE__) . '/../audit/auditutils.php');

$poll_id = @$_GET['poll_id'] ?: 1;
$app_id = @$_GET['app_id'] ?: 'poll';

$audit_data = audit_mysql_poller_data($app_id, $poll_id);

write_audit_data_log($audit_data, $poll_id);

print(json_encode($audit_data));
