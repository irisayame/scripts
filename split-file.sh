#!/bin/bash 
FILE_NAME=$1
LOG_FILE=/opt/hadoop/userlogs/$FILE_NAME/hibench.log
LOG_FOLDER=/opt/hadoop/userlogs/$FILE_NAME


PREPARE_PATTERN="========== preparing"
START_PATTERN="========== running"
END_PATTERN="== MR job done=="

if [ -f $LOG_FILE ] && [ ! -f $LOG_FOLDER/run.log ];then
    LINE_NUMBER=`grep -in -m 1 "$START_PATTERN" $LOG_FILE | awk -F":" '{print $1}'`
    if [ ! -z $LINE_NUMBER ];then
        let LINE_NUMBER=$LINE_NUMBER-1
        (head -$LINE_NUMBER > $LOG_FOLDER/prepare.txt; cat > $LOG_FOLDER/run.txt) < $LOG_FILE
    fi
    echo "$LOG_FILE: $LINE_NUMBER"
fi
