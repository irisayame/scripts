count=1;
totalwidth=600;
minwidth=0;
minpartition=1;
maxpartition=5+1//totalwidth/minwidth;
disksize=120;
bccolor=808080;
raid_count=0;

disk_arrays={};
raid_arrays=[];
lvm_groups=[];
fslabels=[];
fssizes=[];
filesystems=[];
current_index = 0;
raid_array_count = 0;
max_raids = 1;


function add_raid(){
    if ( raid_array_count >= max_raids-1){
        $("#add-raid-btn").button("option", "disabled",true);
    }
    $("#delete-raid-btn").button("option", "disabled",false);
    $("#save-part-btn").button("option", "disabled",false);
    $("#partition-div").show();
    current_index = raid_array_count;
    var primary = false, checked="";
    if (current_index == 0){
        primary = true;
        checked="checked";
    }
    $("#current-index").html((current_index+1))
    var newrow = $("<tr id=\"raid-row-"+current_index+"\"><td>"+(raid_array_count+1)+"</td><td id=\"raidpartid-"+current_index+"\">0</td><td><input type=\"checkbox\" "+checked+" disabled=\"disabled\"</td></tr>");
    $("#raid-table").append(newrow);
    raid_arrays.push({"partitions":null,"primary_storage":primary})
    raid_array_count = raid_array_count + 1;
}

function delete_raid(){
    if (raid_array_count <= 2){
        $("#delete-raid-btn").button("option", "disabled",true);
    }
    $("#add-raid-btn").button("option", "disabled",false);
    raid_arrays.pop()
    raid_array_count = raid_array_count - 1;
    $("#raid-row-"+raid_array_count).remove();
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
      $("#info-"+div_id).html(count-div_number+1);
      $("#"+length_div_id).html(calculate(ui.element.outerWidth()));
      $("#info-div-"+(div_number-1)).html(count-div_number+2);
      $("#"+next_length_div_id).html(calculate(divTwoWidth));
    },
    start: function(e, ui) {
      $("#save-part-btn").button("option", "disabled",false);
      var next = ui.element.next();
      totalWidth = ui.element.outerWidth()+next.outerWidth();
      $(this).resizable("option", "maxWidth", totalWidth-minwidth);
      $(this).resizable("option", "minWidth", minwidth);
    },
  });
});};//]]> 


function delete_partition(){
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
  $("#save-part-btn").button("option", "disabled",false);
}

function add_partition(){
  bccolor = bccolor-111111;
  if (count == maxpartition-1){
      $("#add-part-btn").button("option","disabled",true);
  }
  if (count >= maxpartition){
      return;
  }
  count = count + 1;
  width = totalwidth/count;
  if (count > minpartition){
      $("#delete-part-btn").button("option","disabled",false);
  }

  $("#outer-div").prepend("<div id=\"div-"+count+"\" class=\"resizable resizable1 ui-resizable\" style=\"top 0px; left:0px;height:50px;\"><div id=\"split-"+count+"\" class=\"ui-resizable-handle ui-resizable-e\" style=\"z-index:1000;\"></div></div>");
  $(".resizable").css("width",width);
  $("#div-"+count).css("background-color","#"+bccolor);
  $(window).load(loadresize());
  $("#div-1").empty();
  $("#count-block").html(count);
  $("<td id=\"info-div-"+count+"\"></td>").insertAfter($("#info-index"));
  $("<td id=\"length-div-"+count+"\"></td>").insertAfter($("#length-index"));
  $("<td id=\"tag-div-"+count+"\"><p id=\"tag-"+count+"\" class=\"inline\" onclick=\"addtag(this)\" title=\"Click to edit\"></p></td>").insertAfter($("#tag-index"));
  $("<td id=\"lvmtag-div-"+count+"\"><input type=\"checkbox\" id=\"lvmtag-"+count+"\" checked></td>").insertAfter($("#lvmtag-index"));
  $("td p").addEffect();
  for (var i=1; i<=count; i=i+1){
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

  if ($('input[type=radio]:checked').val()=="raid"){
    $(".ui-resizable-handle").remove();
  }
}

function save_partition(){
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
    disk_arrays["Unused"]=values[values.length-1]   
    $("#save-part-btn").button("option", "disabled",true);
    console.log(JSON.stringify(raid_arrays,null,2))
    console.log(JSON.stringify(disk_arrays,null,2))
    $("#save-part-btn").button("option", "disabled",true);

}


$.fn.addEffect = function() {
   $(this).hover(function() {
      $(this).addClass('hover');
   }, function() {
      $(this).removeClass('hover');
   });
};

function raid_minpartition(raidtype){
    if (raidtype == "raid5"){
        minpartition = 4;
    } else if (raidtype == "raid6"){
        minpartition = 4;
    } else if (raidtype == "raid0"){
        minpartition = 2;
    } else if (raidtype == "raid1"){
        minpartition = 2;
    } else if (raidtype == "raid10"){
        minpartition = 2;
    }
}

function lvm_partition(){
    minpartition=1;
    while(count>minpartition){
        $("#delete-part-btn").click(); 
    }
}

function raid_partition(raidtype){
    var raidcount = minpartition;
    if ( count < raidcount ){
        while( count < raidcount){
            $("#add-part-btn").click();          
        }
    } else if  ( count > raidcount ){
        while( count > raidcount){
            $("#delete-part-btn").click();          
        }
    }
    $(".ui-resizable-handle").remove();
}

function addtag(element){
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

