/* This file controls the step switching logical, including validation and status save/load
 *
 */

/* generate the final json */
function generate(){
    var diskconfig = {"raid_arrays":raid_arrays, "lvm_volume_groups":lvm_groups,"filesystems":filesystems};
    $("#json-field").html(JSON.stringify(diskconfig,null,2));
   }

/* load LVM tab */
function refresh_lvm(){
    $("#pvg-label-div").children().each(function(){
        var selectnode = $(this).find(".selectable");
        selectnode.empty();
        var vg_index = selectnode.attr("id").split("-")[1];
        for (var i = 0; i < pvglabels.length; i = i + 1){
           selectnode.append($('<li id="vg-'+vg_index+'-option-'+i+'" class="ui-widget-content option-'+i+'" value="'+pvglabels[i]+'">'+pvglabels[i]+' ('+pvgsizes[i]+'G)</li>'));
        }
    });    
    for (var i in pvgstatus){
        var selected_labels = pvgstatus[i];
        for (var j in selected_labels){
            $("li").each(function(){
                if ($(this).attr("value") == selected_labels[j]){
                    var vg_index = $(this).attr("id").split("-")[1];
                    var label_index = $(this).attr("id").split("-")[3];
                    if (vg_index == i){
                        $(this).addClass( "ui-selected" );  
                        selected[label_index] = 1;  
                    } else{
                        $(this).addClass( "block" );    
                    }
                }
            });
        }
    }
}

/* save status of filesystem tab before leaving */
function save_fs_status(){
    fsstatus = {};    
    $("#filesystem-table").find("tr").each(function(){
        var fsinfo = {}; 
        fsinfo["fs_type"] = $(this).find("td:nth-child(4)").find("select").val();
        fsinfo["mount_point"] = $(this).find("td:nth-child(5)").find("option:selected").val();
		fsstatus[$(this).find("td:nth-child(2)").text()] = fsinfo;
	});
}

/* main function of step switching control */
$(function (){    
    $("#wizard").steps({
        headerTag: "h2",
        bodyTag: "section",
        stepsOrientation: "vertical",
        transitionEffect: "fade",
        /* Right before step is to switch */
        onStepChanging:function (event, currentIndex, nextIndex){
            $(".wizard.vertical > .content").css("overflow","auto");
            if (currentIndex == 0  ){
                /* validate RAID */
                return validate_raid();                
            } else if (currentIndex == 1){
                /* save pvg selection status and validate LVM */
                save_pvg_status();
                return validate_lvm();
            } else if (currentIndex == 2){
                /* save fs/mountpoint selection status and validate */
                save_fs_status();
                if (currentIndex < nextIndex){
                    return validate_fs();
                }
                return true;                        
            } else if (currentIndex == 3){
                return true;
            }
        },
        /* After step is switched */
        onStepChanged: function (event, currentIndex, priorIndex)
        {
            $(".validate-error").tooltip("close");
            $("div .ui-tooltip").remove();
            if (currentIndex == 0){
                /* initially focus on the first RAID if exists */
                $("#raiddiv-0").click();
            } else if (currentIndex == 1){
                /* initially focus on the first VG if exists
                 * 1. load RAID config
                 * 2. get physical volume labels for LVMs to choose from 
                 * 3. draw the graph of Partitions
                 * 4. load previous LVMs input status
                 */
                $("#vg-0").click();
                get_raid_configs();
                get_pvg_labels();
                raphael();
                refresh_lvm();
            } else if(currentIndex == 2){
                /* 1. load LVM configs
                 * 2. get volumes for mount
                 * 3. intially show/validate the table for file system config
                 */
                get_lvm_configs();
                get_fs_labels();
                show_fs_table();
                validate_fs_table();
            } else if (currentIndex == 3){
                /* 1. load fs/mountpoint config 
                 * 2. generate the final json string
                 */
                get_fs_configs();
                generate();
            }
        },
    });
});
