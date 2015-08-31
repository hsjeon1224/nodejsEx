/*
 * routes  : URL 별로 수행되는 로직을 저장한다.
 */
//모듈을 추출합니다.
var socketio = require("socket.io");
var express	 = require("express");
var http	 = require("http");
var ejs		 = require("ejs");
var fs		 = require("fs");

//웹서버를 생성합니다.
var app	= express();
app.use(app.router);
app.use(express.static("public"));

//웹서버를 실행합니다.
var server = http.createServer(app);
server.listen(52273, function() {
	console.log("server running at http://127.0.0.1:52373");
});

//소켓 서버를 생성합니다.
var io = socketio.listen(server);
io.set("log leve", 2);

//라우터를 수행합니다.
app.get("/", function(request, response) {
	fs.readFile("lobby.html", function(err, data) {
		response.send(data.toString());
	});
});

app.get("/canvas/:room", function(request, response) {
	fs.readFile("canvas.html", function(error, data) {
		response.send(ejs.render(data, {
			room: request.pram("room")
		}));
	});
});

app.get("/room", function(request, response) {
	response.send(io.sockets.manager.rooms);
});

//소켓 서버의 이벤트를 연결합니다.
io.sockets.on("connection", function(socket) {
	socket.on("join", function(data) {
		socket.join(data);
		socket.set("room", data);
	});

	socket.on("draw", function(data) {
		socket.get("room", function(error, room) {
			io.sockets.to(room).emit("line", data);
		});
	});

	socket.on("create_room", function(data) {
		io.sockets.emit("create_room", data.toString());
	});
});

