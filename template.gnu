#!/usr/bin/env gnuplot

set terminal postscript eps enhanced font "Helvetica, 20" linewidth 2
set output 'cpu.eps'

set border linewidth 1
set style line 1 linetype 1 linewidth 1 pointtype 1 pointsize 1

set key box left

set xlabel 'Time(second)'
set ylabel 'CPU (%)'

#set xrange[0:17]
set yrange[0:100]

#set xtics 
set ytics 10

set datafile separator ","

plot 'summary-sort_xinni_201504091654_120G-128Mblocksize-60Reduce.csv'  using 2:6  with points ls 1 title 'CPU'
