import os
import sys

SEP=","
hosts = ["r16s09","r16s10", "r16s11", "r16s12"]
timeline = {}
MEMSIZE = 137438953472

[CPU_USR,CPU_SYS,CPU_IDLE,CPU_BUSY]=[0,1,2,3]
[MEM_USED,MEM_CACHE,MEM_FREE,MEM_BUSY]=[4,5,6,7]
[DISK_READ,DISK_WRITE,NET_RECV,NET_SEND]=[8,9,10,11]

#class Line(object):
#    def __init__(self, cpu, disk, net, mem):
#        print cpu, disk, net, mem
#        self.cpu = {"usr": cpu[0], "idle": cpu[2], "sys": cpu[1], "busy":100-cpu[2]}
#        self.mem = {"used": mem[0], "cache": mem[2], "free": mem[3], "busy": MEMSIZE-mem[3]}
#        self.disk = {"read": disk[0], "write": disk[1]}
#        self.net = {"recv":net[0] , "send": net[1]}

class DstatFile(object):
    def __init__(self, filepath):
         self.filepath = filepath
         self.datadict = {}

         
    def readlines(self):
        with file(self.filepath, "rb") as fobj:
            lnumber = 0 
            lines = fobj.readlines()
            for line in lines:
                numbers = line.split(SEP)
                lnumber += 1
                if lnumber == 7:
                    print line
                if lnumber < 8:
                    continue
                print numbers[1:]
                print self.parseline(map(float,numbers[1:]))
                break

    def parseline(self, numbers):
        print numbers
        dstatLine = [-1]*(NET_SEND+1)
        dstatLine[CPU_USR:CPU_BUSY] = numbers[0:3]
        dstatLine[CPU_BUSY] = 100-dstatLine[CPU_IDLE]
        dstatLine[DISK_READ:DISK_WRITE] = numbers[6:8]
        dstatLine[NET_RECV:] = numbers[8:10]
        dstatLine[MEM_USED] = numbers[14]
        dstatLine[MEM_CACHE:DISK_READ] = numbers[16:]
        dstatLine[MEM_BUSY] = 100-dstatLine[MEM_FREE]
        return dstatLine
 
        


if __name__ == "__main__":
    FILEPATH = "userlogs/1428029442/r16s09-dstat-1428029442.csv" 
    dsfile = DstatFile(FILEPATH)
    dsfile.readlines()

