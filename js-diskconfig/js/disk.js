count=1; /* the number of blocks (include Unused) */
disksize=120; /* the disk capacity defined in the flavor */
totalwidth=600; /* the graphic length of the disk allocation bar can be adjusted */
remainwidth=totalwidth; /* not yet allocated disk size of total capacity */
initwidth=totalwidth*4/disksize; /* the minimum length of a partition allocated (size=4GB) */
minwidth=initwidth; /* except for the Unused one */
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
block_index = [""];/*  */
max_raids = 4; /* the max number of raids could be created, should be adjust later  TODO */
selected = []; /* mark the raid physical volumes have been selected  */

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

    var tablenode = $('<table border="1" style="width:60%;"><tr><th>No.</th><th>Label</th><th>Size</th><th>Use LVM</th></tr><tbody id="parttable-'+current_index+'"></tbody></table>');
    $("#raiddiv-"+current_index).append(tablenode);

    partition_index.push(0);
    $("#raiddiv-"+current_index).on("click",function(){
        var raid_id = $(this).attr("id");
        current_index = raid_id.split("-")[1];
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

function delete_raid(){
    if (raid_index <= 1){
        $("#delete-raid-btn").button("option", "disabled",true);
        $("#add-part-btn").button("option", "disabled",true);
    }
    while (current_part_index >= 0){  
        $("#delete-part-btn").click();
    }

    $("#add-raid-btn").button("option", "disabled",false);
    raid_index = raid_index - 1;
    $("#raiddiv-"+raid_index).remove();
    $("#raiddiv-"+(raid_index - 1)).click();
}


function add_partition(){
    /*
        1. add row to the selected RAID Table;
        2. add block to the resizable block bar(always add as the left sibling of the Unused block)
        3. add column to the overall block table;
        4. refresh the components of the tables and divs.

    */
    $("#delete-part-btn").button("option", "disabled", false);
    current_part_index = partition_index[current_index];
    $("#parttable-"+current_index).append('<tr class="partrow-'+current_part_index+'"><td>'+(current_part_index+1)+'</td><td><p id="label-p-'+current_part_index+'" class="label-'+current_part_index+' inline" onclick="addtag(this)" title="Click to edit">R'+(parseInt(current_index)+1)+'P'+(current_part_index+1)+'</p></td><td class="size-'+current_part_index+'"></td><td class="lvmlabel-'+current_part_index+'"><input type="checkbox" name="lvmlabel" checked></td></tr>');
    partition_index[current_index] = current_part_index+1;
    $("td p").addEffect();
    add_part_resizable();
}

function delete_partition(){
    /*
        1. delete last row of the selected RAID table;
        2. delete the corresponding div of the overall block bar;
        3. delete the column of the overall block table;
        4. update the components of the tables and divs.
    */
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

function calculate(width){
    return width*disksize/totalwidth;
}

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
      $(this).resizable("option", "maxWidth", totalWidth-minwidth);
      $(this).resizable("option", "minWidth", minwidth);
    },
  });
});};


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

  /* enable the resizable */
  $(window).load(loadresize());

  $("#div-1").empty();
  $("#count-block").html(count);

  refresh_add_block_table(width);
  $("#parttable-"+current_index+" .size-"+current_part_index).html(calculate(width)); /*refresh partition table inside raid div */
  block_index.push(current_index+"-"+current_part_index);
  
}

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
function refresh_add_block_table(width){
  $('<td id="number-col-'+count+'">'+(count-1)+'</td>').insertBefore("#number-col-1");
  $('<td id="size-col-'+count+'">'+calculate(width)+'</td>').insertBefore("#size-col-1");
  $('<td id="raidindex-col-'+count+'">RAID-'+(parseInt(current_index)+1)+'</td>').insertBefore("#raidindex-col-1");
  $('<td id="partindex-col-'+count+'">Partition-'+(current_part_index+1)+'</td>').insertBefore("#partindex-col-1");
  console.log("div-"+count+" title:"+" == label of ("+current_index+", "+current_part_index+")");
  $('#div-'+count).attr("title",$("#parttable-"+current_index+" .label-"+current_part_index).html() )
  //$("#number-col-1").html(count);
}

function refresh_delete_block_table(blockindex){
  $("#number-col-"+blockindex).remove();
  $("#size-col-"+blockindex).remove();
  $("#raidindex-col-"+blockindex).remove();
  $("#partindex-col-"+blockindex).remove();
  //$("#number-col-1").html(count);
   
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

$.fn.addEffect = function() {
   $(this).hover(function() {
      $(this).addClass('hover');
   }, function() {
      $(this).removeClass('hover');
   });
};

function addtag(element){
     console.log($(element).attr("id"));
     var index = $(element).attr("id").split("-")[1]
     var replaceWith = $('<input type="text" size="50" id="temp-'+index+'" style="display:inline;"/>');
     $(element).hide();
     $(element).after(replaceWith);
     if ($(element).text() != "click to edit"){
         replaceWith.val($(element).text());
     }
     replaceWith.focus();

     replaceWith.blur(function() {
       if (replaceWith.val() != "") {
           $(element).text(replaceWith.val());
       }
       replaceWith.remove();
       $(element).show();
     });
 };   

$(function(){
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

