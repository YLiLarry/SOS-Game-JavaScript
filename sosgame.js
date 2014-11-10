function loadSOSGame(canvasName, EDGE_LENGTH) {
    'use strict';
    /* Global Variables */
    var canvas = document.getElementById(canvasName);
    
    canvas.style.position = 'relative';
    var ctx = canvas.getContext("2d");

    /* All Definitions */
    function GameDisplayClass() {
        
        // console.log("New GameDisplay Object", this);
        var GameDisplay = this;
        
        /* Global Variables */
        // GameDisplay.OSHeight;
        // GameDisplay.OSWidth;
        // GameDisplay.blkWidth;
        // GameDisplay.blkHeight;
        // GameDisplay.OS_FONT_SIZE;
        GameDisplay.FPS = 30;
        GameDisplay.OS_HOVER_TRANS = 1;
        GameDisplay.OS_DEHOVER_TRANS = 0.25;
        GameDisplay.OS_ORI_TRANS = 0;
        
        /* Abustract */
        // this.chessboard = {
        //     block: function() {},
        //     size: 0,
        // };
        
        // console.log("GameDisplay", GameDisplay);

        GameDisplay.clear = function() {
            // console.log("GameDisplay: clear");
            ctx.clearRect(0,0,canvas.width,canvas.height);
        };
        
        GameDisplay.draw = function() {
            // console.log("call draw on", this);
            for (var i = 0; i < this.chessboard.size; i++) {
                for (var j = 0; j < this.chessboard.size; j++) {
                    // console.log('bx'+i+j, chessboard[i][j].bx, i); 
                    // console.log('by'+i+j, chessboard[i][j].by, j);
                    this.chessboard.block(i, j).draw();
                }
            }
        };
        
        GameDisplay.redraw = function() {this.clear(); this.draw();}
        
        GameDisplay.AnimateClass = function(target) {
            this.target = target;
            // console.log(target);
        };
        var AnimateClass = this.AnimateClass.prototype;
        AnimateClass.during = function(condf, func) {
            var AnimateClass = this;
            // console.log(condf);
            // console.log(this.target);
            return function(param) {
                clearInterval(AnimateClass.interval);
                AnimateClass.interval = setInterval(function() {
                    if (! condf(param)) {clearInterval(AnimateClass.interval); return;}
                    func();
                }, 1000 / GameDisplay.FPS);
            };
        };
        
        GameDisplay.OSClass = function(x, y, os) {
            var animate = new GameDisplay.AnimateClass(this);
            this.trans = GameDisplay.OS_ORI_TRANS;
            this.C_TRANS = 1 / (0.15 * GameDisplay.FPS);
            this.x = x;
            this.y = y;
            this.os = os;
            this.strans = function(n) { // helper
                if (typeof n === 'undefined') {return this.trans;}
                if (n > 1) {return (this.trans = 1);}
                if (n < 0.1) {return (this.trans = 0);}
                return (this.trans = n);
            };
            var OSClass = this;
            /* trasition version */
            //*
            this.fadein = animate.during(function(lim) {return OSClass.trans < lim}, 
                                         function() {OSClass.strans(OSClass.trans+OSClass.C_TRANS); GameDisplay.redraw();});
            this.fadeout = animate.during(function(lim) {return OSClass.trans > lim;},
                                          function() {OSClass.strans(OSClass.trans-OSClass.C_TRANS); GameDisplay.redraw();});
            this.fadeto = function(n) {(OSClass.trans < n) ? OSClass.fadein(n) : OSClass.fadeout(n);};
            //*/
            /* no trasition version */
            /*
            this.fadein = function(n) {OSClass.strans(n); GameDisplay.redraw();};
            this.fadeout = function(n) {OSClass.strans(n); GameDisplay.redraw();};
            this.fadeto = function(n) {(OSClass.trans < n) ? OSClass.fadein(n) : OSClass.fadeout(n);};
            */
        };
        var OSClass = this.OSClass.prototype;
        OSClass.animate = function() {return this.animate;}
        OSClass.draw = function() {
            // console.log("OS draw:", this, "trans", this.trans);
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.font = GameDisplay.OS_FONT_SIZE+"px Arial";
            ctx.strokeStyle ="rgba(0,0,0,"+this.trans+")";
            var tx = this.x + GameDisplay.OSWidth / 2;
            var ty = this.y + GameDisplay.OSHeight / 2;
            ctx.strokeText(this.os, tx, ty);
            // ctx.strokeRect(this.x, this.y, this.width, this.height);
            // console.log('x_'+x, this.x, 0); console.log('y_'+y, this.y);
        };
        
        /* Subclass Block */
        GameDisplay.BlockClass = function(bx, by) {
            this.x = bx * GameDisplay.blkWidth;
            this.y = by * GameDisplay.blkHeight;
            this.bx = bx;
            this.by = by;
            this.os = false;
            this.O = new GameDisplay.OSClass(this.x, this.y, 'O');
            this.S = new GameDisplay.OSClass(this.x + GameDisplay.OSWidth, this.y, 'S');
            this.partOfSOS = false;
            this.safeS = this.safeO = true;
        };
        var BlockClass = this.BlockClass.prototype;
        BlockClass.isOccupied = function() {return this.os;}
        BlockClass.draw = function() {
            // console.log("BlockClass draw", this);
            if (this.partOfSOS) {ctx.fillStyle = '#FF5648';}
            else {ctx.fillStyle = ((this.bx + this.by) % 2) ? '#9A884D' : '#FFD753';}
            ctx.fillRect(this.x, this.y, GameDisplay.blkHeight, GameDisplay.blkWidth);
            if (this.isOccupied()) {
                ctx.strokeStyle ="#000";
                ctx.font = GameDisplay.OS_FONT_SIZE+'px Arial';                    
                ctx.strokeText(this.os, this.x + GameDisplay.blkWidth / 2, this.y + GameDisplay.blkHeight / 2);
            } else {
                this.O.draw();
                this.S.draw();
            }
        };
        BlockClass.dehover = function() {
            this.O.fadeout(0);
            this.S.fadeout(0);
        }
        BlockClass.click = function(os) {
            this.os = os;
            delete this.O;
            delete this.S;
            GameDisplay.clear();
            GameDisplay.draw();
        }
        
        GameDisplay.ChessboardClass = function(size) {
            this.size = size;
            this.currentOS = 0;
            this.mcb = [];
            // create a size x size chessboard;
            for (var i = 0; i < this.size; ++i) {
                this.mcb.push([]);
                for (var j = 0; j < this.size; ++j) {
                    // console.log("push ", i+' '+j);
                    // console.log(this.mcb);
                    this.mcb[i].push(new GameDisplay.BlockClass(i, j));
                }
            }
        }
        
        GameDisplay.PlayerClass = function(name, type) {
            this.name = name;
            this.type = type;
            this.score = 0;
            
            this.div = document.createElement('DIV');
            canvas.parentNode.insertBefore(this.div, canvas.nextSibling);
            this.redrawScore();
        }
        var PlayerClass = this.PlayerClass.prototype;
        PlayerClass.redrawScore = function() {
            this.div.innerHTML = this.name+" score: "+this.score;
        }
        
        GameDisplay.hoverAnimation = function(bx, by, os) {
            var bl = this.chessboard.block(bx, by);
            if (os === 'S' && ! bl.isOccupied()) {
                this.chessboard.block(bx,by).S.fadein(GameDisplay.OS_HOVER_TRANS);
                this.chessboard.block(bx,by).O.fadeto(GameDisplay.OS_DEHOVER_TRANS);
            } else if (os === 'O' && ! bl.isOccupied()) {
                this.chessboard.block(bx,by).O.fadein(GameDisplay.OS_HOVER_TRANS);
                this.chessboard.block(bx,by).S.fadeto(GameDisplay.OS_DEHOVER_TRANS);
            }
        };
        
        GameDisplay.dehoverAnimation = function(bx, by) {
            var bl = this.chessboard.block(bx,by);
            if (bl.isOccupied()) {return;}
            bl.dehover();
        }
        
        GameDisplay.clickAnimation = function(bx, by, os) {
            this.chessboard.block(bx,by).click(os);
        }
        
        GameDisplay.blockX = function(x) {
            var bx = Math.floor(x / GameDisplay.blkWidth); 
            return (bx < this.chessboard.size) ? bx : false;
        };
        GameDisplay.blockY = function(y) {
            var by = Math.floor(y / GameDisplay.blkHeight);
            return (by < this.chessboard.size) ? by : false;
        };
        GameDisplay.blockM = function(x, y) {
            if (this.blockX(x) < this.chessboard.size && this.blockY(y) < this.chessboard.size) {
                return x / GameDisplay.blkWidth % 1 > 0.5 ? "S" : "O";
            } else {
                return false;
            }
        };
         
        GameDisplay.drawGameOver = function(str) {
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillStyle = '#000';
            ctx.font = GameDisplay.OS_FONT_SIZE/3 + 'px Aprial';
            ctx.fillText(str, canvas.width/2, canvas.height/2);
            ctx.font = GameDisplay.OS_FONT_SIZE/4 + 'px Aprial';
            ctx.fillText('Retry', canvas.width/2, canvas.height/2 + GameDisplay.OS_FONT_SIZE/4);
        }  
        
        GameDisplay.start = function(size) {
            // console.log("GameLogic Object: start", this);
            // var EDGE_LENGTH = Math.min(canvas.parentNode.offsetHeight, canvas.parentNode.offsetWidth, window.innerHeight, window.innerWidth);
            this.blkHeight = this.blkWidth = this.OSHeight = EDGE_LENGTH / size;
            this.OSWidth = this.OSHeight / 2;
            this.OS_FONT_SIZE = this.OSWidth - 10;
            canvas.width = canvas.height = size * GameDisplay.blkHeight;
            this.chessboard = new this.ChessboardClass(size);
        }
        
    }

    function GameLogicClass() {
        GameDisplayClass.call(this);
        var GameLogic = this;
        
        // console.log("New GameLogic Object:", this);
        
        var ChessboardClass = this.ChessboardClass.prototype;

        ChessboardClass.isFull = function() {return this.currentOS === this.size * this.size;}
        ChessboardClass.block = function(bx, by) {
            // console.log("call block", bx, by, "on", GameLogic);
            if (bx >= 0 && bx < this.size && by >= 0 && by < this.size) {
                return this.mcb[bx][by];
            } else {
                return false;
            }
        }
        ChessboardClass.makeMove = function(bx, by, os) {
            this.currentOS++; 
            // change the surrounding's safeO/S fields
            this.block(bx, by).os = os;
            var Chessboard = this;
            function fO(bx, by) {var b = Chessboard.block(bx, by); if (b) {b.safeO = false;}}
            function fS(bx, by) {var b = Chessboard.block(bx, by); if (b) {b.safeS = false;}}
            if (os === 'O') {
                fS(bx+1,by); 
                fS(bx-1,by); 
                fS(bx,by+1); 
                fS(bx,by-1); 
                fS(bx+1,by+1); 
                fS(bx+1,by-1); 
                fS(bx-1,by+1); 
                fS(bx-1,by-1);
                
                fO(bx+2,by);
                fO(bx-2,by);
                fO(bx,by+2);
                fO(bx,by-2);
                fO(bx+2,by+2);
                fO(bx+2,by-2);
                fO(bx-2,by-2);
                fO(bx-2,by+2);
                
            } else {
                fO(bx+1,by); 
                fO(bx-1,by); 
                fO(bx,by+1); 
                fO(bx,by-1); 
                fO(bx+1,by+1); 
                fO(bx+1,by-1); 
                fO(bx-1,by+1); 
                fO(bx-1,by-1);
                                
                fS(bx+2,by);
                fS(bx-2,by);
                fS(bx,by+2);
                fS(bx,by-2);
                fS(bx+2,by+2);
                fS(bx+2,by-2);
                fS(bx-2,by-2);
                fS(bx-2,by+2);
            }
            console.log("ChessboardClass: current", this);
            // if made SOS, then turn the blocks to other color
            var ls = this.hasSOS(bx, by, os);
            for (var i = 0; i < ls.length; i++) {
                ls[i][0].partOfSOS = ls[i][1].partOfSOS = ls[i][2].partOfSOS = true;
            }
            GameLogic.redraw();
        }
        ChessboardClass.isOccupied = function(bx, by) {return GameLogic.chessboard.block(bx, by).os;}
        ChessboardClass.hasSOS = function(bx, by, os) {
            function neg(os) {return (os === 'S' ? 'O' : 'S');}
            var ls = [];
            if (os === 'S') {
                if (this.block(bx, by + 1).os === neg(os) && this.block(bx, by + 2).os === os) {ls.push([this.block(bx, by), this.block(bx, by + 1), this.block(bx, by + 2)]);}
                if (this.block(bx + 1, by + 1).os === neg(os) && this.block(bx + 2, by + 2).os === os) {ls.push([this.block(bx, by), this.block(bx + 1, by + 1), this.block(bx + 2, by + 2)]);}
                if (this.block(bx + 1, by).os === neg(os) && this.block(bx + 2, by).os === os) {ls.push([this.block(bx, by), this.block(bx + 1, by), this.block(bx + 2, by)]);}
                if (this.block(bx + 1, by - 1).os === neg(os) && this.block(bx + 2, by - 2).os === os) {ls.push([this.block(bx, by), this.block(bx + 1, by - 1), this.block(bx + 2, by - 2)]);}
                if (this.block(bx, by - 1).os === neg(os) && this.block(bx, by - 2).os === os) {ls.push([this.block(bx, by), this.block(bx, by - 1), this.block(bx, by - 2)]);}
                if (this.block(bx - 1, by - 1).os === neg(os) && this.block(bx - 2, by - 2).os === os) {ls.push([this.block(bx, by), this.block(bx - 1, by - 1), this.block(bx - 2, by - 2)]);}
                if (this.block(bx - 1, by).os === neg(os) && this.block(bx - 2, by).os === os) {ls.push([this.block(bx, by), this.block(bx - 1, by), this.block(bx - 2, by)]);}
                if (this.block(bx - 1, by + 1).os === neg(os) && this.block(bx - 2, by + 2).os === os) {ls.push([this.block(bx, by), this.block(bx - 1, by + 1), this.block(bx - 2, by + 2)]);}
            } else if (os === 'O') {
                if (this.block(bx + 1, by).os === neg(os) && this.block(bx - 1, by).os === neg(os)) {ls.push([this.block(bx, by), this.block(bx + 1, by), this.block(bx - 1, by)]);}
                if (this.block(bx + 1, by + 1).os === neg(os) && this.block(bx - 1, by - 1).os === neg(os)) {ls.push([this.block(bx, by), this.block(bx + 1, by + 1), this.block(bx - 1, by - 1)]);}
                if (this.block(bx, by + 1).os === neg(os) && this.block(bx, by - 1).os === neg(os)) {ls.push([this.block(bx, by), this.block(bx, by + 1), this.block(bx, by - 1)]);}
                if (this.block(bx - 1, by + 1).os === neg(os) && this.block(bx + 1, by - 1).os === neg(os)) {ls.push([this.block(bx, by), this.block(bx - 1, by + 1), this.block(bx + 1, by - 1)]);}
            }
            return ls;
        }
        ChessboardClass.moveAble = function(bx, by) {
            var b = this.block(bx, by);
            if (b.safeO && b.safeS) {return 'S';}
            if (b.safeS) {return 'S';}
            if (b.safeO) {return 'O';}
            return false;
        }
        ChessboardClass.isSafe = function(bx, by, os) {
            if (os === 'O') {
                return (! ((this.block(bx-1, by).os === false && this.block(bx+1, by).os === 'S') ||
                           (this.block(bx+1, by).os === false && this.block(bx-1, by).os === 'S') ||
                           (this.block(bx, by-1).os === false && this.block(bx, by+1).os === 'S') ||
                           (this.block(bx, by+1).os === false && this.block(bx, by-1).os === 'S') ||
                           (this.block(bx-1, by-1).os === false && this.block(bx+1, by+1).os === 'S') ||
                           (this.block(bx-1, by+1).os === false && this.block(bx+1, by-1).os === 'S') ||
                           (this.block(bx+1, by+1).os === false && this.block(bx-1, by-1).os === 'S') ||
                           (this.block(bx+1, by-1).os === false && this.block(bx-1, by+1).os === 'S')))
            } else
            if (os === 'S') {
                return (! ((this.block(bx+2, by).os === 'S' && this.block(bx+1, by).os === false) ||
                           (this.block(bx+2, by+2).os === 'S' && this.block(bx+1, by+1).os === false) ||
                           (this.block(bx, by+2).os === 'S' && this.block(bx, by+1).os === false) ||
                           (this.block(bx-2, by+2).os === 'S' && this.block(bx-1, by+1).os === false) ||
                           (this.block(bx-2, by).os === 'S' && this.block(bx-1, by).os === false) ||
                           (this.block(bx-2, by-2).os === 'S' && this.block(bx-1, by-1).os === false) ||
                           (this.block(bx, by-2).os === 'S' && this.block(bx, by-1).os === false) ||
                           (this.block(bx+2, by-2).os === 'S' && this.block(bx+1, by-1).os === false) || 
                           
                           (this.block(bx+1, by).os === 'O' && this.block(bx+2, by).os === false) ||
                           (this.block(bx+1, by+1).os === 'O' && this.block(bx+2, by+2).os === false) ||
                           (this.block(bx, by+1).os === 'O' && this.block(bx, by+2).os === false) ||
                           (this.block(bx-1, by+1).os === 'O' && this.block(bx-2, by+2).os === false) ||
                           (this.block(bx-1, by).os === 'O' && this.block(bx-2, by).os === false) ||
                           (this.block(bx-1, by-1).os === 'O' && this.block(bx-2, by-2).os === false) ||
                           (this.block(bx, by-1).os === 'O' && this.block(bx, by-2).os === false) ||
                           (this.block(bx+1, by-1).os === 'O' && this.block(bx+2, by-2).os === false)))
            }
        }
        GameLogic.randomOS = function() {
            return (Math.random() > 0.5) ? 'S' : 'O';
        }

    }
    
    GameLogicClass.prototype = Object.create(GameDisplayClass.prototype);
    GameLogicClass.prototype.constructor = GameLogicClass;
        
    
    function GameControlClass() {
        var GameControl = this;
        GameLogicClass.call(this);
        
        // console.log("New GameControl Object", this);
        
        var PlayerClass = this.PlayerClass.prototype;
        PlayerClass.usrMove = function(callback) {
            var Player = this;
            var prevX = false;
            var prevY = false;
            var prevOS = false;
            
            var mousemove = function(event) {
                var bx = GameControl.blockX(event.offsetX);
                var by = GameControl.blockY(event.offsetY);
                var os = GameControl.blockM(event.offsetX, event.offsetY);
                // console.log(canvas.offsetTop, event.offsetY);
                // console.log('GameControl-onmousemove: bx',bx);
                // console.log('GameControl-onmousemove: by',by);
                // console.log('GameControl-onmousemove: os',os);
                // console.log('GameControl-onmousemove: prevX',prevX);
                // console.log('GameControl-onmousemove: prevY',prevY);
                // console.log('GameControl-onmousemove: prevOS',prevOS);
                // console.log(prevX !== bx || prevY !== by);
                if (bx !== false && by !== false && (os !== prevOS || bx !== prevX || by !== prevY)) { // if the mouse is on a different O/S from last time, play hover animation // if mouse is in a chessboard block
                    // console.log("GameControl: call hoverAnimation on", bx+' '+by+' '+os);
                    // console.log('GameControl.chessboard',GameControl.chessboard);
                    GameControl.hoverAnimation(bx, by, os);
                }
                if (prevX !== false && prevY !== false && (prevX !== bx || prevY !== by)) { // if the block has changed, play dehover animations on the block
                    // console.log("GameControl: call dehoverAnimation on", prevX+' '+prevY+' '+prevOS);
                    GameControl.dehoverAnimation(prevX, prevY, prevOS);
                }
                prevOS = os;
                prevX = bx;
                prevY = by;
            }
            
            var click = function(event) {
                
                var bx = GameControl.blockX(event.offsetX);
                var by = GameControl.blockY(event.offsetY);
                var os = GameControl.blockM(event.offsetX, event.offsetY);
                
                if (bx === false || by === false) {return;}
                if (GameControl.chessboard.isOccupied(bx, by)) {return;}
                
                canvas.removeEventListener("mousemove", mousemove, false);
                canvas.removeEventListener("click", click, false);
                GameControl.clickAnimation(bx, by, os);
                GameControl.chessboard.makeMove(bx, by, os);
                
                var r;
                if ((r = GameControl.chessboard.hasSOS(bx, by, os).length)) {
                    Player.score += r;
                    Player.redrawScore();
                    Player.makeMove(callback);
                } else {
                    setTimeout(callback, 1000);
                }
                
                
            }
            
            canvas.addEventListener("mousemove", mousemove, false);
            canvas.addEventListener("click", click, false);
        };
        
        PlayerClass.cmpMove = function(callback) {
            var Player = this;
            // console.log(Player.name+"'s move");
            var r;
            var cb = GameControl.chessboard;
            // console.log("cmpMove: try to find an SOS");
            for (var i = 0; i < cb.size; i++) {
                for (var j = 0; j < cb.size; j++) {
                    if (! cb.isOccupied(i, j)) { // if found a move to make SOS
                        if ((r = cb.hasSOS(i, j, 'S').length)) {
                            cb.makeMove(i, j, 'S');
                        } else
                        if ((r = cb.hasSOS(i, j, 'O').length)) {
                            cb.makeMove(i, j, 'O');
                        } else {
                            continue;
                        }
                        Player.score += r;
                        Player.redrawScore();
                        setTimeout(function() {Player.makeMove(callback)}, 1000); // make another move after 1 second
                        return;
                    }
                }
            }
            // console.log("cmpMove: can't find an SOS");
            // if there no move to make SOS
            var moveAbleLs = [];
            var unmoveAble;
            for (var i = 0; i < cb.size; i++) {
                for (var j = 0; j < cb.size; j++) {
                    if (! cb.isOccupied(i, j)) {
                        var boolS = cb.isSafe(i, j, 'S');
                        var boolO = cb.isSafe(i, j, 'O');
                        if (boolO && boolS) {
                            moveAbleLs.push({"bx":i, "by":j, "os": GameControl.randomOS()});
                        } else
                        if (boolS) {
                            moveAbleLs.push({"bx":i, "by":j, "os": 'S'});
                        } else 
                        if (boolO) {
                            moveAbleLs.push({"bx":i, "by":j, "os": 'O'});
                        } else {
                            unmoveAble = {"bx":i, "by":j, "os": GameControl.randomOS()};
                            continue;
                        }
                    }
                }
            }
            // if all moves are dangrous, just pick one.
            if (! moveAbleLs.length) {
                cb.makeMove(unmoveAble.bx, unmoveAble.by, unmoveAble.os);
            } else {
                // console.log("cmpMove: moveAble list", moveAbleLs);
                var idx = Math.floor(Math.random() * moveAbleLs.length);
                var m = moveAbleLs[idx];
                // console.log("cmpMove: random m", m, idx, moveAbleLs.length);
                cb.makeMove(m.bx, m.by, m.os);
            }
            callback();
        }
    
        PlayerClass.makeMove = function(callback) {
            // console.log(this.name+" move");
            // console.log("# of Moves", GameControl.chessboard.currentOS, "out of", GameControl.chessboard.size*GameControl.chessboard.size);
            if (GameControl.chessboard.isFull()) {GameControl.gameOver(); return;}
            this.type === 'Human' ? this.usrMove(callback) : this.cmpMove(callback);
        }
        
        GameControl.gameStart = function(size) {
            console.log(canvas.parentNode.offsetHeight, canvas.parentNode.offsetWidth);
            this.A = new GameControl.PlayerClass("Your", 'Human');
            this.B = new GameControl.PlayerClass("Opponent's", 'AI');
            this.reset = document.createElement('button');
            this.reset.innerHTML = 'Reset';
            canvas.parentNode.appendChild(this.reset);
            this.reset.onclick = GameControl.gameReset;
            
            GameControl.start(size);
            GameControl.draw();
            
            (function callback() {GameControl.A.makeMove(function() {GameControl.B.makeMove(callback)})})();
        }
        
        GameControl.gameReset = function() {
            canvas.parentNode.removeChild(GameControl.A.div);
            canvas.parentNode.removeChild(GameControl.B.div);
            canvas.parentNode.removeChild(GameControl.reset);
            delete GameControl.A;   
            delete GameControl.B;  
            var s = GameControl.chessboard.size; 
            delete GameControl.chessboard;
            GameControl.clear();   
            GameControl.gameStart(s);
        }
        
        GameControl.gameOver = function() {
            // console.log("Game over");
            // console.log("A's score", this.A.score);
            // console.log("B's score", this.B.score);
            if (this.A.score > this.B.score) {
                this.drawGameOver('You Won');
            } else
            if (this.A.score < this.B.score) {
                this.drawGameOver('You Lost');
            } else {
                this.drawGameOver('Draw');
            }
            var f = function() {
                GameControl.gameReset();
                canvas.removeEventListener('click', f);                
            };
            canvas.addEventListener('click', f);
        }
        
    }
    GameControlClass.prototype = Object.create(GameLogicClass.prototype);
    GameControlClass.prototype.constructor = GameControlClass;
    
    /* Main */
    var GameControl = new GameControlClass();
    GameControl.gameStart(5);

}


