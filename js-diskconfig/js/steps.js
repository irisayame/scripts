function generate(){
    var diskconfig = {"raid_arrays":raid_arrays, "lvm_volume_groups":lvm_groups,"filesystems":filesystems};
    $("#json-field").html(JSON.stringify(diskconfig,null,2));
   }


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

function save_fs_status(){
    fsstatus = {};    
    $("#filesystem-table").find("tr").each(function(){
        var fsinfo = {}; 
        fsinfo["fs_type"] = $(this).find("td:nth-child(4)").find("select").val();
        fsinfo["mount_point"] = $(this).find("td:nth-child(5)").find("option:selected").val();
		fsstatus[$(this).find("td:nth-child(2)").text()] = fsinfo;
	});
}

$(function (){    
    $("#wizard").steps({
        headerTag: "h2",
        bodyTag: "section",
        stepsOrientation: "vertical",
        transitionEffect: "fade",
        onStepChanging:function (event, currentIndex, nextIndex){
            $(".wizard.vertical > .content").css("overflow","auto");
            if (currentIndex == 0  ){
                /* validate RAID */
                return true;                
            } else if (currentIndex == 1){
                save_pvg_status();
                return true;
            } else if (currentIndex == 2){
                save_fs_status();
                if (currentIndex < nextIndex){
                    return validate_fs();
                }
                return true;                        
            } else if (currentIndex == 3){
                return true;
            }
        },
        onStepChanged: function (event, currentIndex, priorIndex)
        {
            $(".validate-error").tooltip("close");
            $("div .ui-tooltip").remove();
            if (currentIndex == 1){
                get_raid_configs();
                get_pvg_labels();
                raphael();
                refresh_lvm();
                $("#add-vg-btn").click();
            } else if(currentIndex == 2){
                get_lvm_configs();
                get_fs_labels();
                show_fs_table();
            } else if (currentIndex == 3){
                get_fs_configs();
                generate();
            }
        },
    });
});
