<?php
require_once(dirname(__FILE__) . '/../db/connect.php');
require_once(dirname(__FILE__) . '/../db/tables.php');
require_once(dirname(__FILE__) . '/../utilities/dbutils.php');
require_once(dirname(__FILE__) . '/../api/google-calendar-poll-api.php');

function run_all_polls()
{
    $pdo = connect_to_db();

    $stmt = $pdo->prepare('SELECT * FROM ' . APP_CONFIG_CLASS .
            ' WHERE enabled=1 AND poll_seconds IS NOT NULL');
    $stmt->execute();
    $configs = get_class_data_list($stmt, 'AppConfig');
    $stmt = null;
    $pdo = null;
    
    foreach ($configs as $config_obj) {
        print('Found app: ' . $config_obj->app_id . 
                ', type: ' . $config_obj->app_type_id . PHP_EOL);
        run_app_poll($config_obj);
    }

    print('Done' . PHP_EOL);
}

function run_app_poll($app_config_obj) 
{
    $pdo = connect_to_db();
    $stmt = $pdo->prepare('SELECT * FROM ' . APP_POLL_LOG_CLASS .
            ' WHERE app_id = :app_id' . 
            ' ORDER BY ts DESC ' . 
            ' LIMIT 1');
    $stmt->execute(array('app_id'=>$app_config_obj->app_id));
    $stmt->setFetchMode(PDO::FETCH_CLASS, 'AppPollLog');
    
    $log_obj = $stmt->fetch();
    $stmt = null;
    $pdo = null;
    
    $time_since_last = time() - $last_time;
    $poll_secs = (int)($app_config_obj->poll_seconds);
    if ( $time_since_last >= $poll_secs) {
        print('   Running.  Time since last: ' . $time_since_last . 
                ', poll time = ' . $poll_secs . PHP_EOL);
        
        if ($time_since_last > MAX_POLL_MULTIPLIER * $poll_secs) {
            $start_ts = time() - MAX_POLL_MULTIPLIER * $poll_secs;
        } else {
            $start_ts = $last_time;
        }
        print('   Poll start: '. $start_ts . PHP_EOL);
        
        get_poll_type_and_run($app_config_obj, $start_ts);
        
    } else {
        print('   Skipping.  Time since last: ' . $time_since_last . 
                ', poll time = ' . $poll_secs . PHP_EOL);
    }
}

function get_poll_type_and_run($app_config_obj, $start_ts) 
{
    switch($app_config_obj->app_type_id) {
        case 'google-calendar':
            run_google_calendar_poll($app_config_obj->app_id, 
                    json_decode($app_config_obj->config_json, true), 
                    $start_ts);
            break;
        default:
            print('*** APP TYPE NOT FOUND: ' . $app_config_obj->app_type_id . PHP_EOL);
            print('*** SKIPPING *** ' . PHP_EOL);
    }

}

