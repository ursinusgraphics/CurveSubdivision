/**
 * Perform a topological subdivision
 * @param {list of N vec3} Ps initial points on the loop 
 * @returns {list of 2N vec3} Subdivided points 
 */
function getSubdividedTopological(Ps) {
    let PsNew = [];
    let N = Ps.length;
    // TODO: Fill this in
    return PsNew;
}

/**
 * Perform a linear subdivision
 * @param {list of N vec3} Ps initial points on the loop 
 * @returns {list of 2N vec3} Subdivided points 
 */
function getSubdividedLinear(Ps) {
    let PsNew = [];
    let N = Ps.length;
    // TODO: Fill this in
    return PsNew;
}

/**
 * Perform a topological subdivision
 * @param {list of N vec3} Ps initial points on the loop 
 * @param {list of 2K+1 float} kernel Weight values
 * @returns {list of 2N vec3} Subdivided points 
 */
function getSubdividedWeighted(Ps, kernel) {
    let PsNew = [];
    let N = Ps.length;
    // TODO: Fill this in
    return PsNew;
}


/**
 * Subdivide points on a curve
 * @param {list of vec3} Ps Points on the curve
 */
function getSubdivided(Ps) {
    let PsNew = [];
    let N = Ps.length;
    let w = 0.24;
    for (let i = 0; i < Ps.length; i++) {
        PsNew.push(Ps[i]);
        let p = glMatrix.vec3.create();
        
        let p1 = glMatrix.vec3.create();
        glMatrix.vec3.scaleAndAdd(p1, p1, Ps[i], 0.5);
        glMatrix.vec3.scaleAndAdd(p1, p1, Ps[(i+1)%N], 0.5);
        let p2 = glMatrix.vec3.create();
        glMatrix.vec3.scaleAndAdd(p2, p2, Ps[(i+N-1)%N], -0.5);
        glMatrix.vec3.scaleAndAdd(p2, p2, Ps[(i+2)%N], -0.5);
        glMatrix.vec3.scaleAndAdd(p2, p1, p2, 1);
        glMatrix.vec3.scaleAndAdd(p, p1, p2, 2*w);
        PsNew.push(p);
    }
    return PsNew;
}

/**
 * Class for selecting a discrete loop in 2D
 */
class LoopCurve {
    constructor() {
        this.Ps = []; //Points [a, b, c, d] on the arm
        this.target = glMatrix.vec3.create(); // Target
        let canvas = document.getElementById('segcanvas');
        let ctx = canvas.getContext("2d"); //For drawing
        ctx.font = "16px Arial";
        this.ctx = ctx;
        //Need this to disable that annoying menu that pops up on right click
        canvas.addEventListener("contextmenu", function(e){ e.stopPropagation(); e.preventDefault(); return false; }); 
        this.canvas = canvas;
        this.canvas.addEventListener("mousedown", this.selectVec.bind(this));
        this.canvas.addEventListener("touchstart", this.selectVec.bind(this)); //Works on mobile devices!
    }

    /**
     * Redraw arm based on positions
     */
     repaint(clearRect) {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const dW = 1;
        const W = canvas.width;
        const H = canvas.height;
        const p = this.target;
        const Ps = this.Ps;
        if (clearRect || clearRect === undefined) {
            ctx.clearRect(0, 0, W, H);
        }
        
        //Draw joints
        for (let i = 0; i < Ps.length; i++) {
            ctx.fillStyle = "#000000";
            ctx.fillRect(Ps[i][0]-dW, H-(Ps[i][1]+dW), dW*2+1, dW*2+1);
        }
        
        //Draw body
        ctx.fillStyle = "#000000";
        for (let i = 0; i < Ps.length; i++) {
            ctx.beginPath();
            ctx.moveTo(Ps[i][0], H-Ps[i][1]);
            ctx.lineTo(Ps[(i+1)%Ps.length][0], H-Ps[(i+1)%Ps.length][1]);
            ctx.stroke();
        }
    }

    getMousePos(evt) {
        let rect = this.canvas.getBoundingClientRect();
        return {
            X: evt.clientX - rect.left,
            Y: evt.clientY - rect.top
        };
    }
    
    selectVec(evt) {
        let mousePos = this.getMousePos(evt);
        let X = mousePos.X;
        let Y = this.canvas.height - mousePos.Y;
        let clickType = "LEFT";
        evt.preventDefault();
        if (evt.which) {
            if (evt.which == 3) clickType = "RIGHT";
            if (evt.which == 2) clickType = "MIDDLE";
        }
        else if (evt.button) {
            if (evt.button == 2) clickType = "RIGHT";
            if (evt.button == 4) clickType = "MIDDLE";
        }
        
        if (clickType == "LEFT") {
            this.Ps.push(glMatrix.vec3.fromValues(X, Y, 0));
        }
        else {
            //Remove point
            if (this.Ps.length > 0) {
                this.Ps.pop();
            }
            else {
                this.startJoint = null;
            }
        }
        this.repaint();
    }

    subdivideTopological() {
        this.Ps = getSubdividedTopological(this.Ps);
        this.repaint();
    }

    subdivideLinear() {
        this.Ps = getSubdividedLinear(this.Ps);
        this.repaint();
    }

    subdivideWeighted() {
        kernel = document.getElementById("kernel").value;
        kernel = kernel.split(",").map((x) => parseFloat(x));
        this.Ps = getSubdividedWeighted(this.Ps, kernel);
        this.repaint();
    }
}

