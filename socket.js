let io;
module.exports={
    init:(httpServer,config)=>{
        io = require('socket.io')(httpServer,config);
        return io;
    },
    getIO:()=>{
        if(!io){
            throw new Error('Socket.io is not Initialized!')
        }
        return io;
    }
}