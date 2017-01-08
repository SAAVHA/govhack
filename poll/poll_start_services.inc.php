<?php
include_once dirname(__FILE__) . '/process.inc.php';  

class POLL 
{
    private $db;
    private $source_table;
    private $processes = [];
    
    function __construct() 
    {
        global $db_connect_info;
        $this->db = new DB($db_connect_info);
        $this->db->reconnect = true;
    }

    function start($source_table)
    {
        $rs = $this->db->query( "select * from poll where status='not running';");
        
        while($row=$this->db->fetch_array($rs))
        {
            $poll_id = $row['poll_id'];
            
            foreach ($json as $i => $poll_list)
            {
		$this->processes[] = new Process("php poll_db.php $poll_id $j");
            }
        }
        self::stop_service();
    }
    
    function stop_service()
    {
        $this->db->disconnect();
    }
}

