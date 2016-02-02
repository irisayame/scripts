/* validate the info of RAID
 * 1. Volume Label (including physical & logical) should be unique
 */
function validate_raid(){
    $(".validate-error").removeClass("validate-error");
    var succeed = true;
    pvm_labels = [];
    $("#raid-div").children().each(function(){
        $(this).find("td:nth-child(2) p").each(function(){
            if (jQuery.inArray($(this).html(), pvm_labels) == -1 && jQuery.inArray($(this).html(),lvm_labels) == -1 ){
                pvm_labels.push($(this).html());
            } else{
                succeed = false;
                show_validation($(this), "label not unique!");
                $(this).css("color","red");
            }
        });
    });

    return succeed
}

/* validate the info of Logical Volume 
 * 1. the total number of LVMs
 * 2. Size constraints of LVM and PVM inside of every Volume group
 * 3. Volume Label (including physical & logical) should be unique
 * 4. Label and Size assigned with nontrivial value.
 */
function validate_lvm(){
    $(".validate-error").removeClass("validate-error");
    $("div .ui-tooltip").remove();
    var succeed = true;
    if ( index > maxpvg ){
        var label_pvg = $("#lvg-div h2");
        show_validation(label_pvg, "Too many volume groups.");
        succeed = false;
    }

    $("#pvg-label-div").children().each(function(){
        /* check if the size of LVM is less than the pv group selected of every volume group */
        var pvgtotalsize = 0;
        $(this).find(".ui-selected").each(function(){
            var index = jQuery.inArray($(this).attr("value"), pvglabels);
            pvgtotalsize += parseInt(pvgsizes[index]);
        });
        var lvmtotalsize = 0;
        $(this).find("td input[type=number]").each(function(){
            lvmtotalsize += parseInt($(this).val());
        });
        if ( pvgtotalsize < lvmtotalsize ){
            succeed = false;
            $(this).find("h2").append('<div class="ui-tooltip" style="display:inline;margin-left:2%;max-width:80%;border-color:#999"><span class="validate-emphasize">Size cannot exceed the capacity of the PV Group!</span></div>');
        }
        
        /* check if the label for every lvm is unique */
        lvm_labels = [];
        $(this).find("td:nth-child(2) p").each(function(){
            if (jQuery.inArray($(this).html(), pvm_labels) == -1 && jQuery.inArray($(this).html(), lvm_labels) == -1 ){
                lvm_labels.push($(this).html());
            } else {
                show_validation($(this), "label not unique!");
                $(this).css("color","red");
                succeed = false;
            }
        });
        
    });
    
    $("input[type=text]").each(function(){
        if ($(this).val() == "") {
            show_validation($(this), "should not be empty!");
            succeed = false;
        } 
    });

    $("input[type=number]").each(function(){
        if ( $(this).val() == "" ){
            /* TODO empty string treat as auto */
            show_validation($(this), "Need to specify the size.");
            succeed = false;
            $(this).addClass("validate-error");
        } else if (parseInt($(this).val()) < min_partition_size){
            show_validation($(this), "Size should no less than 4 GB.");
            $(this).addClass("validate-error");
            succeed = false;
        }
    });

    return succeed
}

/* validate the table of file system right after switching to the page
 * 1. mount point no more than 5
 */
function validate_fs_table(){
    if ($("#filesystem-table").children().length > 5){
        $("#wizard-p-2 h1").append('<div class="ui-tooltip" style="display:inline;margin-left:2%;max-width:80%;border-color:#999"><span class="validate-emphasize">Too Many Partitions!</span></div>');
        return false;
    }
    return true;
}

/* validate the file system/mount point selection
 * 1. every dropbox is selected with some nontrivial option;
 * 2. root folder more than 10G
 * 3. orinary folder more than 4G
 */
function validate_fs(){
    $(".validate-error").removeClass("validate-error");
    var succeed = validate_fs_table();

    $("#filesystem-table tr").each(function (){
        var fs_select = $(this).find("td:nth-child(4) select");
        var mp_select = $(this).find("td:nth-child(5) select");
        var size_element = $(this).find("td:nth-child(3)");
        if (fs_select.val() == ""){
            show_validation(fs_select, "choose a file system type.")
            succeed = false;
           
        } else{fs_select.css("color", "black");}
        if (mp_select.val() == ""){
            show_validation(mp_select, "choose a mount point.")
            succeed = false;
        }
        if (mp_select.val()== "/root"){
            if (parseInt(size_element.html()) < ROOT_SIZE){
                show_validation(mp_select, "Root Disk cannot be less than 10G .")
                succeed = false;
            }
        }else{
            if (parseInt(size_element.html()) < MIN_DISK_SIZE){
                show_validation(mp_select, "Disk Size cannot be less than 4G.")
            succeed = false;
            }
        }
    });
    return succeed;
}
/* common used for show message when validation fails */
function show_validation(element, message){
    element.addClass("validate-error"); 
    element.attr("title", message);
    element.tooltip({
        position: {
            my: "left top",
            at: "right+5 top-5"
            },
        });
    element.tooltip("open");
    
    /*
    setTimeout(function() {
          element.tooltip("close");
          }, 10000);
    */
}

$(function(){
    pvm_labels = []; /* hold the labels of raid partitions which not for LVM */
    lvm_labels = []; /* hold the labels of LVM */
    ROOT_SIZE=10;  /* Minimum size of root folder */
    MIN_DISK_SIZE=4;  /* Minimum size of all folder */

});

