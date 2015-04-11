#!/bin/bash

echo "uploading $1"

LOG_HOME="$HOME/userlogs"
LOG_NAME="$1"
FTP_SERVERS="192.168.11.166 192.168.1.24"
FTP_DIR="upload"

if [ ! -x "$LOG_NAME" ];then
	echo "need input file"
	exit 0
fi


pushd $LOG_HOME
    tar czf ${LOG_NAME}.tar.gz $LOG_NAME
    for FTP_SERVER in $FTP_SERVERS;do
        curl --noproxy $FTP_SERVER -v -T ${LOG_NAME}.tar.gz ftp://${FTP_SERVER}/${FTP_DIR}/ --ftp-create-dirs
    done    
    rm -f ${LOG_NAME}.tar.gz
popd
