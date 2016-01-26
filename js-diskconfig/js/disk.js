/* This file mainly contains the functions and variables for the RAID config tabs.
 * 1. RAID creation/deletion;
 * 2. Partition creation/deletion;
 * 3. Resizable block bar & block table;
 */

/* Handling the creation of one RAID */
function add_raid(){
    if ( raid_index >= max_raids-1){
        $("#add-raid-btn").button("option", "disabled", true);
    }
    $("#delete-raid-btn").button("option", "disabled",false);
    $("#add-part-btn").button("option", "disabled",false);
    current_index = raid_index;
    var primary = false, checked="";
    if (current_index == 0){
        primary = true;
        checked="checked";
    }
    var raidnode = $('<div id="raiddiv-'+current_index+'" style="margin:0 0 20px 20px;border-radius:10px; padding:5%" class="hover-div"><span style="width:10%;font-size:1.5em;float:left;font-weight:bold;padding:1%">RAID '+(raid_index+1)+'</span><div style="display:inline-block;float:left;vertical-align:top;margin-top:15px"><label for="primary">Primary</label><input type="radio" name="primary" '+checked+' /></div></div>');
    $("#raid-div").append(raidnode);

    var tablenode = $('<table border="1" style="width:60%;"><tr><th>No.</th><th>Label</th><th>Size (GB)</th><th>Use LVM</th></tr><tbody id="parttable-'+current_index+'"></tbody></table>');
    $("#raiddiv-"+current_index).append(tablenode);

    partition_index.push(0);
    $("#raiddiv-"+current_index).on("click",function(){
        var raid_id = $(this).attr("id");
        current_index = parseInt(raid_id.split("-")[1]);
        current_part_index = partition_index[current_index]-1;
        $(".hover-div").removeClass("highlight-div");
        $(this).addClass("highlight-div");
        if (partition_index[current_index] <= 0){
            $("#delete-part-btn").button("option", "disabled", true);
        } else{
            $("#delete-part-btn").button("option", "disabled", false);
        }
        if (raid_index - current_index > 1){
            $("#delete-raid-btn").button("option", "disabled", true);
        } else if (raid_index - current_index == 1){
            $("#delete-raid-btn").button("option", "disabled", false);
        }
    });
    $("#raiddiv-"+raid_index).click();
    raid_index = raid_index + 1;
}

/* Handling deletion of one RAID */
function delete_raid(){
    if (raid_index <= 1){
        $("#delete-raid-btn").button("option", "disabled", true);
        $("#add-part-btn").button("option", "disabled", true);
    }
    while (current_part_index >= 0){  
        $("#delete-part-btn").click();
    }

    $("#add-raid-btn").button("option", "disabled",false);
    raid_index = raid_index - 1;
    $("#raiddiv-"+raid_index).remove();
    $("#raiddiv-"+(raid_index - 1)).click();
}

/* Entry point of add partition
 * 1. add row to the selected RAID Table;
 * 2. add block to the resizable block bar(always add as the left sibling of the Unused block)
 * 3. add column to the overall block table;
 * 4. refresh the components of the tables and divs.

*/
function add_partition(){
    $("#delete-part-btn").button("option", "disabled", false);  
    current_part_index = partition_index[current_index];
    $("#parttable-"+current_index).append('<tr class="partrow-'+current_part_index+'"><td>'+(current_part_index+1)+'</td><td><p id="label-p-'+current_part_index+'" class="label-'+current_part_index+' inline" onclick="addtag(this)" title="Click to edit">R'+(parseInt(current_index)+1)+'P'+(current_part_index+1)+'</p></td><td class="size-'+current_part_index+'"></td><td class="lvmlabel-'+current_part_index+'"><input type="checkbox" name="lvmlabel" checked></td></tr>');
    partition_index[current_index] = current_part_index+1;
    $("td p").addEffect();
    add_part_resizable();
}

/* Entry point of delete partition
 * 1. delete last row of the selected RAID table;
 * 2. delete the corresponding div of the overall block bar;
 * 3. delete the column of the overall block table;
 * 4. update the components of the tables and divs.
 */
