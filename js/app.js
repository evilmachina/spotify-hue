
function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
};


var feBuffer = createArray(31,42);
var fdBuffer = createArray(31,42);
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
    for (var i = 0; i < spectrum.left.length; i++){
        instant = spectrum.left[i];
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

var isKick = function(spectrum){

    return isRange(0, 6, 2);
};

var isSnare = function(spectrum){

    return isRange(7, 30, 8);
};

var isHat = function(spectrum){

    return isRange(23, 30, 1);
};


var kickColor = 'white';
var snareColor = 'white';
var hatColor = 'white';


var update = function(a){
    var spectrum = a.audio.spectrum;
    fEnergy(spectrum);
    //console.log('hej');
    //console.log(a);
    $('.bar').each(function( index ) {
            $(this).height( (120 - (96 + spectrum.left[index])) * 4);
        });
    

    var kick = isKick(spectrum);
    var snare = isSnare(spectrum);
    var hat = isHat(spectrum);

    var newColor = 'blue';
    if(kick){
     newColor = 'red';
    }
    if(newColor != kickColor){
        $('#kick').css('background-color', newColor);
        kickColor = newColor;
    }
     newColor = 'blue';
    if(snare){
     newColor = 'red';
    }
    if(newColor != snareColor){
        $('#snare').css('background-color', newColor);
        snareColor = newColor;
    }
     newColor = 'blue';
    if(hat){
     newColor = 'red';
    }
    if(newColor != hatColor){
        $('#hat').css('background-color', newColor);
        hatColor = newColor;
    }

    if(kick && snare && hat){
        $('#kick').css('background-color', 'white');
        $('#snare').css('background-color', 'white');
        $('#hat').css('background-color', 'white');
    }
}; 



var bars = [];

for (var i = 1; i <= 31; i++) {
    bars.push('<div class="bar"/>');
}

$('#bar-holder').append(bars.join('\n'));


require(['$api/models','$api/audio'], function(models,audio) {
            
            models.player.load("index").done(function(player) {

                console.log(audio);
                var RTA = audio.RealtimeAnalyzer.forPlayer(player, audio.BAND31);
                RTA.addEventListener('audio',update);
                console.log(RTA);
            });


});

