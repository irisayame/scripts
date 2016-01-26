/* This file mainly contains the functions and variables for the LVM & File System config tabs.
 * 1. creation/deletion of Volume Groups;
 * 2. creation/deletion of logical volumes;
 * 3. selection of the Physical Partition for LVM;
 * 4. A graphic display of RAID creation status;
 * 5. selection of file system / mount point for Physical/Logical Volumes
 */



function get_pvg_labels(){
    pvglabels = [];
    pvgsizes = [];
    selected = [];
    for (var i in raid_arrays){
        for (var pi in raid_arrays[i]["partitions"]){
            if (raid_arrays[i]["partitions"][pi]["lvm"] == true){
                pvglabels.push(raid_arrays[i]["partitions"][pi]["partition_label"]);
                pvgsizes.push(raid_arrays[i]["partitions"][pi]["size"]);
                selected.push(0);
            }
        }
    }
}

function get_selection(){        
    var selectnode= $('<ol class="selectable" id="select-'+index+'" style="display:inline-block; padding-left:5px"></ol>');
    for (var i = 0; i < pvglabels.length; i = i + 1){
        selectnode.append($('<li id="vg-'+index+'-option-'+i+'" class="ui-widget-content option-'+i+'" value="'+pvglabels[i]+'">'+pvglabels[i]+' ('+pvgsizes[i]+'G)</li>'));
    }
    return selectnode;
}


function add_vol(){
    $("#delete-vol-btn").button("option", "disabled", false);
    current_vol_index = vol_index[current_vg_index];
    $("#vg-table-"+current_vg_index).append('<tr class="volrow-'+current_vol_index+'"><td>'+(parseInt(current_vol_index)+1)+'</td><td><p type="text" id="vollabel-'+current_vol_index+'" class="inline" onclick="addtag(this)" title="click to edit cannot be same with Physical Volume Partition Label">VG'+(current_vg_index+1)+'-LVM'+(current_vol_index+1)+'</p></td><td><input type="number" name="size" value="'+minsize+'" min="'+minsize+'" /></td></tr>');
    vol_index[current_vg_index] = current_vol_index+1;
}

function delete_vol(){
    if (vol_index[current_vg_index] <= 1){
        $("#delete-vol-btn").button("option", "disabled", true);
    }
    if (current_vol_index < 0){
        return;
    }
    $("#vg-table-"+current_vg_index+" .volrow-"+current_vol_index).remove();
    current_vol_index = current_vol_index - 1;
    vol_index[current_vg_index] = vol_index[current_vg_index] - 1;
}