function delete_partition(){
    if (partition_index[current_index] <= 1){
        $("#delete-part-btn").button("option", "disabled", true);
    }
    if (current_part_index < 0){
        return;
    }
    $("#parttable-"+current_index+" .partrow-"+current_part_index).remove();

    delete_part_resizable();

    current_part_index = current_part_index - 1;
    partition_index[current_index] = partition_index[current_index] - 1;
}

/* Calculate the disk size from the block width */
function calculate(width){
    return Math.round(width*disksize/totalwidth);
}

/* Controller of resizable block bar
 * 1. set the max/min width of every div;
 */
function loadresize(){$(function() {
  var width = totalwidth/count;
  $(".resizable1").resizable({
    autoHide: false,
    handles: 'e',
    resize: function(e, ui) {
      var div_id = $(this).attr("id");
      var div_index = div_id.split("-")[1];
      var next_index = parseInt(div_index) + 1;
      if (next_index > count){next_index = 1;}
      var size_td_id = "size-col-"+div_index;
      var next_size_td_id = "size-col-"+next_index;

      var next = ui.element.next();
      var divTwoWidth = totalWidth - ui.element.outerWidth();

      if (ui.element.next().attr("id") == "div-1" && divTwoWidth >= initwidth){
          $("#add-part-btn").button("option", "disabled", false);
      } else if (ui.element.next().attr("id") == "div-1" && divTwoWidth < initwidth) {
          $("#add-part-btn").button("option", "disabled", true);
      }

      next.width(divTwoWidth);
      $("#"+size_td_id).html(calculate(ui.element.outerWidth()));
      $("#"+next_size_td_id).html(calculate(divTwoWidth));

      /* update size column of partition table inside raid div */
      var raidindex = block_index[div_index-1].split("-")[0];
      var partindex = block_index[div_index-1].split("-")[1];
      $("#parttable-"+raidindex+" .size-"+partindex).html(calculate(ui.element.outerWidth()));

      if (next_index <= 1){return;}
      var nextraidindex = block_index[next_index-1].split("-")[0];
      var nextpartindex = block_index[next_index-1].split("-")[1];
      $("#parttable-"+nextraidindex+" .size-"+nextpartindex).html(calculate(divTwoWidth));

    },
    start: function(e, ui) {
      var next = ui.element.next();
      totalWidth = ui.element.outerWidth()+next.outerWidth();
      if (next.attr("id") == "div-1"){
        $(this).resizable("option", "maxWidth", totalWidth);
      } else {
        $(this).resizable("option", "maxWidth", totalWidth-minwidth);
      }
      if ($(this).attr("id") == "div-1"){
        $(this).resizable("option", "minWidth", 0);
      } else{
        $(this).resizable("option", "minWidth", minwidth);
      }
    },
  });
});};

/* Handling the block bar every time a partition is created 
 * 1. update add-partition-button status according to whether it meets the max number of partitions can be created (currently tricky);
 * 2. add new block to the bar, adjust its properties, and pay attention to the Ununsed block (width)
 * 3. refresh the block table, pay attention to the Unused block (size)
 * 4. update the block_index array, to make sure the map of index(Raid,partition) and index(block) correct
 */
