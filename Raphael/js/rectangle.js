Raphael.fn.rectChart = function (cx, cy, values, labels, stroke) {
    var paper = this,
        chart = this.set();
    var totalwidth = 500,
        total = 0,
        height = 100,
        prewidth = cx,
        start = 0;
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
            var txt = paper.text(cx + prewidth+width/2, cy + height * 1.3, labels[j]).attr({fill: bcolor, stroke: "none", opacity: 0, "font-size": 20});
           prewidth = prewidth + width;
           p.mouseover(function () {
                p.stop().animate({transform: "s1 1.1 " + cx + " " + cy}, ms, "elastic");
                txt.stop().animate({opacity: 1}, ms, "elastic");
            }).mouseout(function () {
                p.stop().animate({transform: ""}, ms, "elastic");
                txt.stop().animate({opacity: 0}, ms);
            }); 
            chart.push(p);
            chart.push(txt);
            start += .1;
        };
    for (i = 0; i < values.length; i++) {
        process(i);
    }
    return chart;
};

$(function () {
    var values = [],
        labels = [];
    $("tr").each(function () {
        values.push(parseInt($("td", this).text(), 10));
        labels.push($("th", this).text());
    });
    $("table").hide();
    Raphael("holder", 1500, 700).rectChart(150, 150, values, labels, "#fff");
});
