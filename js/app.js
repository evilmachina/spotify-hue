var _player;

var position = 0;
var bufferSize = 256;

var signal = new Float32Array(bufferSize);
var peak = new Float32Array(bufferSize);

var fft = new FFT(bufferSize, 11000);

var kickColor = 'white';
var snareColor = 'white';
var hatColor = 'white';
var colorOffset = 360,
    autoColorOffset = 0.5;

var innerBars,
    kickContainer = $('#kick'),
    snareContainer = $('#snare'),
    hatContainer = $('#hat'),
    beatContainer = $('#beat'),
    body = $(document.body);

var getColor = function(h){

    var rgb = hsv2rgb(h, 100, 100);

    var cssColor = 'rgb(' + rgb.join(',') + ')';

    return cssColor;
};

//21.48 - 451.17 Hz
var kick = new Beat({frequency:[0,10], threshold:0.2, decay:0.05});
//451.17 - 1310.54 HZ
var snare = new Beat({frequency:[11,30], threshold:0.05, decay:0.05});
//1310.54 - 5521.48 Hz
var hat = new Beat({frequency:[31,128], threshold:0.05});
var beat = new Beat({frequency:[0,128], threshold:0.3, decay:0.07});

var updateBeat = function(isKick, isSnare, isHat, isBeat){
    var newColor = 'rgb(0, 0, 255)';
    if(isKick){
     newColor = 'red';
    }
    if(newColor != kickColor){
        kickContainer.css('background-color', newColor);
        kickColor = newColor;
    }
     newColor = 'blue';
    if(isSnare){
     newColor = 'red';
    }
    if(newColor != snareColor){
        snareContainer.css('background-color', newColor);
        snareColor = newColor;
    }
     newColor = 'blue';
    if(isHat){
     newColor = 'red';
    }
    if(newColor != hatColor){
        hatContainer.css('background-color', newColor);
        hatColor = newColor;
    }

    /*if(isKick && isSnare && isHat){
        body.css('background-color', 'white');
    }else{

       body.css('background-color', 'black'); 
    }*/
    
    if(isBeat){
        beatContainer.css('background-color', 'white');
    }else{
       beatContainer.css('background-color', 'black'); 
    }
}

var beatCount = 0,
    firstBeat = 0,
    previousBeat = 0,
    bpmAvg = 0;

var calculateBeatAvr = function(isBeat){
    var timeNow = new Date().getTime();
    if (( previousBeat - firstBeat) > 1000){
        beatCount = 0;
        bpmAvg = 0;
    } 
    if(isBeat){
        if (beatCount == 0){
            firstBeat = timeNow;
            beatCount = 1;
        }else{
            bpmAvg = 60000 * beatCount / (timeNow - firstBeat);
            beatCount++;
        }
        previousBeat = timeNow;
    }
  
};
var slowVolume = 0;
var slowVolumes = [0,0,0,0,0,0,0,0,0,0];
var slowBeatVolume = 0;

var colorForBand = function(spectrum, numberOfSpectrums){
    var iPercent = spectrum/numberOfSpectrums;
    var colorForVolume = 360 - (360 * iPercent + colorOffset) % 360;
    return colorForVolume;
};

var colorForBandRGB = function(spectrum, numberOfSpectrums){
    var colorForVolume = colorForBand(spectrum, numberOfSpectrums);
    var volumeRgb = hsv2rgb(colorForVolume, 100, 100);
    return volumeRgb;
};

var volumeForBand = function(dbValue){
   return Math.max(Math.min(Math.floor(dbValue + 60), 72), 0) / 72 * 100;
};

var startTime = new Date().getTime();

var equliced = new Float32Array(bufferSize/2);
var bd = new BeatDetektor();
var bassKick = new BeatDetektor.modules.vis.BassKick();
var vu = new BeatDetektor.modules.vis.VU();
var resetBeatDetektor = function(){
    bd.reset();
    startTime = new Date().getTime();
};

