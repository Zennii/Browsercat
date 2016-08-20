/*
 * This is a massive overhaul of the HTML5 Audio Visualizer by Wayou
 * ------------------------------------------------------
 * Author:Wayou, modified by Zenny
 * Modification Date: 7/18/2015
 * Original Author Date: Feb 15, 2014
 * For more infomation or support you can:
 * view the project page: https://github.com/Wayou/HTML5_Audio_Visualizer/
 * view online demo: http://wayouliu.duapp.com/mess/audio_visualizer.html
 * view the blog on how this is done: http://www.cnblogs.com/Wayou/p/html5_audio_api_visualizer.html
 * or contact Wayou: liuwayong@gmail.com
 */

var vis = null;
if ( typeof String.prototype.endsWith != 'function' ) {
  String.prototype.endsWith = function( str ) {
    return this.substring( this.length - (str.length+1), this.length ) === str;
  }
};
window.onload = function() {
    vis = new Visualizer()
    vis.init();
};
var Visualizer = function() {
    this.file = null
    this.fileName = null,
    this.audioContext = null,
    this.source = null,
    this.infoUpdateId = null,
    this.animationId = null,
    this.status = 0,
    this.forceStop = false,
    this.allCapsReachBottom = false,
    this.gainNode = null,
    this.analyser = null,
    this.prevol = 0.50,
    this.vol = 0.50,
    this.max = -1,
    this.isOpera = false,
    this.isChrome = false,
    this.tick = 0,
    this.maxed = 0,
    this.fillCol = "#28b9b1";//315b16 28b9b1;
    //////
    this.scene = null,
    this.camera = null,
    this.renderer = null,
    this.geometry = null,
    this.material = null,
    this.mesh = null,
    this.particles = [],
    this.starId = null,
    this.starBaseMod = 14,
    this.maxParts = 795,
    this.beepUp = true,
    this.urlval = "",
    this.ny = 0;
};
Visualizer.prototype = {
	/* Changes the color of the spectrum. */
    updateCol: function(color) {
        var canvas = document.getElementById('canvas'),
            ctx = canvas.getContext('2d'),
            aa = document.getElementById("albumart");
        this.fillCol = "#"+color;
        if(aa.data.indexOf("img/monstercat_logow.png") > -1)
        {
          aa.style.border = "2px solid "+this.fillCol;
        }
        aa.style.backgroundColor = this.fillCol;
        if (this.status !== -2) {
            ctx.clearRect(0, 0, canvas.width, canvas.height-2);
            for (var i = 0; i < 63; i++) {
                ctx.fillStyle = this.fillCol;
                ctx.fillRect(i * 15 , canvas.height - 2, 10, canvas.height-2);
            }
        }
    },
    init: function() {
        this.prep();
        
        this.drawBGFX(this.analyser);
    },
	/* Sets up all events and other things before anything else happens. */
    prep: function() {
        this.isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;// Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
        this.isChrome = !!window.chrome && !this.isOpera;              // Chrome 1+
        
        if (!this.isChrome) {
            document.getElementById("chrme").style.paddingRight = "5px";
            document.getElementById("chrme").innerHTML = "Use Chrome for best results!";
        }
        document.getElementById("canvas").height = window.innerHeight*0.47;
        
        this.scene = new THREE.Scene();

        this.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 10000 );
        this.camera.position.z = 1000;
        
        var canvastars = document.getElementById("stars");
        this.renderer = new THREE.WebGLRenderer({ canvas: canvastars });
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        
        //////END threejs
        
        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
        window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
        window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame;
        if (window.AudioContext) {
            this.audioContext = new AudioContext();
		}
        
        var canvas = document.getElementById('canvas'),
                context = canvas.getContext('2d'),
                body = document.getElementById("screen");
        var that = this;
        
        document.getElementById("hidethis").addEventListener("click", function(){
                if (document.getElementById("hidethis").innerHTML == "Hide") {
                    document.getElementById("hidethis").innerHTML = "Show";
                    document.getElementById("wrapinfo").style.visibility = "hidden";
                    document.getElementById("loadTxt").getElementsByTagName("img")[0].style.visibility = "hidden";
                }
                else
                {
                    document.getElementById("hidethis").innerHTML = "Hide";
                    document.getElementById("wrapinfo").style.visibility = "visible";
                    if (document.getElementById("loader").style.visibility == "hidden") {
                      document.getElementById("loadTxt").getElementsByTagName("img")[0].style.visibility = "visible";
                    }
                }
        });
        document.getElementById("helpme").addEventListener("click", function(){
                if (document.getElementById("helpbox").style.marginLeft == "0px") {
                    document.getElementById("helpbox").style.marginLeft = "-1000px";
                }
                else
                {
                    if (document.getElementById("tdbox").style.marginLeft == "0px") {
                        document.getElementById("tdbox").style.marginLeft = "-1000px";
                    }
                    document.getElementById("helpbox").style.marginLeft = "0px";
                }
        });
        document.getElementById("tdlist").addEventListener("click", function(){
                if (document.getElementById("tdbox").style.marginLeft == "0px") {
                    document.getElementById("tdbox").style.marginLeft = "-1000px";
                }
                else
                {
                    if (document.getElementById("helpbox").style.marginLeft == "0px") {
                        document.getElementById("helpbox").style.marginLeft = "-1000px";
                    }
                    document.getElementById("tdbox").style.marginLeft = "0px";
                }
        });
        document.getElementById("loadTxt").addEventListener("click", function(){
                if (document.getElementById("loader").style.visibility == "visible") {
                    document.getElementById("loader").style.visibility = "hidden";
                    document.getElementById("loadTxt").getElementsByTagName("img")[0].style.visibility = "visible";
                }
                else
                {
                    document.getElementById("loader").style.visibility = "visible";
                    document.getElementById("loadTxt").getElementsByTagName("img")[0].style.visibility = "hidden";
                }
        });
        function clearMenus()
        {
          var h1 = document.getElementById("menus").getElementsByTagName("li");
          for(var i = h1.length; i--;)
          {
            h1[i].style.visibility = "hidden";
            h1[i].style.width = "48px";
          }
        };
        document.getElementById("colPick").onclick = function() {
			var colPickm = document.getElementById("colPick-m");
            if (colPickm.style.visibility == "visible") {
              colPickm.style.visibility = "hidden";
              colPickm.style.width = "48px";
            }
            else
            {
              clearMenus();
              colPickm.style.width = "62px";
              colPickm.style.visibility = "visible";
            }
        };
        document.getElementById("fileBtn").onclick = function() {
			var fileBtnm = document.getElementById("fileBtn-m");
            if (fileBtnm.style.visibility == "visible") {
              fileBtnm.style.visibility = "hidden";
              fileBtnm.style.width = "48px";
            }
            else
            {
              clearMenus();
              fileBtnm.style.width = "256px";
              fileBtnm.style.visibility = "visible";
            }
        };
        document.getElementById("playpause").onclick = function() {
            if (document.getElementById("playpause-m").style.visibility == "visible") {
              document.getElementById("playpause-m").style.visibility = "hidden";
            }
            else
            {
              clearMenus();
              document.getElementById("playpause-m").style.visibility = "visible";
            }
        };
		/* Turns the volume slider into a decimal percentage. */
        var volf = function() {
            if (that.status == -2) {
                  if (that.gainNode != null) {
                      that.vol = document.getElementById("volr").value/100;
                      that.prevol = document.getElementById("volr").value/100;
                      that.gainNode.gain.value = that.vol;
                  }
            }
            else if (that.gainNode == null) {
                that.prevol = document.getElementById("volr").value/100;
            }
        };
        document.getElementById("volr").oninput = volf;
        document.getElementById("volr").onchange = volf;
        
        document.getElementById("fileurl").onclick = function() {
          if (document.getElementById("urlbox").value != "") {
            if (that.status === -2) {
                that.forceStop = true;
                that.status = 0;
            }
            that.urlval = document.getElementById("urlbox").value;
            document.getElementById("urlbox").value = "";
            that.start();
          }
        };
        document.getElementById("fileup").onchange = function() {
            if (that.audioContext == null) {return;}
            
            if (document.getElementById("fileup").files.length !== 0) {
                that.file = document.getElementById("fileup").files[0];
                that.fileName = that.file.name.substring(0, that.file.name.lastIndexOf('.'));
                if (that.status === -2) {
                    that.forceStop = true;
                    that.status = 0;
                }
                that.urlval = "";
                document.getElementById("urlbox").value = "";
                that.start();
            }
        };
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height-2);
        for (var i = 0; i < 63; i++) {
            ctx.fillStyle = this.fillCol;
            ctx.fillRect(i * 15 , canvas.height - 2, 10, canvas.height-2);
        }
    },
	/* Check if the ID3 Tags have a featured artist. Incomplete. */
    checkFeat: function(tagstr, id, shouldSet){
        var ind1 = ~tagstr.toUpperCase().indexOf("FT.") || ~tagstr.toUpperCase().indexOf("FEAT.");
        console.log(ind1);
        if (ind1) {
            var feat = "";
            ind1 = tagstr.toUpperCase().indexOf("FT.");
            var mod = 0;
            if (ind1 < 0) {
                ind1 = tagstr.toUpperCase().indexOf("FEAT.");
                if (ind1 >= 0) {
                    feat = "FEAT. "+this.trim1(tagstr.substring(ind1+5));
                    mod = 5;
                }
            }
            else
            {
                console.log(this.trim1(tagstr.substring(ind1+3)));
                feat = "FEAT. "+this.trim1(tagstr.substring(ind1+3));
                mod = 3;
            }
            if (ind1 >= 0) {
                document.getElementById("snginf").style.marginTop = "45px";
                var bnd = this.trim1(tagstr.trim().substring(0, ind1).toUpperCase());
                if (bnd.endsWith("(") || bnd.endsWith("[")) {
                    bnd = this.trim1(tagstr.substring(0, ind1-1).toUpperCase());
                }
                feat = this.trim1(feat.trim());
                if (feat.endsWith(")") || feat.endsWith("]")) {
                    var ind2 = feat.lastIndexOf(")");
                    if (ind2 < 0) {
                        ind2 = feat.lastIndexOf("]");
                    }
                    if (ind2 >= 0) {
                        feat = "FEAT. " + this.trim1(tagstr.substring(ind1+mod, ind2-2).toUpperCase());
                    }
                }
                if (shouldSet) {
                    document.getElementById(id).innerHTML = bnd;
                }
                document.getElementById("feat").innerHTML = "("+feat.toUpperCase()+")";
                document.getElementById("feat").style.visibility = "visible";
            }
        }
        else
        {
            document.getElementById(id).innerHTML = tagstr.toUpperCase();
        }  
    },
    trim1: function(str) {
        return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    },
	/* Load and prepare the file for playing. */
    start: function() {
            var that = this,
                file = this.file,
                fr = new FileReader();
        if (this.gainNode != null) {
            this.gainNode.gain.value = 0.00;
            this.vol = 0.00;
        }
        if (this.status == 0) {
            var loadBeep = setInterval(function(){
                if(that.beepUp === true)
                {
                    document.getElementById("loader").style.opacity = "0.5";
                }
                else if (that.beepUp === false) {
                    document.getElementById("loader").style.opacity = "0";
                }
                if (that.status == -2 && that.beepUp === true) {
                    document.getElementById("loader").style.opacity = "0";
                    document.getElementById("loader").innerHTML = "Loading...<br><span id='xload'>Strange things can happen if you tab out during this...</span>";
                    clearInterval(loadBeep);
                }
                if (that.status == -1 && that.beepUp === true) {
                    document.getElementById("loader").innerHTML = "Preparing...<br><span id='xload'>Funny things happen if you switch tabs while it loads...</span>";
                }
                if (that.status == 1 && that.beepUp === true) {
                    document.getElementById("loader").innerHTML = "Scaling...<br><span id='xload'>Weird things can happen if you minimize right now...</span>";
                }
                that.beepUp = !that.beepUp;
                }, 1000)
        }
        if (that.urlval == "") {
            if (file != null) {
                if (that.status == 0) {
                    console.log("aaghh");
                    that.maxed = 0;
                }
                fr.onload = function(e) {
                    var fileResult = e.target.result;
                    var audioContext = that.audioContext;
                    if (audioContext === null) {
                        return;
                    }
                    audioContext.decodeAudioData(fileResult, function(buffer) {
                        that.setupAudio(audioContext, buffer);
                    }, function(e) {
                        console.log(e);
                    });
                    that.id3it(file, that);
                }
                fr.onerror = function(e) {
                    console.log(e);
                }
                fr.readAsArrayBuffer(file);
            }
        }
        else
        {
            if (that.status == 0) {
                console.log("Tefc");
                that.maxed = 0;
            }
            var xhr = new XMLHttpRequest();
            var sf = that.urlval;
            that.fileName = decodeURIComponent(sf.substring(sf.lastIndexOf('/')+1, sf.lastIndexOf('.')));
            xhr.open("GET", sf); 
            xhr.responseType = "blob";
            xhr.onload = function() 
            {
                fr.onload = function(e) {
                    var fileResult = e.target.result;
                    var audioContext = that.audioContext;
                    if (audioContext === null) {
                        return;
                    }
                    audioContext.decodeAudioData(fileResult, function(buffer) {
                        console.log("akhk");
                        that.setupAudio(audioContext, buffer);
                    }, function(e) {
                        console.log(e);
                    });
                    that.id3it(new File([e.target.result], decodeURIComponent(sf.substring(sf.lastIndexOf('/')+1))), that);
                };
                fr.onerror = function(e) {
                    console.log(e);
                }
                fr.readAsArrayBuffer(xhr.response);
            }
            xhr.send();
        }
    },
	/* Read the ID3 Tags of the file, if possible. Tries to determine where certain information is as setup varies. */
    id3it: function(file, that)
    {
        if (that.status == 0) {
            console.log(file);
            document.getElementById("artist").innerHTML = "UNKNOWN";
            document.getElementById("song").innerHTML = "NO SONG";
            document.getElementById("snginf").style.marginTop = "60px";
            document.getElementById("feat").style.visibility = "hidden";
            id3(file, function(err, tags){
                if (err) {
                    console.log(err);
                }
                if (typeof tags.v2 !== 'undefined' && tags.v2 !== null) {
                    if (typeof tags.v2.band !== 'undefined' && tags.v2.band !== null) {
                        if (tags.v2.band.length >= 1) {
                            that.checkFeat(tags.v2.band, "artist", true);
                            that.checkFeat(tags.v2.artist, "artist", false);
                        }
                        else if (typeof tags.v2.artist !== 'undefined' && tags.v2.artist !== null){
                            if (tags.v2.artist.length >= 1) {
                                that.checkFeat(tags.v2.artist, "artist", true);
                            }
                        }
                    }
                    else if (typeof tags.v2.artist !== 'undefined' && tags.v2.artist !== null){
                        if (tags.v2.artist.length >= 1) {
                            that.checkFeat(tags.v2.artist, "artist", true);
                        }
                        else
                        {
                            if (typeof tags.v1.artist !== 'undefined' && tags.v1.artist !== null) {
                                if (tags.v1.artist.length >= 1) {
                                    that.checkFeat(tags.v1.artist, "artist", true);
                                }
                            }
                        }
                    }
                    else if (typeof tags.v2.artist === 'undefined' || tags.v2.artist === null) {
                        if (typeof tags.v1.artist !== 'undefined' && tags.v1.artist !== null) {
                            if (tags.v1.artist.length >= 1) { // APPARENTLY THIS CHECK DOESN'T WORK BUT I GIVE UP
                                that.checkFeat(tags.v1.artist, "artist", true);
                            }
                        }
                    }
                    if (typeof tags.v2.title !== 'undefined' && tags.v2.title !== null) {
                        if (tags.v2.title.length >= 1) {
                            var ind = tags.v2.title.indexOf(" - ");
                            if (ind !== -1) {
                                that.checkFeat(tags.v2.title.substring(0, ind), "artist", true);
                                that.checkFeat(tags.v2.title.substring(ind+3), "song", true);
                            }
                            else
                            {
                                that.checkFeat(tags.v2.title, "song", true);
                            }
                        }
                        else
                        {
                            if (typeof tags.v1.title !== 'undefined' && tags.v1.title !== null) {
                                if (tags.v1.title.length >= 1) {
                                    var ind = tags.v1.title.indexOf(" - ");
                                    if (ind !== -1) {
                                        that.checkFeat(tags.v1.title.substring(0, ind), "artist", true);
                                        that.checkFeat(tags.v1.title.substring(ind+3), "song", true);
                                    }
                                    else
                                    {
                                        that.checkFeat(tags.v1.title, "song", true);
                                    }
                                }
                            }
                        }
                    }
                    else
                    {
                        if (typeof tags.v1.title !== 'undefined' && tags.v1.title !== null) {
                            if (tags.v1.title.length >= 1) {
                                that.checkFeat(tags.v1.title, "song", true);
                            }
                        }
                    }
                    var aa = document.getElementById("albumart"),
                    rotYINT = null,
                    base64String = "";
                    
                    var cont2 = function()
                    {
                      console.log(tags);
                      if (document.getElementById("song").innerHTML == "NO SONG" && document.getElementById("artist").innerHTML != "UNKNOWN") {
                          that.checkFeat(that.fileName, "song");
                      }
                      if (document.getElementById("song").innerHTML == "NO SONG" && document.getElementById("artist").innerHTML == "UNKNOWN") {
                          var ind = that.fileName.indexOf(" - ");
                          if (ind !== -1) {
                              that.checkFeat(that.fileName.substring(0, ind), "artist", true);
                              that.checkFeat(that.fileName.substring(ind+3), "song", true);
                          }
                          else
                          {
                              that.checkFeat(that.fileName, "song", true);
                          }
                      }
                    }
                    if (typeof tags.v2.image !== 'undefined' && tags.v2.image !== null) {
                          var imgData = new Uint8Array(tags.v2.image.data);
                          base64String = "";
                          for (var i = 0; i < imgData.length; i++) {
                              base64String += String.fromCharCode(imgData[i]);
                          }
                    }
                    var cont1 = function()
                    {
                      if (typeof tags.v2.image !== 'undefined' && tags.v2.image !== null) {
                          var dataUrl = "data:" + tags.v2.image.mime + ";base64," + window.btoa(base64String);
                          clearInterval(rotYINT);
                          rotYINT=setInterval(function(){rotY(dataUrl, tags.v2.image.mime, "#fff", cont2)},10);
                      }
                    }
                    /* Rotate animation for image change. */
                    var rotY = function(idata, itype, bcol, callback)
                    {
                      that.ny = that.ny+9;
                      aa.style.transform="rotateY(" + that.ny + "deg)"
                      aa.style.webkitTransform="rotateY(" + that.ny + "deg)"
                      aa.style.OTransform="rotateY(" + that.ny + "deg)"
                      aa.style.MozTransform="rotateY(" + that.ny + "deg)"
                      if (that.ny==90 && that.tick == 0)
                      {
                        that.tick = 1;
                        aa.data = idata;
                        aa.type = itype;
                        aa.style.border = "2px solid "+bcol;
                        var c = aa.cloneNode(true);
                        aa.parentElement.appendChild(c);
                        aa.parentElement.removeChild(aa);
                        aa = c;
                        that.ny = 270;
                      }
                      else if (that.ny >= 360) {
                          clearInterval(rotYINT)
                          that.ny=0;
                          that.tick = 0;
                          callback();
                      }
                    };
                    if (aa.data.indexOf("img/monstercat_logow.png") == -1) {
                      clearInterval(rotYINT);
                      rotYINT=setInterval(function(){rotY("img/monstercat_logow.png", "image/png", that.fillCol,cont1)},10);
                    }
                    else
                    {
                      cont1();
                    }
                }
                else
                {
                    var ind = that.fileName.indexOf(" - ");
                    if (ind !== -1) {
                        that.checkFeat(that.fileName.substring(0, ind), "artist", true);
                        that.checkFeat(that.fileName.substring(ind+3), "song", true);
                    }
                    else
                    {
                        that.checkFeat(that.fileName, "song", true);
                    }
                }
            });
            
        }
    },
	/* Sets the analyser and audio data up to be drawn. */
    setupAudio: function(audioContext, buffer) {
        var audioBufferSouceNode = audioContext.createBufferSource();
            this.analyser = audioContext.createAnalyser();
            var that = this;
        if (!audioContext.createGain)
          audioContext.createGain = audioContext.createGainNode;
          
        this.analyser.minDecibels = -145;
        this.analyser.maxDecibels = 5;
        that.gainNode = audioContext.createGain();
        
        audioBufferSouceNode.connect(that.gainNode);
        that.gainNode.connect(audioContext.destination);
        audioBufferSouceNode.connect(this.analyser);
        audioBufferSouceNode.buffer = buffer;
        if (!audioBufferSouceNode.start) {
            audioBufferSouceNode.start = audioBufferSouceNode.noteOn
            audioBufferSouceNode.stop = audioBufferSouceNode.noteOff
        }
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.starId !== null && this.status == -2) {
            cancelAnimationFrame(this.starId);
        }
        if (this.forceStop && this.status == 1) {
            this.max = 0.0000;
        }
        if (this.source !== null) {
            console.log("stop-"+this.status);
            this.source.stop(0);
        }
        if (this.status != -1 || (this.max < 1.23 && this.maxed == 0)) {
            if (this.max < 1.23) {
                this.status = 0;
            }
            console.log(this.maxed + "-m");
            this.vol = 0.00;
            this.gainNode.gain.value = that.vol;
            audioBufferSouceNode.playbackRate.value = 2;
            if (this.status != 2) {
                this.status = 1;
                var d = 3;
                if (this.max < 1.23 && this.max >= 0.001) {
                    d = 2; // Try again halfway through the song for better results?
                    this.maxed = 1;
                    console.log("maxed");
                }
                audioBufferSouceNode.start(0,buffer.duration/d,7); // Preload to determine max for sizing, general "Drop" timerange
                console.log("pre"+this.status);
            }
        }
        else{
            this.status = -2;
            this.vol = this.prevol;
            this.gainNode.gain.value = this.vol;
            console.log("ready" + this.vol);
            audioBufferSouceNode.start(0);
        }
        this.source = audioBufferSouceNode;
        audioBufferSouceNode.onended = function() {
            that.audioEnd(that);
        };
        if (this.forceStop && this.status == -1) {
            this.drawBGFX(this.analyser);
            this.forceStop = false;
        }
        this.drawSpectrum(this.analyser);
    },
	/* Draws the spectrum based on the audio data in the analyser. */
    drawSpectrum: function(analyser) {
        var that = this,
            canvas = document.getElementById('canvas'),
            cwidth = canvas.width,
            cheight = canvas.height - 2,
            barWidth = 10,
            gap = 3,
            barNum = 63,
            fftSize = 8192*2,
            mathHeight = cheight/(that.max-0.07117);
        ctx = canvas.getContext('2d');
        if (!that.isChrome) {
            fftSize = 2048;
        }
        analyser.fftSize = fftSize;
        var drawMeter = function() {
            var array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            ctx.clearRect(0, 0, cwidth, cheight);
            for (var i = barNum; i--;) {
                var sum = 0;
                var j=0;
                for (; j < 18.75; ++j) {
                    if (that.status <= -1) {
                        sum += array[(i * 5) + j]*0.90;
                    }
                    else
                    {
                        sum += array[(i * 5) + j];
                    }
                }
                var average = sum / j;
                var value = 0;
                if (that.status == -2) {
                    value = Math.pow(((average/12288) * mathHeight)/1.8, 6.7)*1.8/1.05
                }
                var m = ((average/12288) * cheight)/3.775;
                if (m >= that.max && that.status == 1) {
                    that.max = m;
                }
                if (that.status != -2 && !that.forceStop) {
                    value = 0;
                }
                value = Math.max(value, 0);
                ctx.fillStyle = that.fillCol;
                ctx.fillRect(i * 15, cheight-value, barWidth, cheight+5000);
            }
            that.animationId = requestAnimationFrame(drawMeter);
        }
        this.animationId = requestAnimationFrame(drawMeter);
    },
	/* Draw the effects in the background. (Stars, fog, etc.) */
    drawBGFX: function(analyser)
    {
        var that = this,
            canvas = document.getElementById('canvas'),
            canvass = document.getElementById('stars'),
            sampledBar = 4; // Which bar (zero-based, from left) to sample from.
        if (!that.isChrome) {
            sampledBar = 0;
        }
		
        /* Function requested by requestAnimationFrame */
        var drawStar = function()
        {
            var sum = 0, average = 0, value = 0, cheight = (canvas.height - 2)/(that.max-0.07117);
            if (that.analyser != null) {
                var array = new Uint8Array(that.analyser.frequencyBinCount);
                that.analyser.getByteFrequencyData(array);
                for (var j = 0; j < 18.75; ++j) {
                    if (that.status <= -1) {
                        sum += array[(sampledBar * 5) + j]*0.90;
                    }
                    else
                    {
                        sum += array[(sampledBar * 5) + j];
                    }
                }
                var average = sum / j;
                var value = 0;
                if (that.status == -2) {
                    value = Math.pow(((average/12288) * cheight)/1.8, 6.7)*1.8/1.05
                }
            }
            var r = Math.floor((Math.random() * 16) + 1);
            
            /* Generates fog */
            var fogGen = function()
            {
              r = Math.floor(Math.random()*5);
              if (r == 2 && that.particles.length < that.maxParts) {
                  r = (Math.random() * 180) + 45;
                  var ej = r;
                  that.geometry = new THREE.CircleGeometry( r, 34 );
                  that.material = new THREE.MeshBasicMaterial( { color: 0xffffff, transparent: true, opacity: 0.0022} );
          
                  that.mesh = new THREE.Mesh( that.geometry, that.material );
                  that.mesh.position.x = -(canvass.width/2) - (ej/2);
                  that.mesh.position.z = 50;
                  that.mesh.position.y = Math.floor((Math.random() * ((canvass.height/3)*2)) - (canvass.height/3));
                  var x = new Array(3);
                  x[0] = that.mesh;
                  x[1] = ((Math.random() * 1.45) - 0.65)/70; // y speed
                  x[2] = 0.672/that.starBaseMod; // x speed
                  that.particles.push(x); // We push it into stars to keep track of particle count.
                  that.scene.add( that.mesh );
              }
            };
            
            /* Generates stars */
            var starGen = function(that1){
                r = Math.random();
                if (r > 0.3) {
                    r = (Math.random() * 300) + 10;
                    that1.geometry = new THREE.CircleGeometry( 2-(r/160), 6 );
                    var tcol = (0xffffff - (0x111111*Math.floor((r-300)/10)));
                    if (tcol > 0x020202) {
                        that1.material = new THREE.MeshBasicMaterial( { color:  tcol} );
                        that1.mesh = new THREE.Mesh( that1.geometry, that1.material );
                        that1.mesh.position.x = -(canvass.width/2) - 20;
                        that1.mesh.position.z = -r;
                        r = Math.floor(Math.random()*3);
                        if (r == 1) {
                            that1.mesh.position.y = Math.floor((Math.random() * canvass.height) - (canvass.height/2));
                        }
                        else
                        {
                            that1.mesh.position.y = Math.floor((Math.random() * ((canvass.height/4)*2)) - (canvass.height/4));
                        }
                        var x = new Array(3);
                        x[0] = that1.mesh;
                        x[1] = ((Math.random() * 1.45) - 0.65)/40; // y speed
                        x[2] = (Math.random()/that1.starBaseMod) + 0.00015; // x speed
                        that1.particles.push(x); // Push our new star into the list.
                        that1.scene.add( that1.mesh );
                    }
                }
                if(that1.status != -2 && that1.particles.length < that1.maxParts)
                {
                    if (that1.mesh != null) {
                        that1.mesh.translateX((Math.random()*canvass.width) - (canvass.width/7.5));
                    }
                    r = Math.floor(Math.random()*5);
                    if (r == 2) {
                        r = (Math.random() * 180) + 45;
                        var ej = r;
                        that1.geometry = new THREE.CircleGeometry( r, 34 );
                        that1.material = new THREE.MeshBasicMaterial( { color: 0xffffff, transparent: true, opacity: 0.0022} );
                
                        that1.mesh = new THREE.Mesh( that1.geometry, that1.material );
                        that1.mesh.position.x = -(canvass.width/2) - (ej/2);
                        that1.mesh.position.z = 50;
                        that1.mesh.position.y = Math.floor((Math.random() * ((canvass.height/3)*2)) - (canvass.height/3));
                        var x = new Array(3);
                        x[0] = that1.mesh;
                        x[1] = ((Math.random() * 1.45) - 0.65)/40; // y speed
                        x[2] = (Math.random()/that1.starBaseMod) + 0.00015;
                        that1.particles.push(x); // Push our new star into the list.
                        that1.scene.add( that1.mesh );
                        that1.mesh.translateX((Math.random()*canvass.width) - (canvass.width/7.5));
                    }
                }
            };
            
            if (r == 2 && that.particles.length < that.maxParts) {
                if (that.status != -2 && that.particles.length == 0) {
                    for(var a = that.maxParts-32; a--;)
                    {
                        starGen(that);
                    }
                }
                else
                {
                    starGen(that);
                }
                fogGen();
            }
            
            if (that.particles.length > 0) {
                for(var s = 0; ; )
                {
                    var star = that.particles[s][0];
                    var ymov = that.particles[s][1];
                    var xmov = that.particles[s][2];
                    if (star.position.x > (canvass.width/2)+3 || star.position.y > (canvass.height/2)+3 || star.position.y < -(canvass.height/2)-3) {
                        that.particles.splice(s, 1);
                        that.scene.remove(star);
                        s--;
                        r = Math.random()*2;
                        if (r <= 1.0001) {
                          fogGen();
                        }
                        else
                        {
                          starGen(that);
                        }
                    }
                    var barMod = value/10;
                    if (barMod >= 1.4 - (that.max*1.23)) {
                        star.translateX(xmov*((barMod*1.65)/1.3));
                        star.translateY(ymov*((barMod+0.65)/1.3));
                    }
                    else
                    {
                      star.translateX(xmov);
                      star.translateY(ymov);
                    }
                    s++;
                    if (s >= that.particles.length) {
                        break;
                    }
                }
            }
            
            that.renderer.render( that.scene, that.camera );
            that.starId = requestAnimationFrame(drawStar);
        }
        
        this.starId = requestAnimationFrame(drawStar);
    },
    audioEnd: function(instance) {
        if (this.forceStop) {
            this.forceStop = false;
            return;
        }
        if (this.status == 1) {
            console.log("max "+this.max)
        }
            console.log("end "+this.status);
            this.status = -1;
            this.start();
    }
}