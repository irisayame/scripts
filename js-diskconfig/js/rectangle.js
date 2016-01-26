Raphael.fn.rectChart = function (cx, cy, values, labels, sizes, stroke) {
    var paper = this,
        chart = this.set();
    var totalwidth = 800,
        total = 0,
        height = 50,
        prewidth = cx,
        cindex = 1,
        cdelta = 200/(labels.length+2);
        process = function (j) {
            var value = values[j];
            var width = totalwidth * value/100;
            var popangle = 90,
                ms = 1000,
                bcolor = Raphael.rgb(200-cdelta*cindex, 200-cdelta*cindex, 200-cdelta*cindex);            
            var p = paper.rect(cx+prewidth, cy, width, height, 0).attr({fill: bcolor, stroke: stroke, "stroke-width": 3});;
            var txt = paper.text(cx + prewidth+width/2, cy + height*1.5 , sizes[j]+" GB").attr({fill: bcolor, stroke: "none", opacity: 1, "font-size": "14" });
            var tag = paper.text(cx + prewidth+width/2, cy + height/2 , labels[j]).attr({fill:"#fff",stroke: "none", opacity: 1, "font-size": 12});
            if ( width < 50 ){
                txt.rotate(90);
                tag.rotate(90);
            }
           prewidth = prewidth + width;
            
           p.mouseover(function () {
                p.stop().animate({transform: "s1 1.1 " + cx + " " + cy}, ms, "elastic");
                if ( width < 50 ){
                    txt.stop().animate({transform: "s1 1.1 " + cx + " " + cy + " r90"}, ms, "elastic");
                    tag.stop().animate({transform: "s1 1.1 " + cx + " " + cy + " r90"}, ms, "elastic");
                }else{
                    txt.stop().animate({transform: "s1 1.1 " + cx + " " + cy}, ms, "elastic");
                    tag.stop().animate({transform: "s1 1.1 " + cx + " " + cy}, ms, "elastic");
                }
            }).mouseout(function () {
                p.stop().animate({transform: ""}, ms, "elastic");
                if ( width < 50 ){
                    txt.stop().animate({transform: "r90"}, ms, "elastic");
                    tag.stop().animate({transform: "r90"}, ms, "elastic");
                } else{
                    txt.stop().animate({transform: ""}, ms, "elastic");
                    tag.stop().animate({transform: ""}, ms, "elastic");
                }
            }); 
            chart.push(p);
            chart.push(txt);
            chart.push(tag);
            cindex += 1;
        };
    for (i = 0; i < values.length; i++) {
        process(i);
    }
    return chart;
};

function raphael() {
    var values = [];
    var sizes = [];
    var labels = [];
    $.each(disk_arrays,function(key,value){
        if (key != "Unused"){
            labels.push(key)
            sizes.push(value)
            values.push(parseInt(value)/1.2);
        }
    });
    labels.push("Unused")
    sizes.push(disk_arrays["Unused"])
    values.push(parseInt(disk_arrays["Unused"])/1.2);
    $("#holder").empty();
    Raphael("holder", 900, 150).rectChart(10, 10, values, labels, sizes, "#fff");
}
