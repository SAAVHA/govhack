<?php


function get_poll_qid_from_identifier($saavha_db, $sql, $identifier_value)
{
    $identifier_value = $saavha_db->escape($identifier_value);
    $queryid_sql = "select id from poll_query_id where value = '$identifier_value';";
    $rs = $saavha_db->query($queryid_sql);
    $row = $saavha_db->fetch_array($rs);
    $qid = $row['id'];
    
    return $qid;
}

function get_poll_quid_from_info($saavha_db, $db_info, $table_arr)
{
    $rs = $saavha_db->query("select * from poll_query_id");
    while ($row = $saavha_db->fetch_array($rs)) {
        $arr = json_decode($row['value'], true);
        if ($arr['server'] == $db_info['server'] &&
                $arr['db'] == $db_info['name'] &&
                $arr['table'] == $table_arr['name'] &&
                $arr['fields'] == $table_arr['fields']) {
                    
            return $row['id'];
        }
    }
    return 0;
}


function get_poll_data_ids_rows($client_db, $sql, $query_arr, & $cid, & $timestamp_column)
{
    $cid = $query_arr['id_column'];
    $timestamp_column = @$query_arr['timestamp_column'] ?: '';
    
    $data_rows = [];
    $rs = $client_db->query($sql);
    while ($row = $client_db->fetch_array($rs)) {
        $data_rows[] = $row;
    }
    
    return $data_rows;
}


function create_data_array_from_poll_query($qid, $cid, $timestamp_column, $data_rows)
{
    $query_data = [];

    $query_data['qid'] = $qid;
    $query_data['cid'] = $cid;
    $query_data['data'] = $data_rows;
    $query_data['timestamp_column'] = $timestamp_column;
    
    return $query_data;
            
}
