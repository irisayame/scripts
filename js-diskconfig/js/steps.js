$(function ()
{
    $("#wizard").steps({
        headerTag: "h2",
        bodyTag: "section",
        stepsOrientation: "vertical",
        transitionEffect: "fade",
        onStepChanged: function (event, currentIndex, priorIndex)
        {
            $(".wizard.vertical > .content").css("overflow","visible");
            if(currentIndex == 1){
                raphael();
            }else if (currentIndex == 2){
                $(".wizard.vertical > .content").css("overflow","auto");
                generate();
            }
        }
    });
});
