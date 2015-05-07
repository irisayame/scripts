#!/bin/bash


HOSTS="r16s09 r16s10 r16s11 r16s12"
DEVS="sdb sdc sdd sde"

TEST_NAME=$1
TEST_NAME="sort_xinni_201505061708_120G-80gY-2gM4gR-iostat"
FILE_FOLDER="$HOME/userlogs/$TEST_NAME"

PASTE_FILES="time.iostat.log"

rm $FILE_FOLDER/time.iostat.log

for host in $HOSTS
do
    FILE_PATH=$FILE_FOLDER/$host-$TEST_NAME.iostat.log
    if [ ! -f $FILE_FOLDER/time.iostat.log ];then
        echo "Time" > $FILE_FOLDER/time.iostat.log
        cat $FILE_PATH | grep '^[0-9]' | awk -F" " '{print $2}'>> $FILE_FOLDER/time.iostat.log
    fi
    for dev in $DEVS
    do
    	echo "$host-$dev" > $FILE_FOLDER/$host-$dev.iostat.log
    	cat $FILE_PATH | grep $dev | awk -F" " '{print $4}'>> $FILE_FOLDER/$host-$dev.iostat.log
        PASTE_FILES="$PASTE_FILES $host-$dev.iostat.log"
    done
done

pushd $FILE_FOLDER
    paste $PASTE_FILES | tr "	" ","> merged.iostat.csv 
    rm $PASTE_FILES
popd $FILE_FOLDER
