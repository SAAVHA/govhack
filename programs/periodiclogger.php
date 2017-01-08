<?php
require_once(dirname(__FILE__) . '/../api/create-log-api.php');


define('LOG_WINDOW_MIN', 5);
define('LOG_LOOKBACK_MIN', 20);

create_all_logs(LOG_LOOKBACK_MIN, LOG_WINDOW_MIN);

