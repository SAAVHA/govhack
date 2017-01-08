<?php

class TIMER 
{
    private $sleep = 500000000; //sleep for one half second
    private $iterations = 2;
    private $counter = 0;
    private $event_object;
    
    function __construct($event_object) 
    {
        $this->event_object = $event_object;
    }

    function wait($seconds = 1)
    {
        $this->iterations = $seconds * 2;
        $this->counter = 0;
        while (true)
        {
            $nano = time_nanosleep(0, $this->sleep);
            $this->counter++;
            if ($this->counter >= $this->iterations) break;
        }
        $this->event_object->timer_event();
        return true;
    }

    function get_seconds()
    {
        return $this->counter / 2;
    }

    function get_timestamp()
    {
        $date = new DateTime();
        return $date->getTimestamp(); 
    }
}

