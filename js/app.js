 var socket = io.connect('neuromancer.local:1337');

//var frameBufferSize = 512;
var bufferSize = 256;

var signal = new Float32Array(bufferSize);
var peak = new Float32Array(bufferSize);

var fft = new FFT(bufferSize, 11000);

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


var kick = new Kick({frequency:[0,10], threshold:0.2, decay:0.05});
var snare = new Kick({frequency:[10,30], threshold:0.05, decay:0.05});
var hat = new Kick({frequency:[30,128], threshold:0.05});
var beat = new Kick({frequency:[0,128], threshold:0.2, decay:0.05});

var updateBeat = function(isKick, isSnare, isHat, isBeat){
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

    if(isBeat){
        $('#beat').css('background-color', 'white');
    }else{
       $('#beat').css('background-color', 'black'); 
    }
}


var equliced = new Float32Array(bufferSize/2);
var update = function(a){
    
    //var spectrum = a.audio.spectrum;
    
    //console.log('hej');
    //console.log(a);
    var leftAndRight = a.audio.wave.left.concat(a.audio.wave.right);
    var mix = [];
    for (var i = 0, len = leftAndRight.length/2; i < len; i++) {
      mix[i] = (leftAndRight[i] + leftAndRight[len + i]) / 2;
    }
     
    //signal //= DSP.getChannel(DSP.MIX, leftAndRight);
    //console.log(mix.length);
    fft.forward(mix);
    //fEnergy(fft.spectrum);
    //console.log(fft.spectrum.length);
    var isKick = kick.onUpdate(fft.spectrum);
    var isSnare = snare.onUpdate(fft.spectrum);
    var isHat = hat.onUpdate(fft.spectrum);
    var isBeat = beat.onUpdate(fft.spectrum);

    var r = isKick ? 255 : 0;
    var g = isSnare ? 255 : 0;
    var b = isHat ? 255 : 0;
    var data = {rgb:[r,g,b], percentage:100};
 
    updateBeat(isKick, isSnare, isHat, isBeat);


    socket.emit('data', { data: data });
    //var max2 = 0;
    //console.log(max2);
    for ( var i = 0; i < bufferSize/2; i++ ) {
         equliced[i]  = fft.spectrum[i] * -1 * Math.log((fft.bufferSize/2 - i) * (0.5/fft.bufferSize/2)) * fft.bufferSize; // equalize, attenuates low freqs and boosts highs
          //console.log(fft.spectrum[i]);
          //max2 = Math.max(fft.spectrum[i], max2);
          if ( peak[i] < equliced[i] ) {
            peak[i] = equliced[i];
          } else {
            peak[i] *= 0.99; // peak slowly falls until a new peak is found
          }
        }
    //console.log(max2);
    var test = [];

    $('.inner-bar').each(function( index ) {
            
            var iPercent = index/128;
            var h = 360 - (360 * iPercent + colorOffset) % 360;
      //      test[index] = fft.getBandFrequency(index);

            var height = peak[index] /2;
            
            $(this).height(height+'%').css('background-color', getColor(h));
        });
    //console.log(test);

    

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

