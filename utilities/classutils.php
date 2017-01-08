<?php
// Utility functions for classes


/*
 * Populate an object's fields with values from an array
 * From http://stackoverflow.com/questions/9586713/how-do-i-fill-an-object-in-php-from-an-array
 */
function set_object_vars_from_array($object, array $vars) {
    $has = get_object_vars($object);
    foreach ($has as $name => $oldValue) {
        $object->$name = isset($vars[$name]) ? $vars[$name] : NULL;
    }
}
