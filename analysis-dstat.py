import csv
import os
import sys

hosts = ["r16s09","r16s10", "r16s11", "r16s12"]
timeline = {}
MEMSIZE = 137438953472


class Line(object):
    def __init__(self, cpu, disk, net, mem):
        print cpu, disk, net, mem
        self.cpu = {"usr": cpu[0], "idle": cpu[2], "sys": cpu[1], "busy":100-cpu[2]}
        self.mem = {"used": mem[0], "cache": mem[2], "free": mem[3], "busy": MEMSIZE-mem[3]}
        self.disk = {"read": disk[0], "write": disk[1]}
        self.net = {"recv":net[0] , "send": net[1]}

class DstatFile(object):
    def __init__(self, filepath):
         self.filepath = filepath
         self.datadict = {}

         
    def readlines(self):
        with file(self.filepath, "rb") as fobj:
            lnumber = 0 
            reader = csv.reader(fobj)
            for line in reader:
                lnumber += 1
                if lnumber < 8:
                    continue
                self.parseline(map(float,line[1:]))
                break

    def parseline(self, numbers):
        print numbers
        line = Line(numbers[0:3],numbers[6:8],numbers[8:10],numbers[14:])
        print line.cpu, line.mem, line.disk, line.net
        


if __name__ == "__main__":
    FILEPATH = "userlogs/1428029442/r16s09-dstat-1428029442.csv" 
    dsfile = DstatFile(FILEPATH)
    dsfile.readlines()

