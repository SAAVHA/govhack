<?php
require_once(dirname(__FILE__) . '/../blockchain/tierion.php');
require_once(dirname(__FILE__) . '/../audit/archiveutils.php');

function store_data($app_id, $db_id, $user_id, $data_id, $app_reference, $data_bytes, &$archive_id = "", &$data_insert_id = "")
{
    $ts = time();
    $salt = get_hash_salt();
    $success = true;
    $pdo = connect_to_db();
    try {
           $pdo->beginTransaction();
        
            $stmt = $pdo->prepare('INSERT INTO ' . ARCHIVE_DATA_CLASS .
                    '(app_id, db_id, data_id, reference, create_ts) ' .
                    "VALUES (:app_id, :db_id, :data_id, :reference, :create_ts)");
            $stmt->execute(array('app_id'=>$app_id,
                                 'db_id'=> $db_id,
                                 'data_id'=> $data_id,
                                 'reference'=> $app_reference,
                                 'create_ts'=> $ts));
            $archive_id = $pdo->lastInsertId();
            $archive_ts = $ts;
    }

            $hash = create_canonical_audit_data_hash($app_id, $db_id, $user_id, $data_id, 
                $app_reference, $data_bytes, $salt, $archive_ts, $ts);
            $stmt = $pdo->prepare('INSERT INTO ' . ARCHIVE_RAW_DATA_CLASS . 
                    '(archive_data_fk, user_id, data, salt, hash, create_ts, receipt_json) ' .
                    'VALUES (:archive_id, :user_id, :raw_data, :salt, :hash, :create_ts)');
            $stmt->execute(array('archive_id'=> $archive_id,
                             'user_id'=> $user_id,
                             'raw_data'=> $data_bytes,
                             'salt'=> $salt,   
                             'hash'=> $hash,
                             'create_ts'=> $ts
                             ));
            $data_insert_id = $pdo->lastInsertId(); 
            $pdo->commit();
    } catch ( PDOException $e) {
        $pdo->rollBack();
        $success = false;
        print 'Error: ' . $e->getMessage() . PHP_EOL;
    }
    
    $stmt = null;
    $pdo = null;
    
    return $success;
}

