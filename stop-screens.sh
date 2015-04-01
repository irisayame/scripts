#!/bin/bash -x

scrs=`screen -ls | grep dstat | awk -F" " '{print $1}'`

if [ "$scrs" == "" ];then 
	echo "no screens exists!"
	exit 0
fi

for s in $scrs
do
	echo "terminateing $s"
        screen -S $s -X quit

done 