function add_part_resizable(){
  remainwidth = $("#div-1").width();
  bccolor = bccolor-111111;
  if (count == maxpartition-1){
      $("#add-part-btn").button("option","disabled",true);
  }
  if (count >= maxpartition){
      return;
  }
  count = count + 1; /* count increment 1 here !!!*/
  width = initwidth; //totalwidth/count;
  if (count > minpartition){
      $("#delete-part-btn").button("option","disabled",false);
  }

  /* add new block and initial it. */
  var newnode = $('<div id="div-'+count+'" class="resizable resizable1 ui-resizable" style="top 0px; left:0px;height:50px;"><div class="ui-resizable-handle ui-resizable-e" style="z-index:1000;"></div></div>');
  newnode.insertBefore($("#div-1"));
  $("#div-"+count).css("width",width);
  $("#div-"+count).css("background-color","#"+bccolor);

  /* adjust the size of block on the right edge */
  remainwidth = remainwidth-width;
  $("#div-1").css("width",remainwidth);
  if(remainwidth < initwidth){
      $("#add-part-btn").button("option", "disabled",true);
  }

  /* enable the resizable */
  $(window).load(loadresize());

  $("#div-1").empty();
  $("#count-block").html(count);

  refresh_add_block_table(width);
  $("#parttable-"+current_index+" .size-"+current_part_index).html(calculate(width)); /*refresh partition table inside raid div */
  block_index.push(current_index+"-"+current_part_index);
  
}

/* handling the block bar when a partition is deleted
 * 1. update the status of delete-partition-button;
 * 2. update the block bar by removing deleted one, and pay attention to the Ununsed block (width)
 * 3. refresh the block table, pay attention to the Unused block;
 * 4. update the block_index array
 */
function delete_part_resizable(){
  bccolor = bccolor+111111;
  if (count == minpartition+1){
      $("#delete-part-btn").button("option", "disabled",true);
  }
  if (count <=minpartition ){
      return;
  }
  if (count <= maxpartition){
      $("#add-part-btn").button("option","disabled",false);
  }

  var blockindex = jQuery.inArray(current_index+"-"+current_part_index, block_index);
  var sparewidth = $("#div-"+(blockindex+1)).width();
  remainwidth = $("#div-1").width();
  remainwidth += sparewidth;
  $("#div-"+(blockindex+1)).remove();
  $("#div-1").css("width",remainwidth);
  $("#size-col-1").html(calculate(remainwidth));
  count = count - 1;
  $("#count-block").html(count);

  /* refresh block table */
  refresh_delete_block_table(blockindex+1);

  block_index.splice(blockindex, 1);
 
}

/* refresh the block table every time a partition is added 
 * 1. update the block table to contain the info of newly created partition: No., size, Raid-index, Partition-index
 * 2. add the title of the newly created block div in the block bar
 * 3. update the size of Unused block (minus the newly created one)
 */
function refresh_add_block_table(width){
  $('<td id="number-col-'+count+'">'+(count-1)+'</td>').insertBefore("#number-col-1");
  $('<td id="size-col-'+count+'">'+calculate(width)+'</td>').insertBefore("#size-col-1");
  $('<td id="raidindex-col-'+count+'">RAID-'+(current_index+1)+'</td>').insertBefore("#raidindex-col-1");
  $('<td id="partindex-col-'+count+'">Partition-'+(current_part_index+1)+'</td>').insertBefore("#partindex-col-1");

  remainwidth = $("#div-1").width(); 
  $("#size-col-1").html(calculate(remainwidth));

  //$('#div-'+count).attr("title",$("#parttable-"+current_index+" .label-"+current_part_index).html() );
  $('#div-'+count).attr("title", "RAID"+(current_index+1)+", Partition"+(current_part_index+1) );
}

/* refresh the block table every time a partition is deleted.
 */
function refresh_delete_block_table(blockindex){
  $("#number-col-"+blockindex).remove();
  $("#size-col-"+blockindex).remove();
  $("#raidindex-col-"+blockindex).remove();
  $("#partindex-col-"+blockindex).remove();
   
  for (var i = blockindex; i < count+2; i++){
    $("#number-col-"+i).html($("#number-col-"+i).html()-1);
    $("#number-col-"+i).attr("id","number-col-"+(i-1));
    $("#size-col-"+i).attr("id","size-col-"+(i-1));
    $("#raidindex-col-"+i).attr("id","raidindex-col-"+(i-1));
    $("#partindex-col-"+i).attr("id","partindex-col-"+(i-1));
    $("#div-"+i).attr("id","div-"+(i-1));
    $("#div-"+i).css("color",bccolor);
  }
}

