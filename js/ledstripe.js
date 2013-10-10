var initLedstripe = function(ip){
	var socket = io.connect(ip + ':1337');

	$( body ).on( "volume", function( event, data) {
  		socket.emit('volume', { data: data });
	});

	$( body ).on( "beat", function( event, data) {
  		socket.emit('beat', { data: data });
	});
};