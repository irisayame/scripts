#!/usr/bin/env gnuplot

set terminal postscript eps enhanced font "Helvetica, 20" linewidth 2
set output 'cpu.eps'

set border linewidth 1
set style line 1 linetype 1 linewidth 1 linecolor 0 pointtype 1 pointsize 1
set style line 2 linetype 2 linewidth 1 linecolor 1 pointtype 2 pointsize 1
set style line 3 linetype 3 linewidth 1 linecolor 3 pointtype 3 pointsize 1
set style line 4 linetype 4 linewidth 1 linecolor 2 pointtype 7 pointsize 1

set key box below

set xlabel 'Time(second)'
set ylabel 'CPU (%)'

set xrange[500:1000]
set yrange[0:100]

set ytics 10

set datafile separator ","

plot 'summary-sample-sort_xinni_201504091654_120G-128Mblocksize-60Reduce.csv'  using 2:6  with lines ls 1 title 'r16s09', \
	'' using 2:7 with lines ls 2 title 'r16s10', \
	'' using 2:8 with lines ls 3 title 'r16s11', \
	'' using 2:9 with lines ls 4 title 'r16s12' 

