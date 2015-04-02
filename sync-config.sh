#!/bin/bash -x

echo "usage sync-config local_file remove_file"

if [ "$#" != "2" ];then
	echo "need 2 parameters"
	exit 0
fi

hosts="10 11 12"

for h in $hosts
do
	scp $1 r16s$h:$2
done
