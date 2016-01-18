function generate(){
    var diskconfig = {"raid_arrays":null, "filesystems":null};
    var raid_arrays = [{"primary": true, "partitions":[]}];
    var filesystems = get_mountfs();
    for (var i in values){
      raid_arrays[0]["partitions"].push({"size":values[i], "label":tags[i]});
    }  
    diskconfig["raid_arrays"] = raid_arrays
    diskconfig["filesystems"] = filesystems
    $("#json-field").html(JSON.stringify(diskconfig,null,2));
   }

$(function ()
{
    $("#wizard").steps({
        headerTag: "h2",
        bodyTag: "section",
        stepsOrientation: "vertical",
        transitionEffect: "fade",
        onStepChanged: function (event, currentIndex, priorIndex)
        {
            $(".wizard.vertical > .content").css("overflow","visible");
            if(currentIndex == 1){
                $(".wizard.vertical > .content").css("overflow","auto");
                raphael();
                collect_diskinfo();
            }else if (currentIndex == 2){
                $(".wizard.vertical > .content").css("overflow","auto");
                generate();
            }
        }
    });
});
