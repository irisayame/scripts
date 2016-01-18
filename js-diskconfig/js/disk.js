count=1;
totalwidth=600;
minwidth=100;
minpartition=1;
maxpartition=totalwidth/minwidth;
disksize=120;
bccolor=808080;
raid_count=0;

values = [];
tags = [];
selected = [];


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

  count = count - 1;
  $("#count-block").html(count);
  for (var i=1; i<=count; i=i+1){
      var part_id = "#length-div-"+i;
      var info_id = "#info-div-"+i;
      var tag_id = "#tag-"+i;
      $(info_id).html(count-i+1);
      $(part_id).html(calculate(width));
      $(part_id).css("margin","1%");
      $(tag_id).html("Disk-"+(count-i+1));
  }

  $("#part-info-list td").each(function(){
    $(this).css("width", 80/count+"%");
  });
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
  //if (count%2 == 0){
  //   $("#div-"+count).css("background-color","lightblue");
 //}
  $("#div-"+count).css("background-color","#"+bccolor);
  $(window).load(loadresize());
  $("#div-1").empty();
  $("#count-block").html(count);
  $("<td id=\"info-div-"+count+"\"></td>").insertAfter($("#info-index"));
  $("<td id=\"length-div-"+count+"\"></td>").insertAfter($("#length-index"));
  $("<td id=\"tag-div-"+count+"\"><p id=\"tag-"+count+"\" class=\"inline\" onclick=\"addtag(this)\"></p></td>").insertAfter($("#tag-index"));
  $("td p").addEffect();
  for (var i=1; i<=count; i=i+1){
      var part_id = "#length-div-"+i;
      var info_id = "#info-div-"+i;
      var tag_id = "#tag-"+i;
      $(info_id).html(count-i+1);
      $(part_id).html(calculate(width));
      $(tag_id).html("Disk-"+(count-i+1));
      $(part_id).css("margin","1%");
  }
  $("#part-info-list td").each(function(){
      $(this).css("width", 80/count+"%");
  });

  if ($('input[type=radio]:checked').val()=="raid"){
    $(".ui-resizable-handle").remove();
  }
}

function collect_diskinfo(){
    values = [];
    tags = [];
    selected = [];
    $("#part-list").find("td").each(function(){
		values.push($(this).text());
	});
    $("#tag-list").find("td p").each(function(){
		tags.push($(this).text());
        selected.push(0);
	});
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
    raid_minpartition(raidtype)
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
     var replaceWith = $('<input type="text" id="temp-'+index+'" style="display:inline"/>');
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

