#!/bin/bash -x

# ./analysis -n $TESTNAME -r $SAMPLE_RATE



TOP_DIR=$(cd $(dirname "$0") && pwd)
. $TOP_DIR/functions
. $TOP_DIR/main.conf

while getopts t:s: option
do
	case "$option" in
		t)
			TESTNAME=$OPTARG;;
		s)
			SAMPLERATE=$OPTARG;;
		\?)
			gnuhint
			exit 1;;
	esac
done




[[ -z $TESTNAME ]] && echo "TestName required!!" && gnuhint && exit 1
[[ -z $SAMPLERATE ]] && echo "SAMPLERATE required!!" && gnuhint && exit 1

TASK=`echo "$TESTNAME" | awk -F"_" '{print $1}'`
if [ "$TASK" = "dfsioe" ] ; then
	HADOOPLOG="run-read"
else
	HADOOPLOG="run"
fi


python dsanalysis.py $TESTNAME $SAMPLERATE $HADOOPLOG ${HOSTS[@]}
./gnuplotrun.sh -t $TESTNAME 
