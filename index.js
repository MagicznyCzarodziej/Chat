var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var nicknames = [];

function getNickname(id){
	for(let i in nicknames){
		if(nicknames[i].id == id) return nicknames[i].nickname;
	}
	return null;
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/style.css', function(req, res){
  res.sendFile(__dirname + '/style.css');
});

io.on('connection', function(socket, nickname){
	console.log("Client connected");

	socket.on('disconnect', function(){
		console.log("Client disconnected");
		io.emit('client disconnect', "Użytkownik " + getNickname(socket.id) + " opuścił czat!");
		for(let i in nicknames){
			if(nicknames[i].id == socket.id) nicknames.splice(i,1);
		}
	});

	socket.on('client nickname', function(nickname){
		socket.broadcast.emit('client connect', "Użytkownik " + nickname + " dołączył!");
		nicknames.push({'id': socket.id, 'nickname': nickname});
	});

	socket.on('chat message', function(msg){
		console.log('msg: ' + msg);
		var nickname = getNickname(socket.id);
		socket.broadcast.emit('chat message', nickname, msg);
	});

	socket.on('chat command', function(cmd){
		var command = cmd.toLowerCase();
		switch(command){
			case "/list":
				var list = "";
				for(let i in nicknames){
			  		list += nicknames[i].nickname;
			  		if(i < nicknames.length-1) list += ", ";
			  	}
				socket.emit('chat users', list);
				break;
			default:
				socket.emit('chat command', "Nieznana komenda");
				break;
		}

	})

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
