count=1; // partition resizable count (include Unused)
totalwidth=600; // remain size
remainwidth=totalwidth;
initwidth=20;
minwidth=0;
minpartition=1;
maxpartition=5+1//totalwidth/minwidth;
disksize=120;
bccolor=808080;

disk_arrays={};
raid_arrays=[];
lvm_groups=[];
fslabels=[];
fssizes=[];
filesystems=[];
current_index = 0; // raid current index
raid_index = 0; // next raid index to create
current_part_index = 0;
partition_index = [];

max_raids = 4;

function printout(){
    console.log("current_index: "+current_index);
    console.log("raid_index: "+raid_index);
    console.log("partition_index: "+partition_index);
    console.log("current_part_index: "+current_part_index);

}

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
    var raidnode = $('<div id="raiddiv-'+current_index+'" style="margin:0 0 20px 20px;border-radius:10px; padding:5%" class="hover-div"><span style="width:10%;font-size:1.5em;float:left;font-weight:bold;padding:1%">RAID '+(raid_index+1)+'</span><div style="display:inline-block;float:left;vertical-align:top;margin-top:15px"><label for="primary">Primary</label><input type="checkbox" name="primary" '+checked+' /></div></div>');
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
        if (partition_index[current_index] <= 1){
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
    }
    $("#add-raid-btn").button("option", "disabled",false);
    raid_index = raid_index - 1;
    $("#raiddiv-"+raid_index).remove();
}


function add_partition(){
    $("#delete-part-btn").button("option", "disabled", false);
    current_part_index = partition_index[current_index];
    $("#parttable-"+current_index).append('<tr class="partrow-'+current_part_index+'"><td>'+(current_part_index+1)+'</td><td id="label-div-'+current_part_index+'"><p id="label-'+current_part_index+'" class="inline" onclick="addtag(this)" title="Click to edit">Partition-'+(current_part_index+1)+'</p></td><td id="size-'+current_part_index+'"></td><td id="lvmlabel-'+current_part_index+'"><input type="checkbox" name="lvmlabel" checked></td></tr>');
    partition_index[current_index] = current_part_index+1;

    $("td p").addEffect();
    add_part_resizable();
}

function delete_partition(){
    printout();
    if (partition_index[current_index] <= 1){
        $("#delete-part-btn").button("option", "disabled", true);
    }
    if (current_part_index < 0){
        return;
    }
    $("#parttable-"+current_index+" .partrow-"+current_part_index).remove();
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
      var div_number = div_id.split("-")[1];
      var length_div_id = "length-"+div_id;
      var next_length_div_id = "length-div-"+(div_number-1);

      var next = ui.element.next();
      var divTwoWidth = totalWidth - ui.element.outerWidth();
      next.width(divTwoWidth);
      //$("#info-"+div_id).html(count-div_number+1);
      //$("#"+length_div_id).html(calculate(ui.element.outerWidth()));
      //$("#info-div-"+(div_number-1)).html(count-div_number+2);
      //$("#"+next_length_div_id).html(calculate(divTwoWidth));
    },
    start: function(e, ui) {
      var next = ui.element.next();
      totalWidth = ui.element.outerWidth()+next.outerWidth();
      $(this).resizable("option", "maxWidth", totalWidth-minwidth);
      $(this).resizable("option", "minWidth", minwidth);
    },
  });
});};

//TODO
function delete_partition11(){
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
  width = totalwidth/(count-1);
  $("#div-"+count).remove();
  $(".resizable").css("width",width);
  $(window).load(loadresize());

  $("#length-div-"+count).remove();
  $("#info-div-"+count).remove();
  $("#tag-div-"+count).remove();
  $("#lvmtag-div-"+count).remove();

  count = count - 1;
  $("#count-block").html(count);
  for (var i=1; i<=count; i=i+1){
      $("#info-div-"+i).html(count-i+1);
      $("#length-div-"+i).html(calculate(width));
      $("#length-div-"+i).css("margin","1%");
      if (i > 1){
          $("#tag-"+i).html("Disk-"+(count-i+1));
      }
  }

  $("#part-info-list td").each(function(){
    $(this).css("width", 80/count+"%");
  });
 
}
//TODO
function add_part_resizable(){
  bccolor = bccolor-111111;
  if (count == maxpartition-1){
      $("#add-part-btn").button("option","disabled",true);
  }
  if (count >= maxpartition){
      return;
  }
  count = count + 1;
  width = initwidth//totalwidth/count;
  if (count > minpartition){
      $("#delete-part-btn").button("option","disabled",false);
  }
  var newnode = $('<div id="div-'+count+'" class="resizable resizable1 ui-resizable" style="top 0px; left:0px;height:50px;"><div id="split-'+count+'" class="ui-resizable-handle ui-resizable-e" style="z-index:1000;"></div></div>');
  newnode.insertBefore($("#div-1"));
  $("#div-"+count).css("width",width);
  remainwidth = remainwidth-width;
  $("#div-1").css("width",remainwidth);
  $("#div-"+count).css("background-color","#"+bccolor);
  $(window).load(loadresize());

  $("#div-1").empty();
  $("#count-block").html(count);

/*  for (var i=1; i<=count; i=i+1){
      $("#info-div-"+i).html(count-i+1);
      $("#length-div-"+i).html(calculate(width));
      if ( i > 1){
          $("#tag-"+i).html("Disk-"+(count-i+1));
      }
      $("#length-div-"+i).css("margin","1%");
  }
  $("#part-info-list td").each(function(){
      $(this).css("width", 80/count+"%");
  });
*/
}
//TODO
function get_raid_info(){
    $("#delete-raid-btn").button("option", "disabled",false);
    var values=[],tags=[],lvmtags=[];
    $("#part-list").find("td").each(function(){
		values.push($(this).text());
	});
    $("#tag-list").find("td p").each(function(){
		tags.push($(this).text());
	});
    $("#lvmtag-list").find("td input[type=checkbox]").each(function(){
		lvmtags.push($(this).is(":checked"));
	});
    $("#raidpartid-"+current_index).html(values.length-1);
    raid_arrays[current_index]["partitions"]=[];
    for (var i = 0; i < values.length - 1; i = i + 1){
        raid_arrays[current_index]["partitions"].push({"size":values[i], "label":tags[i], "lvm":lvmtags[i]});   
        disk_arrays[tags[i]]=values[i]     
    } 
    disk_arrays["Unused"]=values[values.length-1];

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
     var replaceWith = $('<input type="text" id="temp-'+index+'" style="display:inline; "/>');
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
    $("#number-col-1").html("1");
    $("#size-col-1").html(calculate(totalwidth));
   // $("td p").addEffect();
    $( "#add-part-btn" ).button({disabled: true});
    $( "#delete-part-btn" ).button({disabled: true});
    $( "#delete-raid-btn" ).button({disabled: true});
});

