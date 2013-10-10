var bufferSize = 256;

var signal = new Float32Array(bufferSize);
var peak = new Float32Array(bufferSize);

var fft = new FFT(bufferSize, 11000);

var kickColor = 'white';
var snareColor = 'white';
var hatColor = 'white';
var colorOffset = 360,
    autoColorOffset = 0.09;

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
var kick = new Kick({frequency:[0,10], threshold:0.2, decay:0.05});
//451.17 - 1310.54 HZ
var snare = new Kick({frequency:[10,30], threshold:0.05, decay:0.05});
//1310.54 - 5521.48 Hz
var hat = new Kick({frequency:[30,128], threshold:0.05});
var beat = new Kick({frequency:[0,128], threshold:0.3, decay:0.07});

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

    if(isKick && isSnare && isHat){
        body.css('background-color', 'white');
    }else{

       body.css('background-color', 'black'); 
    }

    if(isBeat){
        beatContainer.css('background-color', 'white');
    }else{
       beatContainer.css('background-color', 'transparent'); 
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

var equliced = new Float32Array(bufferSize/2);
var update = function(a){

    var leftAndRight = a.audio.wave.left.concat(a.audio.wave.right);
    var mix = [];
    for (var i = 0, len = leftAndRight.length/2; i < len; i++) {
      mix[i] = (leftAndRight[i] + leftAndRight[len + i]) / 2;
    }

    fft.forward(mix);

    var isKick = kick.onUpdate(fft.spectrum);
    var isSnare = snare.onUpdate(fft.spectrum);
    var isHat = hat.onUpdate(fft.spectrum);
    var isBeat = beat.onUpdate(fft.spectrum);

    var r = isKick ? 255 : 0;
    var g = isSnare ? 255 : 0;
    var b = isHat ? 255 : 0;


    
    var spotifySpectrum = a.audio.spectrum.right;

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
    body.trigger( "volume", [ volumeData ] );

    
    calculateBeatAvr(isBeat);

    var beatvolume = volumeForBand(spotifySpectrum[4]);
    var beatRgb = colorForBandRGB(4, spectrumlength);

    var data = {rgb:beatRgb, percentage:beatvolume};
    
    if(bpmAvg > 140 ){
        data = {rgb: [r,g,b], percentage:100};
    }

    body.trigger( "beat", [ data ] );

    updateBeat(isKick, isSnare, isHat, isBeat);
   /* for(var index=0; index<spectrumlength; index++){
        
        var hue = colorForBand(index, spectrumlength);
        var height = volumeForBand(spotifySpectrum[index]);
        $(innerBars[index]).height(height+'%').css('background-color', getColor(hue));
    };
*/
    colorOffset += autoColorOffset;
    colorOffset %= 360;

}; 



var bars = [];

for (var i = 0; i < 31; i++) {
    bars.push('<div class="bar"><div class="inner-bar"/></div>');
}

$('#bar-holder').append(bars.join('\n'));
innerBars = $('.inner-bar');

require(['$api/models','$api/audio'], function(models,audio) {
            
            models.player.load("index").done(function(player) {

                console.log(audio);
                var RTA = audio.RealtimeAnalyzer.forPlayer(player, audio.BAND31);
                RTA.addEventListener('audio',update);
                console.log(RTA);
            });


});

