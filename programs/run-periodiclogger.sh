#! /bin/bash
while true; do
echo Running periodic log...
php periodiclogger.php;
echo Periodic log sleeping...
sleep 600;
done
