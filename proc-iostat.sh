#!/bin/bash


HOSTS="r16s09 r16s10 r16s11 r16s12"
DEVS="sdb sdc sdd sde"

TEST_NAME=$1
FILE_FOLDER="$HOME/userlogs/$TEST_NAME"

pushd $FILE_FOLDER
    for host in $HOSTS
    do
        FILE_PATH=$host-$TEST_NAME.iostat.log
        echo "$host" > $host-time.iostat.log
        echo "Time" >> $host-time.iostat.log
        cat $FILE_PATH | grep '^[0-9]' | awk -F" " '{print $2}'>> $host-time.iostat.log
        PASTE_FILES="$PASTE_FILES $host-time.iostat.log"
        for dev in $DEVS
        do
        	echo "$host" > $host-$dev.iostat.log
        	echo "$dev" >> $host-$dev.iostat.log
        	cat $FILE_PATH | grep $dev | awk -F" " '{print $4}'>> $host-$dev.iostat.log
            PASTE_FILES="$PASTE_FILES $host-$dev.iostat.log"
        done
    done

    paste $PASTE_FILES | tr "	" ","> $TEST_NAME-merged.iostat.csv 
    rm $PASTE_FILES
popd $FILE_FOLDER