var m_BeatTimer = 0;
var m_BeatCounter = 0;
var clearClr = [0,0,0];
var update = function(a){
    //console.log(a);
    var time = new Date().getTime() / 1000;

    var leftAndRight = a.audio.wave.left.concat(a.audio.wave.right);
    var mix = [];
    for (var i = 0, len = leftAndRight.length/2; i < len; i++) {
      mix[i] = (leftAndRight[i] + leftAndRight[len + i]) / 2;
    }

    fft.forward(mix);

    bd.process(time, fft.spectrum);
    bassKick.process(bd);
    //var isKick = bassKick.isKick();
   
isBeat = false;

 vu.process(bd, time);

    var blurClip = vu.vu_levels[0] * 6.0;
                if (blurClip < 0) blurClip = 0;
                if (blurClip > 0.99) blurClip = 0.99;


var beatColorOffset = (colorOffset + (360 * blurClip)) % 360;
var promoteColor = [0,0,0];
if(beatColorOffset >= 0 && beatColorOffset < 120){
    promoteColor[0] = 0.5;  
}
if(beatColorOffset >= 120 && beatColorOffset < 240){
    promoteColor[1] = 0.5;  
}
if(beatColorOffset >= 240 ){
    promoteColor[2] = 0.5;  
}


var bpm = bd.win_bpm_int/10.0;
    if (bpm) {
        m_BeatTimer += bd.last_update;

        if (m_BeatTimer > (60.0 / bpm)) {
            m_BeatTimer -= (60.0 / bpm);
            clearClr[0] = Math.min(promoteColor[0] + Math.random() / 2, 1);
            clearClr[1] = Math.min(promoteColor[1] + Math.random() / 2, 1);
            clearClr[2] = Math.min(promoteColor[2] + Math.random() / 2, 1);
            isBeat = true;
            //console.log(clearClr);
        }
    }

    var rgbBeat = [Math.round(255*clearClr[0]),Math.round(255*clearClr[1]),Math.round(255*clearClr[2])];
    body.css('background-color', 'rgb(' + rgbBeat.join(',') + ')');
    //beatContainer.css('background-color', 'rgb(' + rgb.join(',') + ')');
    
   
    //console.log("bpm:" + bd.win_bpm_int_lo);
   /* var blur = 'none';
    if(blurClip > 0){
       blur = "blur(" + (5 * blurClip) + 'px)';
       //console.log(blur); 
    }*/

    

    

    var spotifySpectrum = a.audio.spectrum.right;

    var norminisedSpectrum = spotifySpectrum.map(function(band){return volumeForBand(band);});

    var isKick = kick.onUpdate(fft.spectrum);
    var isSnare = snare.onUpdate(fft.spectrum);
    var isHat = hat.onUpdate(fft.spectrum);
    //var isBeat = beat.onUpdate(fft.spectrum);


    var r = isKick ? 255 : 0;
    var g = isSnare ? 255 : 0;
    var b = isHat ? 255 : 0;

    var test = [];
    var spectrumlength = innerBars.length;
    var volume = volumeForBand(spotifySpectrum[16]);
    
    if(volume > slowVolume){
        slowVolume = volume;
    }else{
        slowVolume *=0.90;
    }
    var volumeRgb = colorForBandRGB(16, spectrumlength);
    

    var volumeData = {rgb:volumeRgb, percentage:slowVolume};


    
    calculateBeatAvr(isBeat);

   var beatvolume = volumeForBand(spotifySpectrum[0]);
   /* var beatRgb = colorForBandRGB(4, spectrumlength);

    var data = {rgb:beatRgb, percentage:beatvolume};
    
    if(bpmAvg > 140 ){
        data = {rgb: [r,g,b], percentage:100};
    }*/
   // console.log(bpmAvg);

    if(beatvolume > slowBeatVolume){
        slowBeatVolume = Math.min(beatvolume * 2, 100);
    }else{
        slowBeatVolume = beatvolume;
    }


   var beatData = {rgb:rgbBeat, percentage:slowBeatVolume};


    body.trigger( "beat", [ beatData ] );
    
    updateBeat(isKick, isSnare, isHat, isBeat);
    var volumes = [];
    for(var index=0; index<spectrumlength; index++){
        
        var hue = colorForBand(index, spectrumlength);
        var rgb = colorForBandRGB(index, spectrumlength);
        var height = volumeForBand(spotifySpectrum[index]);

        if(height > slowVolumes[index]){
            slowVolumes[index] = height;
        }else{
            slowVolumes[index] *=0.80;
        }
        if(index < 8){
            volumes.push({rgb:rgb, percentage:slowVolumes[index]});
        }
       // $(innerBars[index]).height(height+'%').css('background-color', getColor(hue));
    };
    //console.log(volumes);
    volumes.push(beatData);
    body.trigger( "volumes", [volumes] );
    body.trigger( "volume", [volumes[4]] );
    //body.css('-webkit-filter', blur);
    colorOffset += autoColorOffset;
    colorOffset %= 360;

}; 



var bars = [];

for (var i = 0; i < 10; i++) {
    bars.push('<div class="bar"><div class="inner-bar"/></div>');
}

$('#bar-holder').append(bars.join('\n'));
innerBars = $('.inner-bar');

require(['$api/models','$api/audio'], function(models,audio) {
            
            models.player.load("position").done(function(player) {
                player.addEventListener('change', function(event){});


                _player = player;
                console.log(audio);
                var RTA = audio.RealtimeAnalyzer.forPlayer(player, audio.BAND10);
                RTA.addEventListener('audio',update);
                RTA.addEventListener('reset',resetBeatDetektor);
                RTA.addEventListener('pause',resetBeatDetektor);
                console.log(RTA);
            });


});

