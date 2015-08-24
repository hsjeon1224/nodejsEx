/**
 * http://blog.puding.kr/156
 * 블러그 채팅 소스
 * npm install socket@0.9.17 로 설치해야함
 */
var http 		= require("http")
	,fs 		= require("fs")
	,sockeio	= require("socket.io");

//웹서버를 만듭니다.
var server  = http.createServer(function(request, response) {
	//htmlPage.html 파일을 읽습니다.
	fs.readFile("blog1.html", function(err, data) {
		response.writeHead(200, {"Content-Type":"text/html"});
		response.end(data);
	})
}).listen(52273,function(){
	console.log("Server running at http://127.0.0.1:52273");
});

//소켓 서버를 만듭니다.
var io	= sockeio.listen(server);
io.set("log level", 2);
io.sockets.on("connection", function(socket){

	//클라이언트의 connection 이벤트를 발생 시킨다.	서버 - > 클라이언트
	console.log("클라이언트의 connection 이벤트를 발생 시킨다.	서버 - > 클라이언트");
	socket.emit("connection",{
		type:"connected"
	});

	//클라이언트 -> 서버 connection 이벤트 호출시
	console.log("클라이언트 -> 서버 connection 이벤트 호출시");
	socket.on("connection",function(data){
		if(data.type	==	"join"){

			//방을 생성 및 접속 한다.
			socket.join(data.room);
			console.log("방을 생성한다:"+data.room);

			//클라이언에 자신의 방을 부여한다.
			socket.set('room', data.room);
			console.log("클라이언에 자신의 방을 부여한다.:"+data.room);

			//서버 -> 클라이언트 (자기 자신에게만 메세시를 전달함)
			socket.emit("system",{
				message:"채팅방에 오신 것을 환영합니다."
			});

			//서버 -> 클라이언트  자기 자신을 제외한 나머지사람들에게 system 이벤트를 발생시킨다.
			socket.broadcast.to(data.room).emit("system",{
				message:data.name+"님이 접속하셨습니다."
			});
		}
	});

	//클라이언트 -> 서버 user 이벤트 호출시
	socket.on("user",function(data){
		console.log("클라이언트 -> 서버 user 이벤트 호출시");
		socket.get("room",function(error,room){
			console.log("서버 -> 클라이언트  자기 자신을 제외한 나머지사람들에게 system 이벤트를 발생시킨다.");
			socket.broadcast.to(room).emit("message",data);
		});
	});
	
});