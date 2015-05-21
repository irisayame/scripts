#!/bin/bash 


. global.conf

echo "clear mem cache" $hosts 

command="echo 3 > /proc/sys/vm/drop_caches"

for h in $hosts
do
	echo "$h $command"
	ssh root@$h "$command"
	echo ""
done


#command="echo 0 > /proc/sys/vm/drop_caches"
#for h in $hosts
#do
#	echo "r16s$h $command"
#	ssh root@r16s$h "$command"
#	echo ""
#done

