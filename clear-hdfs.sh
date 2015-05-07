#!/bin/bash 

echo "clear all hdfs directories"


hosts="09 10 11 12"
folders="1 2 3 4"

for h in $hosts
do
    echo "clearing r16s$h..."
    for f in $folders
    do
        echo "delete r16s$h: /mnt/$f/data/*"
        ssh r16s$h "rm -rf /mnt/$f/data/*"
        sleep 1
        echo "delete r16s$h: /mnt/$f/yarn/local/*"
        ssh r16s$h "rm -rf /mnt/$f/yarn/local/*"
        sleep 1
        echo "delete r16s$h: /mnt/$f/yarn/log/*"
        ssh r16s$h "rm -rf /mnt/$f/yarn/log/*"
        sleep 1
    done
    echo "delete r16s$h: /tmp/hadoop-hadoop/*"
    ssh r16s$h "rm -rf /tmp/hadoop-hadoop/*"
    sleep 1
done

for f in $folders
do
    echo "delete $HOSTNAME: /mnt/$f/name/*"
    rm -rf /mnt/$f/name/*
done
