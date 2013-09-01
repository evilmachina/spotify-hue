
function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
};

var getLoudnesInProcents = function(loudnesDB){

    var procent =  Math.pow((96 + loudnesDB), 10) / Math.pow(108,10) * 100;
    return  Math.min(procent,100);
};

var frameBufferSize = 512;
var bufferSize = frameBufferSize/2;

var signal = new Float32Array(bufferSize);
var peak = new Float32Array(bufferSize);

var fft = new FFT(bufferSize, 11000);


var feBuffer = createArray(256,42);
var fdBuffer = createArray(256,42);
var fTimer = [];
var fIsOnset = [];
var insertAt = 0;
var sensitivity = 100;

var average = function(arr){
        var avg = 0;
        for (var i = 0; i < arr.length; i++)
        {
            avg += arr[i];
        }
        avg /= arr.length;
        return avg;
    }

var specAverage = function(arr){
        var avg = 0;
        var num = 0;
        for (var i = 0; i < arr.length; i++)
        {
            if (arr[i] > 0)
            {
                avg += arr[i];
                num++;
            }
        }
        if (num > 0)
        {
            avg /= num;
        }
        return avg;
    };

var variance = function(arr, val){
        var V = 0;
        for (var i = 0; i < arr.length; i++)
        {
            V += Math.pow(arr[i] - val, 2);
        }
        V /= arr.length;
        return V;
    };


var fEnergy = function(spectrum){
    var instant, E, V, C, diff, dAvg, diff2;
    for (var i = 0; i < spectrum.length; i++){
        instant = getLoudnesInProcents(spectrum[i]);
        E = average(feBuffer[i]);
        V = variance(feBuffer[i], E);
        C = (-0.0025714 * V) + 1.5142857;
        diff = Math.max(instant - C * E, 0);
        dAvg = specAverage(fdBuffer[i]);
        diff2 = Math.max(diff - dAvg, 0);

        if (new Date().getTime() - fTimer[i] < sensitivity){
                fIsOnset[i] = false;
            }else if (diff2 > 0){
                fIsOnset[i] = true;
                fTimer[i] = new Date().getTime();
            }else{
                fIsOnset[i] = false;
            }
            feBuffer[i][insertAt] = instant;
            fdBuffer[i][insertAt] = diff;
        }
        insertAt++;
        if (insertAt == feBuffer[0].length)
        {
            insertAt = 0;
        }
};


var getMaxAmplitude = function (spectrum, low, hige ) {
      var max = 0;

    for ( var i = low; i <= hige; i++ ) {
        if ( spectrum.left[ i ] > max ) { max = spectrum.left[ i ]; };
      }
      return max;
    };

var threshold = 0.25;

var  isRange = function(low, high, threshold){
        var num = 0;
        for (var i = low; i <= high; i++)
        {
            if (fIsOnset[i])
            {
                num++;
            }
        }
        return num >= (threshold);
    }

var isKick = function(){

    return isRange(0, 10, 0.3);
};

var isSnare = function(){

    return isRange(60, 128 , 8);
};

var isHat = function(){

    return isRange(70, 200, 1);
};

var isBeat = function(){
    return isRange(0, 256, 3);
};

var kickColor = 'white';
var snareColor = 'white';
var hatColor = 'white';
var colorOffset = 360,
    autoColorOffset = 0.036;

var getColor = function(h){

    var rgb = hsvToRgb(h, 1, 1);

    var cssColor = 'rgb(' + rgb.join(',') + ')';
   // console.log(h);
    //console.log(rgb);
    return cssColor;
};


var kick = new Kick();
var snare = new Kick({frequency:[30,128], threshold:0.2});
var hat = new Kick({frequency:[100,128], threshold:0.2});

var update = function(a){
    
    //var spectrum = a.audio.spectrum;
    
    //console.log('hej');
    //console.log(a);
    var leftAndRight = a.audio.wave.left.concat(a.audio.wave.right);
    //signal = DSP.getChannel(DSP.MIX, leftAndRight);
    //console.log(signal.length);
    fft.forward(a.audio.wave.left);
    //fEnergy(fft.spectrum);
    //console.log(fft.spectrum);

    for ( var i = 0; i < bufferSize; i++ ) {
          fft.spectrum[i] *= -1 * Math.log((fft.bufferSize/2 - i) * (0.5/fft.bufferSize/2)) * fft.bufferSize; // equalize, attenuates low freqs and boosts highs
          
          if ( peak[i] < fft.spectrum[i] ) {
            peak[i] = fft.spectrum[i];
          } else {
            peak[i] *= 0.99; // peak slowly falls until a new peak is found
          }
        }

    var test = [];

    $('.inner-bar').each(function( index ) {
            
            var iPercent = index/128;
            var h = 360 - (360 * iPercent + colorOffset) % 360;
            //test[index] = fft.getBandFrequency(index);

            var height = peak[index];
            
            $(this).height(height+'%').css('background-color', getColor(h));
        });
    //console.log(test);

    var isKick = kick.onUpdate(fft.spectrum);
    //var kick = isKick(fft.spectrum);
    var isSnare = snare.onUpdate(fft.spectrum);
    var isHat = hat.onUpdate(fft.spectrum);

    var newColor = 'rgb(0, 0, 255)';
    if(isKick){
     newColor = 'red';
    }
    if(newColor != kickColor){
        $('#kick').css('background-color', newColor);
        kickColor = newColor;
    }
     newColor = 'blue';
    if(isSnare){
     newColor = 'red';
    }
    if(newColor != snareColor){
        $('#snare').css('background-color', newColor);
        snareColor = newColor;
    }
     newColor = 'blue';
    if(isHat){
     newColor = 'red';
    }
    if(newColor != hatColor){
        $('#hat').css('background-color', newColor);
        hatColor = newColor;
    }

    if(isKick && isSnare && isHat){
        $('#kick').css('background-color', 'white');
        $('#snare').css('background-color', 'white');
        $('#hat').css('background-color', 'white');
    }

    if(isBeat()){
        $('#beat').css('background-color', 'white');
    }else{
       $('#beat').css('background-color', 'black'); 
    }

    colorOffset += autoColorOffset;
    colorOffset %= 360;

}; 



var bars = [];

for (var i = 0; i < 128; i++) {
    bars.push('<div class="bar"><div class="inner-bar"/></div>');
}

$('#bar-holder').append(bars.join('\n'));


require(['$api/models','$api/audio'], function(models,audio) {
            
            models.player.load("index").done(function(player) {

                console.log(audio);
                var RTA = audio.RealtimeAnalyzer.forPlayer(player);
                RTA.addEventListener('audio',update);
                console.log(RTA);
            });


});

