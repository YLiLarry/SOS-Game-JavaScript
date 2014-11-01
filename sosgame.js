"use strict";
var DEBUG = true;
var debugList = [];
function debug(name, val, asset) {
    if (!DEBUG) {return;}
    var p;
    var text = (typeof val === 'undefined') ? (name+"; ") : (name+": "+val+"; ");
    if (debugList.indexOf(name) == -1) {
        p = document.createElement("p");
        var t = document.createTextNode(text);
        p.id = 'debug_' + name;
        p.className = 'debug';
        p.appendChild(t);
        document.getElementsByTagName('body')[0].appendChild(p);
        debugList.push(name);
    } else {
        p = document.getElementById('debug_' + name);
        p.textContent = text;
    }
    if (typeof asset !== 'undefined' && asset !== val) {
        p.setAttribute('style','color: rgb(225,0,0)');
    }

}

function loadSOSGame(canvasName) {
    /* Global Variables */
    var canvas = document.getElementById(canvasName);
    var ctx = canvas.getContext("2d");
    /* Helpers */
    function convasX(x) {return x - canvas.offsetLeft;}
    function convasY(y) {return y - canvas.offsetTop;}
    function neg(OS) {return (OS == 'S' ? 'C' : 'S');}

    /* All Definitions */
    
    var GameLogic = new (function GameLogic() {
        this.chessboard = [];
        this.start = function(size) {
            this.size = size;
            // create a size x size chessboard;
            for (var i = 0; i < size; ++i) {
                this.chessboard.push([]);
                for (var j = 0; j < size; ++j) {
                    this.chessboard[i].push(' ');
                }
            }
        };
        var OS = function(x, y, OS) {
            chessboard[x][y] = OS;
        };
    });
        
    var GameDisplay = new (function GameDisplay() {
        
        /* Global Variables */
        var OSHeight = 50;
        var OSWidth = 25;
        var blkWidth = 2 * OSWidth;
        var blkHeight = OSHeight;
        var blocks = [];
        var fps = 1 / 50;
        var OS_HOVER_TRANS = 1;
        var OS_DEHOVER_TRANS = 0.25;
        var OS_ORI_TRANS = 0;
        
        function Animate(target) {
            var interval;
            this.target = target;
            // debug(target);
            this.during = function(condf, func) {
                // debug(condf);
                // debug(this.target);
                return function() {
                    clearInterval(interval);
                    interval = setInterval(function() {
                        if (! condf(target)) {clearInterval(interval); return;}
                        // debug("Animate: run func(target))");
                        func(target);
                    }, 1/50);
                };
            };
        };
        
        function OS(x, y, os) {
            this.trans = OS_ORI_TRANS;
            this.width = OSWidth;
            this.height = OSHeight;
            this.x = x;
            this.y = y;
            this.os = os;
            this.draw = function() {
                ctx.font = "20pt Arial";
                ctx.strokeStyle="rgba(0,0,0,"+this.trans+")";
                ctx.strokeText(this.os, this.x, this.y);
                ctx.strokeStyle="#000";
                ctx.strokeRect(this.x, this.y, this.width, this.height);
                // debug('x_'+x, this.x, 0); debug('y_'+y, this.y);
            };
            var animate = new Animate(this);
            this.fadein = animate.during(function(obj) {return obj.trans < OS_HOVER_TRANS}, 
                                         function(obj) {debug("this", obj.super.fps); obj.trans++; this.super.clear(); this.super.redraw();});
            // debug(this.fadein);
        }
        
        /* Subclass Block */
        function Block(bx, by) {
            this.width = blkWidth;
            this.height = blkHeight;
            this.x = bx * this.width;
            this.y = by * this.height;
            this.OS = ' ';
            this.animated = false;
            this.O = new OS(this.x, this.y, 'O');
            this.S = new OS(this.x + OSWidth, this.y, 'S');
        };
                
        
        this.start = function() {        
            this.chessboardRangeX = GameLogic.size * OSWidth * 2;
            this.chessboardRangeY = GameLogic.size * OSHeight;
            // create a size x size chessboard;
            for (var i = 0; i < GameLogic.size; ++i) {
                blocks.push([]);
                for (var j = 0; j < GameLogic.size; ++j) {
                    blocks[i].push(new Block(i, j));
                }
            }
        }
        
        
        this.hoverAnimation = function(bx, by, OS) {
            debug('bx', bx); debug('by', by); debug('OS', OS);
            if (OS == 'S') {
                // debug("blocks[bx][by].S.fadein",blocks[bx][by].S.fadein);
                blocks[bx][by].S.fadein();
                blocks[bx][by].O;
            } else {
                blocks[bx][by].O;
                blocks[bx][by].S;
            }
            // if (a.animated) {return;}
            // var i = setInterval(function() {
            //     if (a.trans == 1) {
            //         clearInterval(i); 
            //         a.animated = b.animated = false;
            //     } else {
            //         a.trans += 0.2;
            //         b.trans += 0.1;
            //         this.redraw();
            //     }
            // }, fps);
        };
        
        this.dehoverAnimation = function(bx, by, OS) {
            var b = blocks[bx][by];
            var i = setInterval(function() {
                if (b.trans == 0) {
                    clearInterval(i);
                } else {
                    trans--;
                    this.redraw();
                }
            }, fps);
        }
        
        this.clear = function() {
            ctx.clearRect(0,0,canvas.width,canvas.height);
        };
        
        this.redraw = function() {
            for (var i = 0; i < GameLogic.size; i++) {
                for (var j = 0; j < GameLogic.size; j++) {
                    var b = blocks[i][j];
                    b.O.draw();
                    b.S.draw();
                }
            }
        };
        
        
        this.blockX = function(x) {
            if (x > this.chessboardRangeX) {return false;}
            return Math.floor(convasX(event.x) / blkWidth);
        };
        this.blockY = function(y) {
            if (y > this.chessboardRangeY) {return false;}
            return Math.floor(convasY(event.y) / blkHeight);
        };
        this.blockM = function(x, y) {
            if (x > this.chessboardRangeX) {return ' ';}
            return convasX(event.x) / blkWidth % 1 > 0.5 ? "S" : "O";
        };  
    });
    
    var GameControl = new (function GameControl() {        
        
        this.init = function() {
            var prevX = false;
            var prevY = false;
            var prevM = ' ';
            
            canvas.addEventListener("mousemove", function(event) {
                var bx = GameDisplay.blockX(event.x);
                var by = GameDisplay.blockY(event.y);
                var os = GameDisplay.blockM(event.x, event.y);
                if (bx && by && (prevX != bx || prevY != by) && prevM != os) {
                    // debug('GameDisplay.blockX returns:', bx);
                    // GameDisplay.dehoverAnimation(prevX, prevY, prevM);
                    // debug("GameControl: call GameDisplay.hoverAnimation");
                    GameDisplay.hoverAnimation(bx, by, os);
                }
                
                var prevX = bx;
                var prevY = by;
                var prevM = os;
            });
            
            canvas.addEventListener("click", function(event) {
                var x = Math.floor(convasX(event.x) / GameLogic.size);
                var y = Math.floor(convasY(event.y) / GameLogic.size);
                var os = (x % 1 > 0.5) ? "S" : "O";
                GameDisplay.clickAnimation(x, y, os);
            });
        };
            
    });


    
    /* Main */
    GameLogic.start(4);
    GameDisplay.start();
    GameControl.init();
    GameDisplay.redraw();

}
