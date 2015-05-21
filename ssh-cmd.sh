#!/bin/bash 


. global.conf

echo "executing $@ $hosts"

for h in $hosts
do
	echo "$h $@"
	ssh $h "$@"
	echo ""
done
