import os
import sys
import re
from datetime import datetime
import copy

SEP=","
MEMSIZE = 135221465088.00
PATH_PREFIX = "../userlogs/" 

ROW_TITLE = ["CPU_USR","CPU_SYS","CPU_IDLE",
    "CPU_BUSY","MEM_USED","MEM_CACHE","MEM_FREE","MEM_BUSY",
    "DISK_READ","DISK_WRTIE","NET_RECV","NET_SEND"]
[CPU_USR,CPU_SYS,CPU_IDLE,CPU_BUSY] = [0,1,2,3]
[MEM_USED,MEM_CACHE,MEM_FREE,MEM_BUSY] = [4,5,6,7]
[DISK_READ,DISK_WRITE,NET_RECV,NET_SEND] = [8,9,10,11]

def deltaTime(time1, time2):
   time1 = datetime.strptime(time1, "%H:%M:%S")
   return str((time1-time2).seconds) 
      
class HadoopTest(object):
    def __init__(self, name, hosts):
        self.name = name
        self.description = name
        #self.dstatFiles = []
        self.dstatMatrix = {}
        self.summaryFile = "%s%s/summary-%s.csv"%(PATH_PREFIX,name,name)
        self.hosts = hosts
        self.progArray = None
        self.starttime_dict = {}
    
    def getTimeZero(self):
        return datetime.strptime(min(self.starttime_dict.values()),"%H:%M:%S")

    def getTimeLast(self):
        return max(self.starttime_dict.values())

    def parseLog(self):
        logfile = LogFile(PATH_PREFIX+self.name+"/run.log")
        self.progArray = logfile.parse()
        for timeArray in self.progArray:
             if self.dstatMatrix.get(timeArray[0]):
                  self.dstatMatrix[timeArray[0]][len(self.hosts)] = timeArray[1:]
        

    def readDstats(self):
        hostNumber = len(hosts)
        for index, host in enumerate(hosts):
            FILEPATH = "%s%s/%s-%s.csv"%(PATH_PREFIX,self.name,host,self.name)
            dsfile = DstatFile(FILEPATH, self.dstatMatrix, hostNumber, index)
            dsfile.readlines()
            self.starttimes = []
            self.starttime_dict[host] = dsfile.starttime
            #self.dstatFiles.append(dsfile)


    def sampleDstats(self, rate):
        self.readDstats()
        timelast = self.getTimeLast()
        splDstatMatrix = {}
        counter = 0
        hostNumber = len(self.hosts)
        splHostArray = []
        for timestamp in sorted(self.dstatMatrix.iterkeys()):
            hostArray = self.dstatMatrix.get(timestamp)[:hostNumber]
            if timestamp < timelast:
                continue
            print "counter:%d"%counter
            if counter%rate == 0:
                splHostArray.append(hostArray)
                splDstatMatrix[timestamp] = []
                aggreArray = [None]*hostNumber 
                for ihost in range(hostNumber):
                    aggreArray[ihost] = []  
                    for harray in splHostArray:
                        aggreArray[ihost].append(harray[ihost])
                    temparray = map(sum,aggreArray[ihost])
                    splDstatMatrix[timestamp].append(copy.copy([item/5 for item in temparray]))
                    splHostArray = []
            else:
                splHostArray.append(hostArray)
            counter += 1
            print "splHostArray Len:%d"%len(splHostArray)
            print 
            if counter == 6:
            #    for key in sorted(splDstatMatrix.iterkeys()):
            #        print key
            #        for v in splDstatMatrix.get(key):
            #             print v
            #        print
                break
            splDstatMatrix[timestamp] = splHostArray
            
            

    def mergeDstats3(self):
        self.readDstats()
        self.parseLog()
        timezero = self.getTimeZero()
        with file(self.summaryFile, "wb") as fobj:            
            titlerow = "#TIMESTAMP,Delta Time,Map Progress,Reduce Progress,"
            hostrow = ""
            for dt in ROW_TITLE:
                titlerow += ","
                hostrow += ","
                for host in self.hosts:
                    titlerow += dt+","
                    hostrow += host+","
            fobj.write( "#,,,,"+hostrow + "\n")
            fobj.write( titlerow + "\n")
            for timestamp in sorted(self.dstatMatrix.iterkeys()):
                hostArray = self.dstatMatrix.get(timestamp)
                mapprog,reduceprog="",""
                timedelta = deltaTime(timestamp,timezero)
                if hostArray[len(self.hosts)] is not None:
                    [mapprog,reduceprog] = hostArray[len(self.hosts)]
                row = "%s,%s,%s,%s"%(timestamp,timedelta,mapprog,reduceprog)
                for idata in range(len(ROW_TITLE)):
                    row += ","
                    for ihost in range(len(self.hosts)):
                        if hostArray[ihost] is None:
                             row += ","
                        else:
                             row += ","+str(hostArray[ihost][idata])
                fobj.write(row+"\n")
                    
    #def mergeDstats2(self):
    #    with file(self.summaryFile, "wb") as fobj:            
    #        datatitle = ",".join(ROW_TITLE)
    #        titlerow = "TIMESTAMP,,,"
    #        hostrow = ""
    #        for host in self.hosts:
    #            titlerow += ",,"+datatitle
    #            hostrow += ",,"+",".join([host]*(NET_SEND+1))
    #        fobj.write( ",,,"+hostrow + "\n")
    #        fobj.write( titlerow + "\n")
    #        for timestamp, hostArray in self.dstatMatrix.items():
    #            row = "%s,,,"%timestamp
    #            for hostDstat in hostArray:
    #                if hostDstat is None:
    #                    row += ",,"+",".join(["-1"]*(NET_SEND+1))
    #                else:
    #                    row += ",,"+",".join(map(str,hostDstat))
    #            fobj.write(row+"\n")
        
        
class LogFile(object):
    def __init__(self, filepath):
        self.logpath = filepath
        self.pattern = "map [0-9]+% reduce [0-9]+%$"

    def parse(self):
        progArray = []
        with file(self.logpath,"rb")as fobj:
           lines = fobj.readlines()
           for line in lines:
               match = re.search(self.pattern, line)
               if match:
                   info = line.strip().split(" ")
                   progArray.append([info[1]]+[info[6]]+[info[8]])
        return progArray

class DstatFile(object):
    def __init__(self, filepath, dstatMatrix, hostNumber, hostIndex):
        self.filepath = filepath
        #self.timelines = []
        self.globalDict = dstatMatrix
        self.hostNumber = hostNumber
        self.hostIndex = hostIndex
        self.starttime = -1

         
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
                timestamp = numbers[0].split(" ")[1]
                if self.starttime == -1:
                    self.starttime = timestamp
                if timestamp not in self.globalDict:
                    self.globalDict[timestamp] = [None]*(self.hostNumber+1)
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
    #test.mergeDstats()
    test.sampleDstats(3)

