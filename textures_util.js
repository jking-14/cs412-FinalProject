// Ensures that the browser has loaded the image before it is used in the project
class TexturesUtil {
    static loadImage (src) {
        return new Promise(function (resolve, reject) {
            var img = new Image();
            img.onload  = function () { resolve(img); };
            img.onerror = function () { reject(new Error("Failed to load " + src)); };
            img.src = src;
        });
    }
    
    static loadVideo(src) {
        return new Promise(function (resolve, reject) {
            var v = document.createElement("video");
            v.src = src;
            v.loop = true;
            v.muted = true;
            v.playsInline = true;
            v.style.display = "none";

            v.addEventListener("loadeddata", function () {
                document.body.appendChild(v);
                v.play().catch(function () {
                    document.addEventListener("click", function () { v.play(); }, { once: true });
                });
                resolve(v);
            }, { once: true });

            v.addEventListener("error", function () {
                reject(new Error("Failed to load " + src));
            }, { once: true });
        });
    }

    static loadAll (list) {
        return Promise.all(list.map(TexturesUtil.loadImage));
    }
}