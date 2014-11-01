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
    function convasX(x) {return x - canvas.offsetLeft - canvas.scrollLeft;}
    function convasY(y) {return y - canvas.offsetTop - canvas.scrollTop;}
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
        var OSHeight = 100;
        var OSWidth = 50;
        var blkWidth = 2 * OSWidth;
        var blkHeight = OSHeight;
        var blocks = [];
        this.fps = 1 / 50;
        var OS_HOVER_TRANS = 1;
        var OS_DEHOVER_TRANS = 0.25;
        var OS_ORI_TRANS = 0;

        ctx.clear = function() {
            ctx.clearRect(0,0,canvas.width,canvas.height);
        };
        
        ctx.draw = function() {
            for (var i = 0; i < GameLogic.size; i++) {
                for (var j = 0; j < GameLogic.size; j++) {
                    // debug('bx'+i+j, blocks[i][j].bx, i); 
                    // debug('by'+i+j, blocks[i][j].by, j);
                    
                    blocks[i][j].draw();
                }
            }
        };
        
        function Animate(target) {
            var interval;
            this.target = target;
            // debug(target);
            this.during = function(condf, func) {
                // debug(condf);
                // debug(this.target);
                return function(param) {
                    clearInterval(interval);
                    interval = setInterval(function() {
                        if (! condf(target, param)) {clearInterval(interval); return;}
                        // debug("Animate: run func(target))");
                        func(target);
                    }, 1/60);
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
                ctx.textBaseline = 'top';
                ctx.font = "20pt Arial";
                ctx.strokeStyle="rgba(0,0,0,"+this.trans+")";
                ctx.strokeText(this.os, this.x, this.y);
                ctx.strokeStyle="#000";
                ctx.strokeRect(this.x, this.y, this.width, this.height);
                // debug('x_'+x, this.x, 0); debug('y_'+y, this.y);
            };
            var animate = new Animate(this);
            this.fadein = animate.during(function(obj, lim) {return obj.trans < lim}, 
                                         function(obj) {obj.trans+=0.2; ctx.clear(); ctx.draw();});
            this.fadeout = animate.during(function(obj) {return obj.trans > OS_DEHOVER_TRANS;},
                                          function(obj) {obj.trans-=0.2; ctx.clear(); ctx.draw();});
            // debug(this.fadein);
        }
        
        /* Subclass Block */
        function Block(bx, by) {
            this.width = blkWidth;
            this.height = blkHeight;
            this.x = bx * this.width;
            this.y = by * this.height;
            this.bx = bx;
            this.by = by;
            this.OS = ' ';
            this.animated = false;
            this.O = new OS(this.x, this.y, 'O');
            this.S = new OS(this.x + OSWidth, this.y, 'S');
            this.draw = function() {
                ctx.textBaseline = 'top';
                ctx.font = '12pt Aprial';
                ctx.strokeText("bx = "+this.bx+' by = '+this.by, this.x, this.y);
                this.O.draw();
                this.S.draw();
            };            
            this.dehover = function() {
                this.O.fadeout(0);
                this.S.fadeout(0);
            }
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
            // debug("blocks[0][0].bx", blocks[0][0].bx, 0);
            // debug("blocks[0][0].by", blocks[0][0].by, 0);
            // debug("blocks[3][3].bx", blocks[3][3].bx, 3);
            // debug("blocks[3][3].by", blocks[3][3].by, 3);
        }
        
        
        this.hoverAnimation = function(bx, by, OS) {
            debug('bx', bx); debug('by', by); debug('OS', OS);
            if (OS == 'S') {
                debug("hoverAnimation: call fadein on ", bx+' '+by+' '+'S');
                blocks[bx][by].S.fadein(OS_HOVER_TRANS);
                debug("hoverAnimation: call fadeout on ", bx+' '+by+' '+'O');
                blocks[bx][by].O.fadeout();
            } else {
                debug("hoverAnimation: call fadein on ", bx+' '+by+' '+'O');
                blocks[bx][by].O.fadein(OS_HOVER_TRANS);
                debug("hoverAnimation: call fadeout on ", bx+' '+by+' '+'S');
                blocks[bx][by].S.fadeout();
            }
        };
        
        this.dehoverAnimation = function(bx, by) {
            blocks[bx][by].dehover();
        }
        
        this.clear = ctx.clear;
        this.draw = ctx.draw;
        
        this.blockX = function(x) {
            if (x > this.chessboardRangeX) {return false;}
            return Math.floor(convasX(event.x) / blkWidth);
        };
        this.blockY = function(y) {
            if (y > this.chessboardRangeY) {return false;}
            return Math.floor(convasY(event.y) / blkHeight);
        };
        this.blockM = function(x, y) {
            if (x > this.chessboardRangeX || y > this.chessboardRangeY) {return false;}
            return convasX(event.x) / blkWidth % 1 > 0.5 ? "S" : "O";
        }; 
});
    
    var GameControl = new (function GameControl() {        
        
        this.init = function() {
            var prevX = false;
            var prevY = false;
            var prevOS = false;
            
            canvas.addEventListener("mousemove", function(event) {
                var bx = GameDisplay.blockX(event.x);
                var by = GameDisplay.blockY(event.y);
                var os = GameDisplay.blockM(event.x, event.y);
                debug('GameControl-onmousemove: bx',bx);
                debug('GameControl-onmousemove: by',by);
                debug('GameControl-onmousemove: os',os);
                debug('GameControl-onmousemove: prevX',prevX);
                debug('GameControl-onmousemove: prevY',prevY);
                debug('GameControl-onmousemove: prevOS',prevOS);
                // debug(prevX !== bx || prevY !== by);
                if (bx !== false && by !== false && (os !== prevOS || bx !== prevX || by !== prevY)) { // if the mouse is on a different O/S from last time, play hover animation // if mouse is in a chessboard block
                    debug("GameControl: call hoverAnimation on", bx+' '+by+' '+os);
                    GameDisplay.hoverAnimation(bx, by, os);
                }
                if (prevX !== false && prevY !== false && (prevX !== bx || prevY !== by)) { // if the block has changed, play dehover animations on the block
                    debug("GameControl: call dehoverAnimation on", prevX+' '+prevY+' '+prevOS);
                    GameDisplay.dehoverAnimation(prevX, prevY, prevOS);
                };
                prevOS = os;
                prevX = bx;
                prevY = by;
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
    GameDisplay.draw();


}
