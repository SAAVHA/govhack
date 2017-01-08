<?php
// Web endpoint for getting the specifics of a past audit
//
// Listens on a webserver for GETs
//
// Requires a GET parameters audit, which is the audit to query
//
// Echoes information to std out
require_once(dirname(__FILE__) . '/../db/connect.php');
require_once(dirname(__FILE__) . '/../db/tables.php');

$audit_id = @$_GET['audit'] ?: null;
if (!$audit_id) {
    print('audit ID required');
    return;
}

/////////////

$pdo = connect_to_db();
$stmt = $pdo->prepare('SELECT * FROM ' . APP_AUDIT_LOG_CLASS .
        ' WHERE audit_id=:audit_id');
$stmt->execute(array('audit_id'=> $audit_id));

$row = $stmt->fetch(PDO::FETCH_ASSOC);
$stmt = null;
$pdo = null;

if (!$row) {
    print('audit id not found: ' . $audit_id);
    return;
}
    
print(json_encode($row));


