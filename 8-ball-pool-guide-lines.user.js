// ==UserScript==
// @name     8-ball-pool-guide-lines.user.js
// @version  1
// @include https://8ballpool.com*
// @require https://code.jquery.com/jquery-3.6.0.js
// ==/UserScript==


class Guide 
{
    con = null;

    
    POT_COLORS = 
    [
        "red",
        "green",
        "blue",
        "yellow",
        "magenta",
        "cyan"
    ];

    target =
    {
        x: 0,
        y: 0
    }

    holes =
    [
        {
            x: 632,
            y: 477
        },
        {
            x: 960,
            y: 477
        },
        {
            x: 1288,
            y: 477
        },
        
        {
            x: 1288,
            y: 800
        },
        {
            x: 960,
            y: 800
        },
        {
            x: 632,
            y: 800
        }
    ]

    constructor() 
    {
        for(let hole of this.holes)
        {
            hole.x -= 509;
            hole.y -= 283;
        }
        
    }

    drawLineWithBackground(x, y, x2, y2)
    {

    }

    render() 
    {
        var selectedColor = $("#color-selector").val();
        var con = this.con;
        var target = this.target;

        con.clearRect(0, 0, 900, 600);

        con.beginPath();
        con.arc(target.x, target.y, 10, 0, Math.PI * 2);
        con.lineWidth = 1;
        con.strokeStyle = "magenta";
        con.stroke();

        if(selectedColor == "none")
            return;



        function drawLineWithOutline(x, y, x2, y2, color)
        {
            con.strokeStyle = color;

            con.beginPath();
            con.moveTo(x, y);
            con.lineTo(x2, y2);
            
            con.lineWidth = 3;
            con.strokeStyle = "rgba(0, 0, 0, 0.3)";
            con.stroke();

            con.lineWidth = 1;
            con.strokeStyle = currentColor;
            con.stroke();
        }

        function radianFromPoints(x, y, x2, y2)
        {
            var deltaX = x - x2;
            var deltaY = y - y2;

            var atan = Math.atan2(deltaY, deltaX);

            return atan;
        }




        for(var i = 0; i < this.holes.length; i++)
        {
            var hole = this.holes[i];

            var currentColor = this.POT_COLORS[i];

            
            if(selectedColor == currentColor || selectedColor == "all")
            {
                let tempTarget = Object.assign({}, target);
                
                if(selectedColor == currentColor)
                {
                    con.strokeStyle = "rgba(255, 255, 255, 0.1)";
                    con.lineWidth = 20;
                    
                    con.beginPath();
                    con.moveTo(tempTarget.x, tempTarget.y);
                    con.lineTo(hole.x, hole.y);
                    con.stroke();


                    con.lineWidth = 1;
                    con.strokeStyle = currentColor;
                    var atan = radianFromPoints(tempTarget.x, tempTarget.y, hole.x, hole.y);
                    
                    var OFFSET = 30;
                    var OFFSET_TO_MARKER = 20;

                    tempTarget.x += Math.cos(atan) * OFFSET_TO_MARKER;
                    tempTarget.y += Math.sin(atan) * OFFSET_TO_MARKER;

                    atan += Math.PI / 2;

                    var cos = Math.cos(atan);
                    var sin = Math.sin(atan);

                    drawLineWithOutline(tempTarget.x, tempTarget.y, tempTarget.x + cos * OFFSET, tempTarget.y + sin * OFFSET);
                    drawLineWithOutline(tempTarget.x, tempTarget.y, tempTarget.x + -cos * OFFSET, tempTarget.y + -sin * OFFSET);
                }

                drawLineWithOutline(tempTarget.x, tempTarget.y, hole.x, hole.y, currentColor);
            }
        }

    }
}

var guide = new Guide();

$(document).ready(async function() 
{
    console.log("8ballpool.js is loaded");

    $("head").append(`
    <style>
        #gen-canvas{
            border: 1px solid red;
            position: fixed;
            pointer-events: none;
            z-index: 100;
            left: 0px;
            top: 0px;
            right: 0px;
            bottom: 0px;
            margin: auto;
        }

        #color-selector{
            position: absolute;
            left: -169px;
            top: -60px;
            width: 100px;
            z-index: 200;
            color:black;
        }
    </style>
    `);


    function sleep(amount)
    {
        return new Promise((resolve) =>setTimeout(resolve, amount));
    }

    async function waitForElement(query, duration = 30000)
    {
        var start = Date.now();

        var el = null;

        while(true)
        {
            el = $(query);

            if(Date.now() - start > duration || el.length > 0)
                break;

            await sleep(100);
        }

        return el;
    }



    var can = $(`<canvas id="gen-canvas" width="900" height="600"></canvas>`)[0];


    var game = await waitForElement("#iframe-game");

    if(game.length == 0)
        throw new Error("Unable to find iframe game");

    game.after(can);

    guide.con = can.getContext("2d");



    $(game).after(`
        <select id="color-selector">
        <option value="none" selected>None</option>
            ${guide.POT_COLORS.map(x => `<option>${x}</option>`)}
        </select>
    `);

    var colorSelector = $("#color-selector");

    colorSelector.on("change", function()
    {
        guide.render();
    });

    $(document).on("keypress", function(e)
    {
        if(e.key == "q")
        {
            var index = colorSelector.find("option:selected").index();

            index = ((index + 1) % colorSelector.find("option").length);

            colorSelector.find("option").eq(index).prop("selected", true);
            colorSelector.trigger("change");
        }
    });



    var leftDown = false;

    $(document).on("mousedown", function (e) 
    {
        console.log(e);

        if(e.button == 2)
        {
            leftDown = true;
            $(can).css("pointer-events", "auto");
        }
    });

    $(document).on("mousemove", function (e)
    {
        if(leftDown == false)
            return;

        guide.target.x = e.clientX - $(can).offset().left;
        guide.target.y = e.clientY - $(can).offset().top;

        guide.render();
    });

    $(document).on("mouseup", function (e) 
    {
        if(e.button == 2)
        {
            e.preventDefault();
            e.stopPropagation();
            leftDown = false;
            $(can).css("pointer-events", "none");
        }
    });

    document.oncontextmenu = function()
    {
        return false;   
    }
});
