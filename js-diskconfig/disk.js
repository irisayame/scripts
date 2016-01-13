count=1;
totalwidth=600;
minwidth=100;
maxpartition=totalwidth/minwidth;
disksize=120;

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
  if (count == 2){
      $("#delete-part-btn").prop("disabled",true);
  }
  if (count <=1 ){
      return;
  }
  if (count <= maxpartition){
      $("#add-part-btn").prop("disabled",false);
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
      $(info_id).html(count-i+1);
      $(part_id).html(calculate(width));
      $(part_id).css("margin","1%");
  }
 
  
}

function add_partition(){
  if (count == maxpartition-1){
      $("#add-part-btn").prop("disabled",true);
  }
  if (count >= maxpartition){
      return;
  }
  count = count + 1;
  width = totalwidth/count;
  if (count > 1){
      $("#delete-part-btn").prop("disabled",false);
  }

  $("#outer-div").prepend("<div id=\"div-"+count+"\" class=\"resizable resizable1 ui-resizable\" style=\"top 0px; left:0px;height:50px;\"><div id=\"split-"+count+"\" class=\"ui-resizable-handle ui-resizable-e\" style=\"z-index:1000;\"></div></div>");
  $(".resizable").css("width",width);
  if (count%2 == 0){
     $("#div-"+count).css("background-color","lightblue");
  }
  $(window).load(loadresize());
  $("#div-1").empty();
  $("#count-block").html(count);
  $("<td id=\"info-div-"+count+"\"></td>").insertAfter($("#info-index"));
  $("<td id=\"length-div-"+count+"\"></td>").insertAfter($("#length-index"));
  $("<td id=\"tag-div-"+count+"\"><p id=\"tag-"+count+"\" onclick=\"addtag(this)\">click to edit</p></td>").insertAfter($("#tag-index"));
  $("td p").addEffect();
  for (var i=1; i<=count; i=i+1){
      var part_id = "#length-div-"+i;
      var info_id = "#info-div-"+i;
      $(info_id).html(count-i+1);
      $(part_id).html(calculate(width));
      $(part_id).css("margin","1%");
  }
}

function generate(){
    var diskconfig = {"raid_arrays":null, "filesystems":null};
    var values = [];
    var tags = [];
    $("#part-list").find("td").each(function(){
		values.push($(this).text());
	});
    $("#tag-list").find("td p").each(function(){
		tags.push($(this).text());
	});
    var raid_arrays = [{"primary": true, "partitions":[]}];
    var filesystems = []
    for (var i in values){
      raid_arrays[0]["partitions"].push({"size":values[i], "label":tags[i]});
      filesystems.push({"label":tags[i], "mount_point":null, "fs_type":null})
    }  
    diskconfig["raid_arrays"] = raid_arrays
    diskconfig["filesystems"] = filesystems
    $("#json-field").html(JSON.stringify(diskconfig));
   }

$.fn.addEffect = function() {
   $(this).hover(function() {
      $(this).addClass('hover');
   }, function() {
      $(this).removeClass('hover');
   });
};

function addtag(element){
     var index = $(element).attr("id").split("-")[1]
     var replaceWith = $('<input type="text" id="temp-'+index+'" />');
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
