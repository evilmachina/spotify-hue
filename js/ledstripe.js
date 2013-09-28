var initLedstripe = function(ip){
	var socket = io.connect(ip + ':1337');

	$( body ).on( "beat", function( event, data) {
  		socket.emit('data', { data: data });
	});
};