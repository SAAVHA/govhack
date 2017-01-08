<?php
// Web endpoint for getting a list of all past audits
//
// Listens on a webserver for GETs
//
// Optionally takes GET parameters 'start' and 'end', each are unix timestamps,
//      and 'app' which is an app id
//
// Echoes information to std out
require_once(dirname(__FILE__) . '/../db/connect.php');
require_once(dirname(__FILE__) . '/../db/tables.php');

$day_secs = 86400;

$end_ts = @$_GET['end'] ?: time();   // now
$start_ts = @$_GET['start'] ?: $end_ts - $day_secs;     // a day before that
$app_id = @$_GET['app_id'] ?: NULL;
$poll_id = @$_GET['poll_id'] ?: NULL;

/////////////

$pdo = connect_to_db();

$sql = 'SELECT audit_id, create_ts, num_suspicious, num_restored, app_id ' .
        ' FROM ' . APP_AUDIT_LOG_CLASS .
        ' WHERE create_ts >= :start_ts' .
        '   AND create_ts < :end_ts ';
$exec_arr = array('start_ts'=> $start_ts,
                'end_ts'=> $end_ts);
if ($app_id) {
    $sql .= ' AND app_id = :app_id ';
    $exec_arr['app_id'] = $app_id;
}
if ($poll_id) {
    $sql .= ' AND poll_id = :poll_id ';
    $exec_arr['poll_id'] = $poll_id;
}
$sql .= ' ORDER BY create_ts DESC';
$stmt = $pdo->prepare($sql);
$stmt->execute($exec_arr);

$out = [];
$row = $stmt->fetch(PDO::FETCH_ASSOC);
while ($row) {
    $out[] = $row;
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
}

$stmt = null;
$pdo = null;

print(json_encode($out));
