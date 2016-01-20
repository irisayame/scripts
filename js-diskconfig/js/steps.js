function generate(){
    var diskconfig = {"raid_arrays":raid_arrays, "lvm_volume_groups":lvm_groups,"filesystems":filesystems};
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
            $(".wizard.vertical > .content").css("overflow","auto");
            if (currentIndex == 1){
                save_partition();
                get_pvg_labels();
            }
            else if(currentIndex == 2){
                get_lvm_configs();
                get_fs_labels();
                show_fs_table();
               // raphael();
            }else if (currentIndex == 3){
                get_fs_configs()
                generate();
            }
        }
    });
});
