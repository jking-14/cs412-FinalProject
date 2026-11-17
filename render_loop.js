class RenderLoop {
    constructor(callback, fps) {
        var oThis = this;
        this.msLastFrame = null; // time (ms) of last frame
        this.callback = callback; // function to call for each frame
        this.isActive = false; // controll on/off of render loop
        this.fps = 0; // save value of loop speed

        if (fps != undefined && fps > 0) {
            this.msFpsLimit = 1000 / fps; // calc ms per fraim in 1s

            this.run = function () {
                // calc delta time between frames and current fps
                var msCurrent = performance.now(),
                    msDelta = (msCurrent - oThis.msLastFrame),
                    deltaTime = msDelta / 1000.0;
                
                if (msDelta >= oThis.msFpsLimit) {
                    oThis.fps = Math.floor(1 / deltaTime);
                    oThis.msLastFrame = msCurrent;
                    oThis.callback(deltaTime);
                }

                if (oThis.isActive) window.requestAnimationFrame(oThis.run);

            }
        } else {
            this.run = function () {
                var msCurrent = performance.now(),
                    deltaTime = (msCurrent - oThis.msLastFrame) / 1000.0;

                oThis.fps = Math.floor(1 / deltaTime);
                oThis.msLastFrame = msCurrent;

                oThis.callback(deltaTime);
                if (oThis.isActive) window.requestAnimationFrame(oThis.run);
            }
        }
    }

    start() {
        this.isActive = true;
        this.msLastFrame = performance.now();
        window.requestAnimationFrame(this.run);
        return this;
    }

    stop() {
        this.isActive = false;
    }
}
