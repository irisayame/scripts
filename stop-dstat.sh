#!/bin/bash -x

hosts='09 10 11 12'
timestamp=`echo $(date "+%s")`
logpath="$HOME/userlogs/$timestamp"

mkdir -p $logpath

scrs=`screen -ls | grep dstat | awk -F" " '{print $1}'`

if [ "$scrs" != "" ];then 
	echo "screen dstat exists!"
	exit 0
fi

screen -d -m -S dstat -s /bin/bash

for host in $hosts
do
	screen -S dstat -X screen -t r16s$host-dstat
        screen -S dstat -p r16s$host-dstat -X stuff "ssh r16s$host \"dstat -tam | tee $logpath/r16s09-dstat-$timestamp.log\""
        screen -S dstat -p r16s$host-dstat -X stuff `echo -ne '\015'`

done 