/* summary the configs of RAID, will be called when switching out from RAID config tab */
function get_raid_configs(){
    raid_arrays = [];
    disk_arrays = {};
    $("#raid-div").children().each(function(){
        var oneraid = {"primary_storage":$(this).find("input[type=radio]").is(":checked"), "partitions":[]};
        var raidindex = $(this).attr("id").split("-")[1];
        $(this).find("#parttable-"+raidindex+" tr").each(function(){
            var onepartition = {"size":$(this).find(":nth-child(3)").html(), "partition_label":$(this).find("p").html(), "lvm":$(this).find("input[name=lvmlabel]").is(":checked")};
            oneraid["partitions"].push(onepartition);
            disk_arrays[onepartition["partition_label"]] = onepartition["size"];
        });     
        raid_arrays.push(oneraid);
            disk_arrays["Unused"] = $("#size-col-1").html();
    });
}


/* effects of the tag edit, use an input box instead of <p> when click in the cell  */
$.fn.addEffect = function() {
   $(this).hover(function() {
      $(this).addClass('hover');
   }, function() {
      $(this).removeClass('hover');
   });
};

function addtag(element){
    var index = $(element).attr("id").split("-")[1]
    var replaceWith = $('<input type="text" size="50" id="temp-'+index+'" style="display:inline;"/>');
    $(element).hide();
    $(element).css("color","black");
    $(element).after(replaceWith);
    replaceWith.val($(element).text());
    replaceWith.focus();

    replaceWith.blur(function() {
        if (replaceWith.val() != "") {
           $(element).text(replaceWith.val());
           replaceWith.remove();
           $(element).show();
           $(element).attr("title","");
        } else{
            replaceWith.remove();
            $(element).show();
            show_validation($(element), "should not be empty!");
            setTimeout(function() {
                   $(element).tooltip("close");
                  }, 2000);
                }
    });
 };   

$(function(){
    count=1; /* the number of blocks (include Unused) */
    disksize=120; /* the disk capacity defined in the flavor TODO */
    totalwidth=600; /* the graphic length of the disk allocation bar can be adjusted */
    remainwidth=totalwidth; /* not yet allocated disk size of total capacity */
    min_partition_size=4;/* the minimum size of a partition allocated (4GB) */
    minwidth=totalwidth*min_partition_size/disksize; /* except for the Unused one */
    initwidth=10*minwidth; /* the initial length of a partition newly allocated (size=4GB) */
    minpartition=1; /* at least allocate one partition */
    maxpartition=10; /* at most equals totalwidth/minwidth; TODO */
    bccolor=999999; /* initial graphic color of paritions */

    disk_arrays={};  /* hold block details */
    raid_arrays=[]; /* hold details of raid partitions */
    lvm_groups=[]; /* hold details of logical volumes */
    fslabels=[]; /* hold labels of partitions need to be assigned with file systems */
    fssizes=[]; /* hold sizes of partitions need to be assigned with file systems */
    filesystems=[]; /* hold details of file systems and mount points */
    current_index = 0; /* raid current index */
    raid_index = 0; /* next raid index to create, equals to the numbers of current allocated raids */
    current_part_index = 0; /* current index of partitions of the current raid */
    partition_index = []; /* hold the next partition index to create of all raids */

    max_raids = 1; /* the max number of raids could be created, should be adjust later  TODO */
    selected = []; /* mark the raid physical volumes have been selected  */

    /* !! hold the map of RAID-Parition index and block index of partitions created.
     * First element for Unused block, with empty string for no RAID-Parition index.
     */
    block_index = [""];

    $("#disk-size").html(disksize);
    $("#outer-div").css("width", totalwidth);
    $("#div-1").css("width", totalwidth);
    $("#div-1").attr("title", "Unused");
    $("#div-1").css("background-color", "#FFFFFF");
    $("#size-col-1").html(calculate(totalwidth));
    $( "#add-part-btn" ).button({disabled: true});
    $( "#delete-part-btn" ).button({disabled: true});
    $( "#delete-raid-btn" ).button({disabled: true});
});

