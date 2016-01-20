Raphael.fn.rectChart = function (cx, cy, values, labels, sizes, stroke) {
    var paper = this,
        chart = this.set();
    var totalwidth = 800,
        total = 0,
        height = 50,
        prewidth = cx,
        start = 0.3;
    function sector(cx, cy, prewidth, width, height, params) {
        var x1 = cx + prewidth,
            y1 = cy;
            return paper.rect(x1, y1, width, height, 0).attr(params);
    };
        process = function (j) {
            var value = values[j];
            var width = totalwidth * value/100;
            var popangle = 90,
                color = Raphael.hsb(start, .75, 1),
                ms = 500,
                bcolor = Raphael.hsb(start, 1, 1);
            var p = paper.rect(cx+prewidth, cy, width, height, 0).attr({fill: "90-" + bcolor + "-" + color, stroke: stroke, "stroke-width": 3});
            var txt = paper.text(cx + prewidth+width/2, cy + height * 1.5, labels[j]+": "+sizes[j]+" GB").attr({fill: bcolor, stroke: "none", opacity: 1, "font-size": 20});
            var tag = paper.text(cx + prewidth+width/2, cy + height/5, labels[j]).attr({fill:"#fff",stroke: "none", opacity: 1, "font-size": 20});

           prewidth = prewidth + width;
           p.mouseover(function () {
                p.stop().animate({transform: "s1 1.1 " + cx + " " + cy}, ms, "elastic");
                txt.stop().animate({transform: "s1 1.1 " + cx + " " + cy}, ms, "elastic");
                tag.stop().animate({transform: "s1 1.1 " + cx + " " + cy}, ms, "elastic");
            }).mouseout(function () {
                p.stop().animate({transform: ""}, ms, "elastic");
                txt.stop().animate({transform: ""}, ms, "elastic");
                tag.stop().animate({transform: ""}, ms, "elastic");
            }); 
            chart.push(p);
            chart.push(txt);
            chart.push(tag)
            start += .1;
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
        labels.push(key)
        sizes.push(value)
        values.push(parseInt(value)/1.2);
    });
    console.log(values)
    console.log(sizes)
    console.log(labels)
    $("#holder").empty();
    Raphael("holder", 900, 150).rectChart(10, 10, values, labels, sizes, "#fff");
}
