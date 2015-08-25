/**
 * New node file
 */
var http 		= require("http")
	,fs 		= require("fs")
	,sockeio	= require("socket.io");

//웹서버를 만듭니다.
var server  = http.createServer(function(request, response) {
	//htmlPage.html 파일을 읽습니다.
	fs.readFile("mobile2.html", function(err, data) {
		response.writeHead(200, {"Content-Type":"text/html"});
		response.end(data);
	})
}).listen(52273,function() {
	console.log("Server running at http://127.0.0.1:52273");
});

//소켓 서버를 만듭니다.
var io	= sockeio.listen(server);
io.set("log level", 2);
io.sockets.on("connection",function(socket) {
	console.log("사용자가 접근하였습니다.|"+socket.id);

	//클라이언트 - > 서버 방목록 조회 요청
	socket.on("requestRandomChat",function(data) {
		var    rooms    =    io.sockets.manager.rooms;

		//혼자인 방을 조회후 매치
		for(var key in rooms) {

			console.log("key : " +key);
			if(key == '') {
                continue;
            }

			//this 방에 인원 숫 체크
			if(rooms[key].length  == 1) {
				var    roomKey    =    key.replace('/', '');
				socket.join(roomKey);
				socket.set("name",roomKey);
				io.sockets.to(roomKey).emit("completeMatch",{});
				return;
			}
        }//for end

		console.log(socket.id);

		//빈방이 없을 경우
		socket.join(socket.id);
		socket.set("name",socket.id);

	});
	// end 클라이언트 - > 서버 방목록 조회 요청

	//클라이언트 -> 서버 취소 요청
	socket.on("cancelRequestRandomChat", function() {
		socket.get("name",function(error, data) {
		    socket.leave(data);
			io.sockets.to(data).emit("disconnectClient")		//서버 -> 클라이언트 disconnect 이벤트 요청
		});
	});
	//end 클라이언트 -> 서버 취소 요청

	//클라이언트 -> 서버 Message 요청
	socket.on("sendMessage", function(data) {
		socket.get("name",function(error, data) {
			console.log("sendMessage|"+data);
		});
	    io.sockets.to(data).emit("receiveMessage",data);
	});
	//end 클라이언트 -> 서버 Message 요청

	//클라이언트 -> 서버 연결해제 요청시
	socket.on("disconnectClient", function(data) {
		socket.get("name",function(error, data) {
			socket.leave(data);
			io.sockets.to(data).emit("disconnectClient")		//서버 -> 클라이언트 disconnect 이벤트 요청
		});
	});
	//end 클라이언트 -> 서버 연결해제 요청시

	//클라이언트 -> 서버 현재 방정보 조회
	socket.on("requestClientListInRoom", function(data) {
		var    rooms    =    io.sockets.manager.rooms;
		for(var key in rooms) {

			console.log("key : " +key);
			if(key == '') {
                continue;
            }

			console.log("-----------------------------------------");
			console.log("nameRoom:"+rooms[key]);
			console.log("keyRoom:"+key.replace('/', ''));
			console.log("cnt:"+rooms[key].length);
			console.log("-----------------------------------------");

        }//for end
	});
	//end 클라이언트 -> 서버 현재 방정보 조회

});

