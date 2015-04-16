#!/usr/bin/env gnuplot

set terminal postscript eps enhanced font "Helvetica, 20" linewidth 2
set output outputfile

set border linewidth 1
set style line 1 linetype 1 linewidth 1 linecolor 0 pointtype 1 pointsize 1
set style line 2 linetype 2 linewidth 1 linecolor 1 pointtype 2 pointsize 1
set style line 3 linetype 3 linewidth 1 linecolor 3 pointtype 3 pointsize 1
set style line 4 linetype 4 linewidth 1 linecolor 2 pointtype 7 pointsize 1

set style arrow 1 nohead lt 2 lw 2 linecolor 7
set style arrow 2 nohead lt 2 lw 2 linecolor 7


set key box below

set xlabel 'Time(second)'
set ylabel YLABEL

#set format y "%.1tx10^%1T";

set xrange[0:TIMEEND]
set yrange[0:YRANGE]

set ytics YTICS

set arrow from MSTART,0 to MSTART,YRANGE as 1
set arrow from MEND,0 to MEND,YRANGE as 2 

set datafile separator ","

plot inputfile  using 2:i0  with lines ls 1 title 'r16s09', \
	'' using 2:i0+1 with lines ls 2 title 'r16s10', \
	'' using 2:i0+2 with lines ls 3 title 'r16s11', \
	'' using 2:i0+3 with lines ls 4 title 'r16s12' 

