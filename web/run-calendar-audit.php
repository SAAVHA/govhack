<?php
// Web endpoint for running a SAAVHA internal consistency audit.
// 
// Listens on a webserver for GETs
//
// Optionally takes GET parameters 'start' and 'end', each are unix timestamps,
//      and 'app' which is an app id
//
// Echoes information to std out
require_once(dirname(__FILE__) . '/../api/google-calendar-audit-api.php');
require_once(dirname(__FILE__) . '/../audit/auditutils.php');

$day_secs = 86400;

$start_ts = @$_GET['start'] ?: time() - 7 * $day_secs;
$end_ts = @$_GET['end'] ?: time() + 7 * $day_secs;
$app_id = @$_GET['app'] ?: 'testpoll1';

$audit_data = audit_google_calendar_data($app_id, $start_ts, $end_ts);

write_audit_data_log($audit_data);

print(json_encode($audit_data));
