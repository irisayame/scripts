import os
import sys

SEP=","
MEMSIZE = 135221465088.00
PATH_PREFIX = "../userlogs/" 

ROW_TITLE = ["CPU_USR","CPU_SYS","CPU_IDLE",
    "CPU_BUSY","MEM_USED","MEM_CACHE","MEM_FREE","MEM_BUSY",
    "DISK_READ","DISK_WRTIE","NET_RECV","NET_SEND"]
[CPU_USR,CPU_SYS,CPU_IDLE,CPU_BUSY] = [0,1,2,3]
[MEM_USED,MEM_CACHE,MEM_FREE,MEM_BUSY] = [4,5,6,7]
[DISK_READ,DISK_WRITE,NET_RECV,NET_SEND] = [8,9,10,11]

class HadoopTest(object):
    def __init__(self, name, hosts):
        self.name = name
        self.description = name
        #self.dstatFiles = []
        self.dstatMatrix = {}
        self.summaryFile = "summary-%s.csv"%(name,)
        self.hosts = hosts

    def readDstats(self):
        hostNumber = len(hosts)
        for index, host in enumerate(hosts):
            FILEPATH = "%s%s/%s-%s.csv"%(PATH_PREFIX,self.name,host,self.name)
            dsfile = DstatFile(FILEPATH, self.dstatMatrix, hostNumber, index)
            dsfile.readlines()
            #self.dstatFiles.append(dsfile)

    def mergeDstats(self):
        with file(self.summaryFile, "wb") as fobj:            
            datatitle = ",".join(ROW_TITLE)
            titlerow = "TIME"
            hostrow = ""
            for host in self.hosts:
                titlerow += ",,"+datatitle
                hostrow += ",,"+",".join([host]*(NET_SEND+1))
            fobj.write( hostrow + "\n")
            fobj.write( titlerow + "\n")
            for timestamp, hostArray in self.dstatMatrix.items():
                row = "%s"%timestamp
                for hostDstat in hostArray:
                    if hostDstat is None:
                        row += ",,"+",".join(["-1"]*(NET_SEND+1))
                    else:
                        row += ",,"+",".join(map(str,hostDstat))
                fobj.write(row+"\n")
        
        


class DstatFile(object):
    def __init__(self, filepath, dstatMatrix, hostNumber, hostIndex):
         self.filepath = filepath
         #self.timelines = []
         self.globalDict = dstatMatrix
         self.hostNumber = hostNumber
         self.hostIndex = hostIndex

         
    def readlines(self):
        with file(self.filepath, "rb") as fobj:
            lnumber = 0 
            lines = fobj.readlines()
            for line in lines:
                numbers = line.split(SEP)
                lnumber += 1 
                if lnumber < 8:
                    continue
                datalist = self.parseline(map(float,numbers[1:]))
                #self.timelines.append([numbers[0]]+ datalist)
                timestamp = numbers[0]
                if timestamp not in self.globalDict:
                    self.globalDict[timestamp] = [None]*self.hostNumber
                self.globalDict[timestamp][self.hostIndex] = datalist    


    def parseline(self, numbers):
        dstatLine = [-1]*(NET_SEND+1)
        dstatLine[CPU_USR:CPU_BUSY] = numbers[0:3]
        dstatLine[CPU_BUSY] = 100-dstatLine[CPU_IDLE]
        dstatLine[MEM_USED] = numbers[14]
        dstatLine[MEM_CACHE:MEM_BUSY] = numbers[16:]
        dstatLine[MEM_BUSY] = MEMSIZE-dstatLine[MEM_FREE]
        dstatLine[DISK_READ:NET_RECV] = numbers[6:8]
        dstatLine[NET_RECV:] = numbers[8:10]
        return dstatLine


if __name__ == "__main__":
    TESTNAME = "sort_xinni_201504091654_120G-128Mblocksize-60Reduce"
    hosts = ["r16s09","r16s10", "r16s11", "r16s12"]
    test = HadoopTest(TESTNAME, hosts)
    test.readDstats()
    test.mergeDstats()





