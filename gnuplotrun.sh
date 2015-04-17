#!/bin/bash -x

TOP_DIR=$(cd $(dirname "$0") && pwd)
. $TOP_DIR/functions
. $TOP_DIR/main.conf
. $TOP_DIR/.gnu.conf

while getopts t: option
do
	case "$option" in
		t)
			TESTNAME=$OPTARG;;
		\?)
			gnuhint
			exit 1;;
	esac
done



[[ -z $TESTNAME ]] && echo "TestName required!!" && gnuhint && exit 1


inputfile="$LOG_HOME/$TESTNAME/summary-sample-$TESTNAME.csv"
outputfile="$LOG_HOME/$TESTNAME/$TESTNAME"



if [ "$MSTART" == "" ];then
	MSTART=0
fi
if [ "$MEND" == "" ];then
	MEND=$TIMEEND
fi

gnuplot -e "inputfile=\"$inputfile\";outputfile=\"$outputfile-cpu-busy.eps\";TIMEEND=$TIMEEND;i0=21;YLABEL=\"CPU BUSY(%)\";YRANGE=100;YTICS=20;MSTART=$MSTART;MEND=$MEND" template.gnu
gnuplot -e "inputfile=\"$inputfile\";outputfile=\"$outputfile-cpu-usr.eps\";TIMEEND=$TIMEEND;i0=6;YLABEL=\"CPU USR (%)\";YRANGE=100;YTICS=20;MSTART=$MSTART;MEND=$MEND" template.gnu
gnuplot -e "inputfile=\"$inputfile\";outputfile=\"$outputfile-cpu-sys.eps\";TIMEEND=$TIMEEND;i0=11;YLABEL=\"CPU SYS (%)\";YRANGE=100;YTICS=20;MSTART=$MSTART;MEND=$MEND" template.gnu
gnuplot -e "inputfile=\"$inputfile\";outputfile=\"$outputfile-disk-read.eps\";TIMEEND=$TIMEEND;i0=46;YLABEL=\"DISK READ (Byte/s)\";YRANGE=$MAX_DISK_READ;YTICS=$TICS_DISK_READ;MSTART=$MSTART;MEND=$MEND" template.gnu
gnuplot -e "inputfile=\"$inputfile\";outputfile=\"$outputfile-disk-write.eps\";TIMEEND=$TIMEEND;i0=51;YLABEL=\"DISK WRITE (Byte/s)\";YRANGE=$MAX_DISK_WRITE;YTICS=$TICS_DISK_WRITE;MSTART=$MSTART;MEND=$MEND" template.gnu
gnuplot -e "inputfile=\"$inputfile\";outputfile=\"$outputfile-mem-busy.eps\";TIMEEND=$TIMEEND;i0=41;YLABEL=\"MEMORY (Bytes)\";YRANGE=$MAX_MEM_BUSY;YTICS=$TICS_MEM_BUSY;MSTART=$MSTART;MEND=$MEND" template.gnu
gnuplot -e "inputfile=\"$inputfile\";outputfile=\"$outputfile-mem-used.eps\";TIMEEND=$TIMEEND;i0=26;YLABEL=\"MEMORY (Bytes)\";YRANGE=$MAX_MEM_USED;YTICS=$TICS_MEM_USED;MSTART=$MSTART;MEND=$MEND" template.gnu
gnuplot -e "inputfile=\"$inputfile\";outputfile=\"$outputfile-net-recv.eps\";TIMEEND=$TIMEEND;i0=56;YLABEL=\"NET RECV (Byte/s)\";YRANGE=$MAX_NET_RECV;YTICS=$TICS_NET_RECV;MSTART=$MSTART;MEND=$MEND" template.gnu
gnuplot -e "inputfile=\"$inputfile\";outputfile=\"$outputfile-net-send.eps\";TIMEEND=$TIMEEND;i0=61;YLABEL=\"NET SEND (Byte/s)\";YRANGE=$MAX_NET_SEND;YTICS=$TICS_NET_SEND;MSTART=$MSTART;MEND=$MEND" template.gnu 

