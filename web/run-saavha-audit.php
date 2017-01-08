<?php
// Web endpoint for running a Google Calendar audit
// 
// Listens on a webserver for GETs
//
// Optionally takes GET parameters 'start' and 'end', each are unix timestamps,
//      and 'app' which is an app id
//
// Echoes information to std out
require_once(dirname(__FILE__) . '/../api/internal-audit-api.php');

$day_secs = 86400;

$end_ts = @$_GET['end'] ?: time() - 60*60;   // an hour ago
$start_ts = @$_GET['start'] ?: $end_ts - $day_secs;     // a day before that
$app_id = @$_GET['app'] ?: NULL;

if ($app_id) {
    print(json_encode(run_internal_audit($app_id, $start_ts, $end_ts)));
} else {
    print(json_encode(audit_all_apps($start_ts, $end_ts)));
}

