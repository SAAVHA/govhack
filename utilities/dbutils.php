<?php


/*
 * Function to get the results of a pdo statement, when the 
 *  result is a list of class objects.
 * @param pdo_statement PDO statement that is executed and ready for
 *                          fetch()ing data.  
 * @param class_name Name of the PHP class to map the data to. 
 * @return Array of class_name objects
 */
function get_class_data_list($pdo_statement, $class_name)
{
    $pdo_statement->setFetchMode(PDO::FETCH_CLASS, $class_name);
    
    $out = [];
    $row = $pdo_statement->fetch();
    while ($row) {
        $out[] = $row;
        $row = $pdo_statement->fetch();
    }
    
    return $out;
}