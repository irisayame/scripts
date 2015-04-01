#!/bin/bash

mv jps.log jps.$(date +"%s").log
while true
do
	echo -e "$(date '+%H:%M:%S')\n$(jps)\n" | tee -a jps.log
	sleep 3
done