function add_vg(){
    $("#delete-vg-btn").button("option", "disabled", false);
    $("#add-vol-btn").button("option", "disabled", false);
    $("#delete-vol-btn").button("option", "disabled", true);
    if (index > maxpvg){
        return;
    }
    current_vg_index = index;
    $("#pvg-label-div").append('<div id="vg-'+index+'" style="margin:0 0 20px 20px;border-radius:10px; padding:3%" class="hover-div"><h2>Volume Group '+(index+1)+'</h2><div style="display:inline-block;vertical-align:top;margin-top:15px"><label for="vg-label">Label: </label><input id="vg-label-'+index+'" type="text" value="VG-'+(index+1)+'" style="display:inline-block; margin-right:20px"/ ><label>Physical Volume Partition Label:</label></div></div>');
    $("#vg-"+index).append(get_selection());
    var tablenode = $('<table border="1"><tr><th>No.</th><th>Label</th><th>Size(GB)</th></tr><tbody id="vg-table-'+index+'"></tbody></table>');
    $("#vg-"+index).append(tablenode);

    $("#select-"+index).selectable({
        selected: function( event, ui){    
            var eleid = ui.selected.id;              
            var vg_index = parseInt(eleid.split("-")[1]);
            $("#vg-"+vg_index).click();
            var selected_index = parseInt(eleid.split("-")[3]);
            if (selected[selected_index] == 0){
                selected[selected_index] = 1;
                $(".option-"+selected_index).each(function(){
                    if ($(this).attr("id") != eleid){
                        $(this).addClass("block");
                    }
                });
            }
            //else{
            //    selected[selected_index] = 0;
            //    $(".option-"+selected_index).removeClass("block");
                
            //    $("#"+eleid).removeClass("ui-selected");
            //}
        },
        unselected: function( event, ui){                
            var selected_index = parseInt(ui.unselected.id.split("-")[3]);
            selected[selected_index] = 0;
            $(".option-"+selected_index).removeClass("block");
        },
        cancel:".block",
    });
    
    for (var i = 0; i < selected.length; i = i + 1){
        if (selected[i] == 1){
            $("#vg-"+index+"-option-"+i).addClass("block");
        }
    }
    vol_index.push(0);

    $(".hover-div").removeClass("highlight-div");
    $("#vg-"+index).addClass("highlight-div");
    $("#vg-"+index).on("click",function(){
        var vgid = $(this).attr("id");
        current_vg_index = parseInt(vgid.split("-")[1]);
        current_vol_index = parseInt(vol_index[current_vg_index]-1);
        $(".hover-div").removeClass("highlight-div");
        $(this).addClass("highlight-div");
        if (vol_index[current_vg_index] < 1){
            $("#delete-vol-btn").button("option", "disabled", true);
        } else{
            $("#delete-vol-btn").button("option", "disabled", false);
        }
        if (index - current_vg_index > 1){
            $("#delete-vg-btn").button("option", "disabled", true);
        } else if (index - current_vg_index == 1){
            $("#delete-vg-btn").button("option", "disabled", false);
        }
    });


    index = index + 1;
    if (index == maxpvg){
        $("#add-vg-btn").button("option", "disabled", true);
    }
}
function delete_vg(){
    $("#add-vg-btn").button("option", "disabled", false);
    if (index <= 0){
        return;
    }
    index = index - 1;
    $("#select-"+index+" .ui-selected").each(function(){           
        var option_id = $(this).attr("id");
        var option_index = parseInt(option_id.split("-")[3]);
        selected[option_index] = 0;
        $(".option-"+option_index).removeClass("block");
    });
    $("#vg-"+index).remove();
    $("#vg-"+(index-1)).click();
    vol_index.pop();
    
}
function get_lvm_configs(){
    lvm_groups = [];
    for (var i = 0; i < index; i = i + 1){
        // loop over VG 
        var lvg = {"vg_label":$("#vg-label-"+i).val(), "physical_volume_partition_labels":[],"logical_volumes":[]}
        $("#select-"+i+" .ui-selected").each(function(){
            lvg["physical_volume_partition_labels"].push($(this).attr("value"));
        });

        for (var j = 0; j < vol_index[i]; j = j + 1){
            /* loop over volume in every VG table */
            var lvm = {"size":"auto","label":null};
            lvm["label"] =  $("#vg-table-"+i+" .volrow-"+j+" p").html();
            lvm["size"] = $("#vg-table-"+i+" .volrow-"+j+" input[name=size]").val()+"G";
            lvg["logical_volumes"].push(lvm);
        }        
        lvm_groups.push(lvg);
    }
}

function save_pvg_status(){
    pvgstatus = [];
    for (var i = 0; i < index; i = i + 1){
        var selected_labels = [];
        $("#select-"+i+" .ui-selected").each(function(){
            selected_labels.push($(this).attr("value"));
        });
        pvgstatus.push(selected_labels);
    }    
}

function get_fs_labels(){
    fslabels = [];
    fssizes = [];
    // handle the RAID part (partitions.lvm == false)
    for (var i in raid_arrays){
        for (var pi in raid_arrays[i]["partitions"]){
            if (raid_arrays[i]["partitions"][pi]["lvm"] == false){
                fslabels.push(raid_arrays[i]["partitions"][pi]["partition_label"]);
                fssizes.push(raid_arrays[i]["partitions"][pi]["size"]);
            }
        }
    }
    // handle the lvm part
    for (var i in lvm_groups){
        for (var j in lvm_groups[i]["logical_volumes"]){
            fslabels.push(lvm_groups[i]["logical_volumes"][j]["label"]);
            fssizes.push(lvm_groups[i]["logical_volumes"][j]["size"]);
        }
    }
}

