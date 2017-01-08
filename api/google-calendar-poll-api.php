<?php
require_once(dirname(__FILE__) . '/../googlecalendar/calendar-api.php');
require_once(dirname(__FILE__) . '/../audit/pollutils.php');
require_once(dirname(__FILE__) . '/../api/store-data-api.php');


function run_google_calendar_poll($app_id, $config_arr, $start_ts) 
{
    $config_file = $config_arr['config_file'];
    $secret_file = $config_arr['secret_file'];
    $calendar_id = $config_arr['calendar_id'];
    $event_ts_tuple = get_recent_change_google_calendar_events(
            $start_ts, $config_file, $secret_file, $calendar_id);
    $data_arr = create_canonical_event_array($event_ts_tuple['events'], 
                    $config_arr['field_names'], $calendar_id, $app_id);
    foreach($data_arr as $data) {
        store_data($data['app_id'], $data['db_id'], $data['user_id'], 
                $data['data_id'], '', $data['json']);
    }
    write_poll_log($app_id, "Success.  Records written: " . count($data_arr), 
                    $start_ts, $event_ts_tuple['end_ts']);
}
