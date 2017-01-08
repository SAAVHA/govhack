<?php
// Library functions to interact with google calendar
require_once(dirname(__FILE__) . '/../config.php');
require_once(dirname(__FILE__) . '/../googlecalendar/calendarfunctions.php');
require_once(CONFIG_DIR . '/googlecalendar.php');

function get_recent_change_google_calendar_events($start_ts, $config_file,
                                                  $secret_file, $calendar_id)
{
    $service = get_google_calendar_service(SAAVHA_APP_NAME, 
                            $secret_file, $config_file);

    // Get all events changed in the last CHANGE_POLLING_TIME_MINUTES minutes
    $optParams = array('orderBy' => 'updated',
                       'singleEvents' => TRUE,
                       'updatedMin' => date('c', $start_ts),
    );
    $results = $service->events->listEvents($calendar_id, $optParams);
    $ts = time();

    // Pull a json object for each one
    $out_arr = [];
    if (count($results->getItems()) !== 0) {
        foreach ($results->getItems() as $event) {
            $out_arr[] = $event;
        }
    }
    return array('events'=>$out_arr, 'end_ts'=>$ts);
}

function create_canonical_event_array($events, $field_names, $db_id, $app_id) 
{
    $out_list = [];
    
    foreach ($events as $event) {
        $out_arr = [];

        // Creates a canonical JSON string representation of a single Google Calendar Event
        foreach ($field_names as $field_name) {
            switch ($field_name) {
                
                case 'summary':
                    $val = $event->getSummary();
                    break;
 
                default:
                    $val = $event->$field_name;
            }
            
            $out_arr[$field_name] = $val;
        }
        
        if ($event->creator) {
            $creator_email = $event->creator->email;
        } else {
            $creator_email = '';
        }

        $out_list[] = array('json'=> json_encode($out_arr));
    }
    
    return $out_list;
}



function get_google_calendar_events_by_time($config_file,
                  $secret_file, $calendar_id, $start_ts, $end_ts)
{
    $service = get_google_calendar_service(SAAVHA_APP_NAME, 
                                $secret_file, $config_file);

    // Get all events changed in the last CHANGE_POLLING_TIME_MINUTES minutes
    $optParams = array('orderBy' => 'startTime',
                       'showDeleted' => TRUE,
                       'singleEvents' => TRUE,
                       'timeMax' => date('c', $end_ts),
                       'timeMin' => date('c', $start_ts),
    );
    $results = $service->events->listEvents($calendar_id, $optParams);
    $ts = time();

    // Pull a json object for each one
    $out_arr = [];
    if (count($results->getItems()) !== 0) {
        foreach ($results->getItems() as $event) {
            $out_arr[] = $event;
        }
    }
    return $out_arr;
}

