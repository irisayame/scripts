#!/bin/bash 

echo "clear all hdfs directories"


hosts="09 10 11 12"
folders="1 2 3 4"

for h in $hosts
do
    echo "clearing r16s$h..."
    for f in $folders
    do
        echo "delete r16s$h: /mnt/data/$f/data/*"
        ssh r16s$h "rm -rf /mnt/data/$f/data/*"
        sleep 1
        echo "delete r16s$h: /mnt/data/$f/yarn/local/*"
        ssh r16s$h "rm -rf /mnt/data/$f/yarn/local/*"
        sleep 1
        echo "delete r16s$h: /mnt/data/$f/yarn/log/*"
        ssh r16s$h "rm -rf /mnt/data/$f/yarn/log/*"
    done
done

for f in $folders
do
    echo "delete $HOSTNAME: /mnt/data/$f/name/*"
    rm -rf /mnt/data/$f/name/*
done
