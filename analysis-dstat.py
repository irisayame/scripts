import os
import sys
import re
from datetime import datetime

SEP=","
MEMSIZE = 135221465088.00
PATH_PREFIX = "../userlogs/" 
COLUMN_LENGTH=19


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
    def __init__(self, name, hosts, samplerate, logname):
        self.name = name
        self.description = name
        #self.dstatFiles = []
        self.dstatMatrix = {}
        self.splDstatMatrix = {}
        self.summaryFile = "%s%s/summary-%s.csv"%(PATH_PREFIX,name,name)
        self.smplSummaryFile = "%s%s/summary-sample-%s.csv"%(PATH_PREFIX,name,name)
        self.hosts = hosts
        self.progArray = None
        self.starttime_dict = {}
        self.sampleRate = samplerate
        self.logname = logname
        self.conffile = "gnu.conf"
        self.map_start = ""
        self.map_end = ""
    
    def getTimeZero(self):
        return datetime.strptime(min(self.starttime_dict.values()),"%H:%M:%S")

    def parseLog(self):
        logfile = LogFile(PATH_PREFIX+self.name+"/%s.log"%self.logname)
        self.progArray = logfile.parse()
        self.map_start = logfile.map_start
        self.map_end = logfile.map_end
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
        timelast = self.getTimeLast()
        counter = 1
        hostNumber = len(self.hosts)
        titleNumber = len(ROW_TITLE)
        splHostArray = []
        for timestamp in sorted(self.dstatMatrix.iterkeys()):
            hostArray = self.dstatMatrix.get(timestamp)[:hostNumber]
            if timestamp < timelast:
                continue
            if counter%rate == 0:
                splHostArray.append(hostArray)
                self.splDstatMatrix[timestamp] = []
                for ihost in range(hostNumber):
                    titleArray = [None]*titleNumber
                    for iTitle in range(titleNumber):
                        titleArray[iTitle]=[]
                        for harray in splHostArray:
                            if harray[ihost] is None:
                                harray[ihost] = [0]*titleNumber
                            titleArray[iTitle].append(harray[ihost][iTitle])
                    temparray = map(sum,titleArray)
                    self.splDstatMatrix[timestamp].append(copy.copy([item/rate for item in temparray]))
                splHostArray = []
            else:
                splHostArray.append(hostArray)
            counter += 1


    def mergeSampleDstats(self):
        self.sampleDstats(self.sampleRate)
        with file(self.smplSummaryFile, "wb") as fobj:
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
            timedelta = 0
            for timestamp in sorted(self.splDstatMatrix.iterkeys()):
                hostArray = self.splDstatMatrix.get(timestamp)
                row = "%s,%d,,"%(timestamp,timedelta)
                for idata in range(len(ROW_TITLE)):
                    row += ","
                    for ihost in range(len(self.hosts)):
                        if hostArray[ihost] is None:
                            row += ","
                        else:
                            row += ","+str(hostArray[ihost][idata])
                fobj.write(row+"\n")
                timedelta += self.sampleRate

    def mergeDstats(self):
        self.parseLog()
        timezero = self.getTimeZero()
        mstart = 0
        mend = 0
        timeend = 0
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
            sortedkeys = sorted(self.dstatMatrix.iterkeys())
            timeend = deltaTime(sortedkeys[-1],timezero)
            print timeend
            for timestamp in sortedkeys:
                hostArray = self.dstatMatrix.get(timestamp)
                mapprog,reduceprog="",""
                timedelta = deltaTime(timestamp,timezero)
                if timestamp == self.map_start:
                    mstart = timedelta
                if timestamp == self.map_end:
                    mend = timedelta
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
        with file(self.conffile,"wb") as fobj:
           fobj.write("MSTART=%s\n"%str(mstart))
           fobj.write("MEND=%s\n"%str(mend))
           fobj.write("TIMEEND=%s\n"%timeend)
                    
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
        self.map_start = ""
        self.map_end = ""

    def parse(self):
        progArray = []
        if not os.path.exists(self.logpath):
            print "No Log File %s found!"%self.logpath
            return progArray
        with file(self.logpath,"rb")as fobj:
           lines = fobj.readlines()
           for line in lines:
               match = re.search(self.pattern, line)
               if match:                   
                   info = line.strip().split(" ")
                   progArray.append([info[1]]+[info[6]]+[info[8]])
                   if "map 0%" in line:
                       self.map_start = info[1]
                   if len(self.map_end) == 0 and "map 100%" in line:
                       self.map_end = info[1]
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
        if not os.path.exists(self.filepath):
            print "No Dstat File %s found!"%self.filepath
            return
        with file(self.filepath, "rb") as fobj:
            lnumber = 0 
            lines = fobj.readlines()
            for line in lines:
                numbers = line.strip().split(SEP)
                lnumber += 1 
                if lnumber < 8:
                    continue
                datalist = self.parseline(map(float,numbers[1:COLUMN_LENGTH]))
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
    if len(sys.argv) < 4:
        print "need test name, samplerate, logname and hosts"
        sys.exit(0)
    TESTNAME = sys.argv[1]
    samplerate = sys.argv[2]
    logname = sys.argv[3]
    hosts = sys.argv[4:]
    print TESTNAME, samplerate, hosts

    test = HadoopTest(TESTNAME, hosts, int(samplerate),logname)
    test.readDstats()
    test.mergeDstats()
    test.mergeSampleDstats()
