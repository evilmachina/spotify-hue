require([
        '$api/models'], function(models){
    models.application.load('arguments').done(pages);

    // When arguments change, run pages function
    models.application.addEventListener('arguments', pages);

    function pages() {
        var args = models.application.arguments;
        var current = document.getElementById(args[0]);
        var sections = document.getElementsByClassName('section');
        for (i=0;i<sections.length;i++){
            sections[i].style.display = 'none';
        }
        current.style.display = 'block';
    }
 });

$( "#connectLed" ).click(function() {
	var ip = $( "#ledvisulaserIp" ).val();

	localStorage.setItem( 'ledvisulaserIp', ip);
  	initLedstripe(ip);
});


var ledvisulaserIp = localStorage.getItem( 'ledvisulaserIp');
$( "#ledvisulaserIp" ).val(ledvisulaserIp);


$( "#connectHue" ).click(function() {
	var ip = $( "#hueIp" ).val();

	localStorage.setItem( 'hueIp', ip);
  	initHue(ip);
});


var hueIp = localStorage.getItem( 'hueIp');
$( "#hueIp" ).val(hueIp);