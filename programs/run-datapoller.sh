#! /bin/bash
while true; do
echo Running data poller...
php datapoller.php;
echo Poller sleeping...
sleep 60;
done
