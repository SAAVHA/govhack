<?php
error_reporting(E_ALL);
set_time_limit(0);

include_once dirname(__FILE__) . '/poll_start_services.inc.php';

$poll = new POLL();
$poll->start("poll");
$pids = implode(', ', $poll->get_pids());

echo "\nThe poll server has launched the following background polling processes: $pids.\n";