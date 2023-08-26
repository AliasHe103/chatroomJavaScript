const WebSocket = require('ws');
const wsServer = new WebSocket.Server({ port:3300 });
const clients = new Set();
console.log("setup service......");

wsServer.on("connection",function (ws) {
    console.log("[SERVER] New client connected");
    clients.add(ws);
    ws.on("message",function (message) {
        console.log(`[SERVER] Received: ${message}`);
        const newMessage = `${message}`.split(",");
        if(newMessage[0] === "0"){
            clients.forEach((client)=> {
                if(client.readyState === WebSocket.OPEN){
                    client.send("0,"+`${newMessage[1]}加入了聊天室`);//0：代表用户加入信息
                }
            });
        }
        else if(newMessage[0] === "1"){
            clients.forEach((client)=> {
                if(client.readyState === WebSocket.OPEN){
                    client.send("1,"+`${newMessage[1]}`);//1：代表正常聊天信息
                }
            });
        }
    });
    ws.on("close",()=> {
        console.log("[SEVER] Client disconnected");
        clients.delete(ws);
    });
});
