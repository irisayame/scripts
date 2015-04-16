#!/bin/bash -x

# ./analysis -n $TESTNAME -r $SAMPLE_RATE



TOP_DIR=$(cd $(dirname "$0") && pwd)
. $TOP_DIR/functions
. $TOP_DIR/main.conf

while getopts n:r:t: option
do
	case "$option" in
		n)
			TESTNAME=$OPTARG;;
		r)
			SAMPLERATE=$OPTARG;;
		\?)
			gnuhint
			exit 1;;
	esac
done




[[ -z $TESTNAME ]] && echo "TestName required!!" && gnuhint && exit 1
[[ -z $SAMPLERATE ]] && echo "SAMPLERATE required!!" && gnuhint && exit 1

if [ "$TASK" = "dfsioe" ] ; then
	HADOOPLOG="run-read"
else
	HADOOPLOG="run"
fi


python analysis-dstat.py $TESTNAME $SAMPLERATE $HADOOPLOG ${HOSTS[@]}
./gnu-run.sh -n $TESTNAME 
