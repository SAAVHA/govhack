<?php
require_once dirname(__FILE__) . '/../poll/config.inc.php';     // for $db_connect_info
require_once dirname(__FILE__) . '/../poll/dbi.php';    //database class.
require_once dirname(__FILE__) . '/../poll/mysql_poll_utils.php';  
require_once dirname(__FILE__) . '/../db/tables.php';

function update_start_end_ts($ts, & $start_ts, & $end_ts)
{
    $ts = (int) $ts;
    if (!$start_ts || $ts < $start_ts) {
        $start_ts = $ts;
    }
    if (!$end_ts || $ts > $end_ts) {
        $end_ts = $ts;
    }
    
}

function update_array_json(& $arr)
{
    for ($i=0; $i < count($arr); $i++) {
        if (array_key_exists('app', $arr[$i])) {
            $app_json = json_decode($arr[$i]['app'], true);
            $app_json['saavhaSelected'] = false;
            $arr[$i]['app'] = $app_json;
        }
    
        if (array_key_exists('saavha', $arr[$i])) {
            $saavha_json = json_decode($arr[$i]['saavha'], true);
            $saavha_json['saavhaSelected'] = false;
            $arr[$i]['saavha'] = $saavha_json;
        }
    
        $hists = $arr[$i]['fullHistory'];
        for ($j = 0; $j < count($hists); $j++) {
            $hists_json = json_decode($hists[$j], true);
            $hists_json['saavhaSelected'] = false;
            $hists[$j] = $hists_json;
        }
        $arr[$i]['fullHistory'] = $hists;
    }
}


function audit_mysql_poller_data($app_id, $poll_id=1) 
{
    global $db_connect_info;

    $start_ts = null;
    $end_ts = null;

    
    $poll_index = 0;
    $db = new DB($db_connect_info);
    $db->reconnect = true;
    $rs = $db->query("select * from poll where poll_id = $poll_id ;");
    $row = $db->fetch_array($rs);
    if (!$row) return array();

    $db_json = json_decode($row['poll_json'], true);
    if (!array_key_exists($app_id, $db_json)) return array();
    $db_json = $db_json['poll'][$poll_index];

    $db_info = $db_json['db'];
    $connect_info = array('name' => $db_info['name'], 
                          'server' => $db_info['server'], 
                          'user' => $db_info['user'], 
                          'pw' => $db_info['pwd'], 
                          'dbtype' => $db_info['type']);
    $client_db = new DB($connect_info);
    $client_db->reconnect = true;
    $client_db->report_err = true;
    $client_data = [];
    $timestamp_columns = [];
    if (array_key_exists('tables', $db_info)) {
        foreach ($db_info['tables'] as $table_arr) {
            $sql = "select " . $table_arr['fields'] . " from " . $table_arr['name'] . " ;";
            $qid = get_poll_quid_from_info($db, $db_info, $table_arr);
            $data_rows = get_poll_data_ids_rows($client_db, $sql, $table_arr, $cid, $timestamp_column);
            $query_data = create_data_array_from_poll_query($qid, $cid, $timestamp_column, $data_rows);
            $query_key = $table_arr['name'];
            $client_data[$query_key] = $query_data;

            if ($timestamp_column) {
                $timestamp_columns[$query_key] = $timestamp_column;
            } else {
                return 'Timestamp column required!';
            }
        }
    }

    $saavha_data = [];

    foreach ($client_data as $client_key=>$client_arr) {
        $arch_rows = [];
        $sql = 'SELECT * FROM ' . ARCHIVE_DATA_CLASS . " WHERE db_id='" . $client_arr['qid'] . "' ;";
        $res = $db->query($sql);
        while ($row = $db->fetch_array($res)) {
            $arch_rows[] = $row;
        }
        
        $all_rows = [];
        foreach ($arch_rows as $arch_row) {
            $sql = 'SELECT * FROM ' . ARCHIVE_RAW_DATA_CLASS . ' t1 ' .
                   ' WHERE archive_data_fk=' . $arch_row['archive_data_id'] . 
                   ' ORDER BY create_ts DESC;';
            $res = $db->query($sql);
            $raw_data_rows = [];
            while ($row = $db->fetch_array($res)) {
                $raw_data_rows[] = $row;
                update_start_end_ts($row['create_ts'], $start_ts, $end_ts);
            }
            
            $all_rows[] = $raw_data_rows;
        }
            
        $saavha_data[$client_key] = $all_rows;
    }

    $db->disconnect();
    $client_keys = array_keys($client_data);
    $out_data = [];
    
    foreach ($client_keys as $client_key)
    {
        $conflict_array = [];
        $ts_col = $timestamp_columns[$client_key];
        $saavha_arr = $saavha_data[$client_key];
        foreach ($saavha_arr as $saavha_data_list_list) {
                $first_row_arr = $saavha_data_list_list[0];
                $second_row_arr = $saavha_data_list_list[1];
                $first_ts = $first_row_arr['data'][$ts_col];
                $second_json = json_decode(, true);
                $second_ts = $second_row_arr['data'][$ts_col];
                
                if ($first_ts == $second_ts &&
                        $first_row_arr['data'] != $second_row_arr['data']) {
                    $saavha_data = [];
                    $app_data = [];
                    $full_history = [];
                            
                    for ($i = 0; $i < count($saavha_data_list_list); $i++) {
                        $row_data = $saavha_data_list_list[$i];
                        $data_arr = json_decode($row_data['data'], true);
                        $row_json = json_encode($data_arr);
                        $full_history[] = $row_json;
                        if ($i == 0) $app_data = $row_json;
                        if ($i == 1) $saavha_data = $row_json;
                    }
                    
                    $conflict_array[] = array('app'=> $app_data,
                                              'saavha'=> $saavha_data,
                                              'fullHistory'=> $full_history);
                }
            }
        }
        
        $out_data[$client_key] = array('conflict_array'=> $conflict_array,
                                       'app_only'=> [],
                                       'saavha_only'=> []);
    }
        
    $audit_out = [];
    $num_suspicious = 0;
    foreach ($client_keys as $client_key) {
        $out_arr = $out_data[$client_key];
        $conflict_array = $out_arr['conflict_array'];
        $app_only = $out_arr['app_only'];
        $saavha_only = $out_arr['saavha_only'];
        update_array_json($conflict_array);
        update_array_json($app_only);
        update_array_json($saavha_only);
        $audit_out[$client_key] = array('conflict_array'=>$conflict_array,
                                        'app_only'=>$app_only,
                                        'saavha_only'=>$saavha_only);
        $num_suspicious = $num_suspicious + count($conflict_array) + count($app_only) + count($saavha_only);
    }

    $to_return = array('audit_id'=> random_int(1000000, 9999999),
                       'app_id'=> $app_id,
                       'start_ts'=> $start_ts,
                       'end_ts'=> $end_ts,
                       'app_type'=> 'mysql',
                       'tables'=>$client_keys,
                       'num_suspicious'=> $num_suspicious
    );
    foreach ($client_keys as $client_key) {
        $to_return[$client_key] = $audit_out[$client_key];
    }
       
    return $to_return;
}



