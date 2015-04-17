#!/bin/bash 

echo "usage ssh-cmd command"

#if [ "$#" != "1" ];then
#	echo "need 1 parameters"
#	exit 0
#fi

hosts="09 10 11 12"
command="echo 3 > /proc/sys/vm/drop_caches"

for h in $hosts
do
	echo "r16s$h $command"
	ssh root@r16s$h "$command"
	echo ""
done


command="echo 0 > /proc/sys/vm/drop_caches"
for h in $hosts
do
	echo "r16s$h $command"
	ssh root@r16s$h "$command"
	echo ""
done

