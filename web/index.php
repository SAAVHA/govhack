<?php
if(isset($_POST['func'])){
    # remove any unexpected post variables
    foreach($_POST as $key => $val){
        if(!in_array($key, array('func', 'id'))){
            unset($_POST[$key]);
        } else if($key == 'func' && !is_string($val)){
            unset($_POST[$key]);
        } else if($key != ''){
            $$key = $val;
        }
    }

    // print_r(get_defined_vars());
    if(!isset($func)){http_response_code(404); exit;}

    if($func == 'get_client_apps'){
        ### for now we are going to fake the data however
        header('Content-Type: application/json');
        echo curl_page('https://saavha.com/colin/web/get-poll-info.php');
        exit;
    }

    if($func == 'get_previous_audits'){
        
        header('Content-Type: application/json');
        if(!is_numeric($_POST['id'])){echo '"[]"'; exit;}
        echo curl_page('https://saavha.com/colin/web/get-past-audit-summaries.php?app_id=poll&poll_id=' . $_POST['id']);
        // echo '[{"audit_id":"6279049","create_ts":"1483643887","num_suspicious":"5","num_restored":"0","app_id":"poll"},{"audit_id":"8658107","create_ts":"1483643399","num_suspicious":"5809","num_restored":"0","app_id":"poll"},{"audit_id":"9821418","create_ts":"1483643189","num_suspicious":"5809","num_restored":"0","app_id":"poll"},{"audit_id":"3935649","create_ts":"1483627412","num_suspicious":"5809","num_restored":"0","app_id":"poll"},{"audit_id":"5810458","create_ts":"1483593909","num_suspicious":"0","num_restored":"0","app_id":"poll"},{"audit_id":"3188614","create_ts":"1483593772","num_suspicious":"0","num_restored":"0","app_id":"poll"},{"audit_id":"8622078","create_ts":"1483593501","num_suspicious":"0","num_restored":"0","app_id":"poll"}]';
        // echo $prev_audits;
        exit;
    }

    if($func == 'get_changes'){
        header('Content-Type: application/json');
        if(!is_numeric($_POST['id'])){echo '[]'; exit;}
        echo curl_page('https://saavha.com/colin/web/run-mysql-audit.php?app_id=poll&poll_id=' . $_POST['id']);
        exit;
        // echo '{"audit_id":6055486,"app_id":"poll","start_ts":1475374820,"end_ts":1483691376,"app_type":"mysql","tables":["PATIENT"],"num_suspicious":5,"PATIENT":{"conflict_array":[],"app_only":[{"app":{"ID":"2","NAME":"Adam","FAMILY":"West","PID":"333222114","TS":"2016-10-01 21:20:20","VID":"1111","SS":"213232114","DOB":"1985-10-26 00:00:00","HASH":null,"saavhaSelected":false},"fullHistory":[{"ID":"2","NAME":"Adam","FAMILY":"West","PID":"333222114","TS":"2016-10-01 21:20:20","VID":"1111","SS":"213232114","DOB":"1985-10-26 00:00:00","HASH":null,"saavhaSelected":false}]},{"app":{"ID":"3","NAME":"Beth","FAMILY":"Carlson","PID":"444339988","TS":"2016-10-01 21:20:20","VID":"2222","SS":"445678887","DOB":"1970-10-16 00:00:00","HASH":null,"saavhaSelected":false},"fullHistory":[{"ID":"3","NAME":"Beth","FAMILY":"Carlson","PID":"444339988","TS":"2016-10-01 21:20:20","VID":"2222","SS":"445678887","DOB":"1970-10-16 00:00:00","HASH":null,"saavhaSelected":false}]},{"app":{"ID":"4","NAME":"Gerald","FAMILY":"Hogan","PID":"89877822","TS":"2016-10-01 21:20:20","VID":null,"SS":"239443115","DOB":"1972-10-16 00:00:00","HASH":null,"saavhaSelected":false},"fullHistory":[{"ID":"4","NAME":"Gerald","FAMILY":"Hogan","PID":"89877822","TS":"2016-10-01 21:20:20","VID":null,"SS":"239443115","DOB":"1972-10-16 00:00:00","HASH":null,"saavhaSelected":false}]},{"app":{"ID":"5","NAME":"Betsy","FAMILY":"Bates","PID":"89734776","TS":"2016-10-01 21:20:20","VID":null,"SS":"34858447","DOB":"1970-10-11 00:00:00","HASH":null,"saavhaSelected":false},"fullHistory":[{"ID":"5","NAME":"Betsy","FAMILY":"Bates","PID":"89734776","TS":"2016-10-01 21:20:20","VID":null,"SS":"34858447","DOB":"1970-10-11 00:00:00","HASH":null,"saavhaSelected":false}]},{"app":{"ID":"6","NAME":"Justin","FAMILY":"Poole","PID":"877445224","TS":"2017-01-06 02:29:36","VID":null,"SS":"37854775","DOB":"1960-10-16 00:00:00","HASH":null,"saavhaSelected":false},"fullHistory":[{"ID":"6","NAME":"Justin","FAMILY":"Poole","PID":"877445224","TS":"2017-01-06 02:29:36","VID":null,"SS":"37854775","DOB":"1960-10-16 00:00:00","HASH":null,"saavhaSelected":false}]}],"saavha_only":[]}}';

        exit;
    }

//     Okay, @tiggerslowski Here are your endpoints:
// ```
// 1. https://saavha.com/colin/web/get-past-audit-summaries.php    
// Get summaries of the data.  optional query params: app (app_id), start (unix timestamp to start), end (unix timestamp to end)
//             Defaults to all app_ids, start is 1 day ago, end is now

// 2.  https://saavha.com/colin/web/get-past-audit-detail.php
// Gets detail of a single audit (for now, just the summary plus a 65535-character long description, I'll let the restore function go into detail.  Running an audit just says "initial data audit")
// Required query parameter: audit (audit_id)

// 3. https://saavha.com/colin/web/run-mysql-audit.php
// Runs a data audit for a mysql poller.  Optional query parameters: app_id (app id, defaults to 'poll' and probably shouldn't change), poll_id (ID of the poller in the database 'poll')

// (5.) https://saavha.com/colin/web/get-poll-info.php
// Returns a list of the available polls.  NOTE: this is hard-coded to match what's in the 'poll' database at this moment

// you'll have to let @greg know what you're sending him for the restore functionality.  I think what I'll do is, for each audit, send along an "audit_id" string (a uuid) to uniquely identify the audit, that way when changes are made we can update the database with that ID

    exit;
}

function curl_page($url){
	$ch=curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C)');
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);		
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);		
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);		
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
	ob_start(); // prevent any output
	return curl_exec ($ch); // Execute the Curl Command
	ob_end_clean(); // stop preventing output
	curl_close($ch);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Saavha</title>
</head>
<body>
    <div id="saavah"></div>
    <!--<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.2/semantic.min.css"></link>-->
    <link rel="stylesheet" href="css/semantic.min.css"></link>
    <script src="scripts/index.min.js" async></script>
    <style>
        /*body{
            background: url(http://blockgeeks.com/wp-content/uploads/2016/09/blockchain.jpg) no-repeat center center fixed;
            -webkit-background-size: cover;
            -moz-background-size: cover;
            -o-background-size: cover;
            background-size: cover;
        }*/
    </style>
</body>
</html>
<!-- https://www.digitalcatapultcentre.org.uk/wp-content/uploads/2016/02/connected-data.jpg -->
<!-- http://www.blockchaintechnologies.com/img/blockchain-ledger.jpg -->
<!-- https://blog.csiro.au/wp-content/uploads/2016/11/blockchain.jpg -->
<!-- http://media.coindesk.com/uploads/2016/02/shutterstock_252511228.jpg -->