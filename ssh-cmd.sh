#!/bin/bash 

echo "usage ssh-cmd command"

if [ "$#" != "1" ];then
	echo "need 1 parameters"
	exit 0
fi

hosts="09 10 11 12"

for h in $hosts
do
	echo "r16s$h $1"
	ssh r16s$h "$1"
	echo ""
done
