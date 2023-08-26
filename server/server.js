const WebSocket = require('ws');
const fileSystem = require('fs');
const wsServer = new WebSocket.Server({ port:3300 });
const clients = new Set();
console.log("setup service......");
wsServer.on("connection",function (ws) {
    ws.on("message",function (message) {
        console.log(`[SERVER] Received: ${message}`);
        const newMessage = `${message}`.split(",");
        if(newMessage[0] === "0"){//0：代表用户加入信息
            console.log("[SERVER] New client connected");
            clients.add(ws);
            const account =newMessage[1];
            let nickname = '';
            fileSystem.readFile("./nickname.ini","utf8",function (err,data) {
                let strs = data.split(",");
                console.log(strs);
                for(let str of strs) {
                    if(str.includes(account)) {
                        str = str.split(":");
                        nickname = str[1];
                        ws.send(`-1,${nickname}`);
                        clients.forEach((client)=> {
                            if(client.readyState === WebSocket.OPEN){
                                client.send("0,"+`${nickname}加入了聊天室`);
                            }
                        });
                        break;
                    }
                }
            });
        }
        else if(newMessage[0] === "1"){//1：代表正常聊天信息
            clients.forEach((client)=> {
                if(client.readyState === WebSocket.OPEN){
                    client.send("1,"+`${newMessage[1]}`);
                }
            });
        }
        else if(newMessage[0] === "2"){
            //2：代表用户注册请求，先要判断账号是否已经被注册过
            fileSystem.readFile("./userList.ini","utf8",function (err,data) {
                if(data.includes(`account:${newMessage[1]}`)){
                    ws.send("0,已经存在该账号");//对于客户端，0代表注册类消息
                    console.log("已经存在该账号");
                }
                else{
                    const userMessage = `[account:${newMessage[1]} password:${newMessage[2]}] `;
                    fileSystem.appendFile("./userList.ini",userMessage,function () {
                        ws.send("0,新用户注册成功");
                        console.log("新用户注册成功");
                    });
                    fileSystem.readFile("./nickname.ini",
                        "utf8", function (error,nicknameData){
                        let randomData = `${Math.floor(Math.random() * 10000)}`;
                        while(nicknameData.includes("用户" + randomData)) {
                            randomData += Math.floor(Math.random() * 100);
                        }
                        const appendData = `${newMessage[1]}:用户${randomData},`;
                        fileSystem.appendFile("./nickname.ini",appendData,()=>{
                            console.log(appendData);
                        });
                    });

                }
            });
        }
        else if(newMessage[0] === "3"){//3：代表用户登录请求
            //验证账号是否正确->验证密码是否正确->返回结果给用户
            fileSystem.readFile("./userList.ini","utf8",function (err,data) {
                if(data.includes(`account:${newMessage[1]}`)){//如果账号正确
                    if(data.includes(`account:${newMessage[1]} password:${newMessage[2]}`)){//如果密码也正确
                        ws.send("1,用户登录成功");//对于客户端，1代表登录类消息
                    }
                    else{//如果密码不正确
                        ws.send("1,密码不正确");
                    }
                }
                else{//如果账号不正确
                    ws.send("1,账号不正确");
                }
            });
        }
        else if(newMessage[0] === "4"){//4：代表用户修改昵称请求
            const nameMessage = newMessage[1].split(":");
            fileSystem.readFile("./nickname.ini","utf8",function (err,data) {
                let index = data.indexOf(nameMessage[0]);//找到账号出现位置
                let currentMessage = '';
                while(data[index] !== ',') currentMessage += data[index++];
                data = data.replace(currentMessage,newMessage[1]);
                console.log(currentMessage);
                console.log(newMessage[1]);
                console.log(data);
                fileSystem.writeFile("./nickname.ini",data,"utf8",()=>{
                    ws.send(`2,昵称修改为:${nameMessage[1]}`);
                });
            });
        }
    });
    ws.on("close",()=> {
        console.log("[SEVER] Client disconnected");
        clients.delete(ws);
    });
});
