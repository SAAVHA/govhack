<?php
require_once(dirname(__FILE__) . '/../config.php');
require_once(CONFIG_DIR . '/db.php');


function connect_to_db()
{
	$dbh = null;
	try {
		$dbh = new PDO('mysql:host=' . DB_SERVER . ';dbname=' . DB_DATABASE,
                        DB_USERNAME, DB_PASSWORD);
		$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	} catch (PDOException $e) {
		print($e->getMessage());
	}

	return $dbh;
}