function get_fs_configs(){
    filesystems = [];    
    $("#filesystem-table").find("tr").each(function(){
        var fsinfo = {};
        fsinfo["label"] = $(this).find("td:nth-child(2)").text();
        fsinfo["fs_type"] = $(this).find("td:nth-child(4)").find("select").val();
        fsinfo["mount_point"] = $(this).find("td:nth-child(5)").find("option:selected").val();
		filesystems.push(fsinfo);
	});
}

function show_fs_table(){
    var tbody = $("#filesystem-table");
    tbody.empty();
    var fsoption = "<option value=\"\">Select...</option>";
    for (var i in fs_types){
        fsoption += "<option value=\""+fs_types[i]+"\">"+fs_types[i]+"</option>";
    }
    var mpoption = "<option value=\"\">Select...</option>";
    for (var i in mps){
        mpoption += "<option value=\""+mps[i]+"\">"+mps[i]+"</option>";
    }
    for (var i = 0; i < fslabels.length; i = i + 1){
        tbody.append('<tr><td>'+(i+1)+'</td><td>'+fslabels[i]+'</td><td>'+fssizes[i]+'</td><td><select class="fs-type"></select></td><td><select class="mountpoint" id="select-'+i+'"></select></td></tr>');
        mp_oldvalues["select-"+i] = "";
    }
    $(".fs-type").each(function(){
        $(this).append(fsoption);
    });
    $(".mountpoint").each(function(){
        $(this).append(mpoption);
    });
    $(".mountpoint").change(function() {
        prevalue = mp_oldvalues[$(this).attr("id")];
        mp_oldvalues[$(this).attr("id")] = $(this).val();
        $('option[value="'+ prevalue+'"]').removeAttr("disabled");
        if ($(this).val() != ""){
            $('option[value="'+ $(this).val()+'"]').attr("disabled", "disabled");
            $(this).find("option:selected").removeAttr("disabled");
        }
    });
    /* set the option chosen already */     
    $("#filesystem-table").find("tr").each(function(){
        if ( $(this).find("td:nth-child(2)").text() in fsstatus){
            var fs_type = fsstatus[$(this).find("td:nth-child(2)").text()]["fs_type"];
            var mount_point = fsstatus[$(this).find("td:nth-child(2)").text()]["mount_point"];
            $(this).find("td:nth-child(4) select").val(fs_type);
            $(this).find("td:nth-child(5) select").val(mount_point);   
        }
	});
    /* disable the selected option */
    $(".mountpoint").each(function(){
        if ( $(this).val() != ""){
            $('option[value="'+$(this).val()+'"]').attr("disabled", "disabled");
            $(this).find("option:selected").removeAttr("disabled");
        }    

    });
}

$(function() {
    index = 0; /* index of volume group (vg) */
    pvglabels = []; /* the labels of raid partitions which not for lvm */
    pvgsizes = []; /* the sizes of raid partitions which not for lvm, position corresponding to pvglabels */
    pvgstatus = []; /* hold the status of pvg selection, for the step switch operation */
    fsstatus = {};  /* hold the status of filesystem selection, for the step switch operation */
    maxpvg = 5;  /* the maximum number of volume groups TODO */
    minsize = 4;  /* the minimum size of logical volumes TODO */
    current_vg_index = 0;  /* the index of currently active volume group */
    current_vol_index = 0;  /* the index of current active volume in the table, always the last row */
    vol_index = [];  /* hold the index of volumes in every volume group, used for add/delete logical volume */
    fs_types=["ext2", "ext3", "ext4", "xfs", "btrfs"];  /* all available options for file system types TODO */
    mps=["/root", "/home", "/swp", "/mnt", "/var"];  /* all available options for mount point TODO */
    mp_oldvalues = {}; /* hold the old values of mount point, used for disable/enable options of mount point */

    $( "button" ).button();
    $("#delete-vg-btn").button("option","disabled",true);
    $("#add-vol-btn").button("option","disabled",true);
    $("#delete-vol-btn").button("option","disabled",true);

});
