const Team = require('../models/Team');



io.on("connection", (sock) => {
  sock.on("join-room", (teamId, peerId, userName) => {
    try{
      sock.join(teamId);
      sock.to(teamId).emit("user-connected", peerId);
      sock.on("disconnect",()=>{
        sock.to(teamId).emit("user-disconnected", peerId);
      });
      sock.on("message", async (message)=>{
        io.to(teamId).emit("createMessage", message, userName);
        try {
          const team = await Team.findById(teamId).exec();
          team.chat.push({
            user:userName,
            message: message
          });
          team.save();
        }catch(err){
          console.log(`Team not found ${teamId} ${err}`);
        }
      });
    }catch(err) {
      console.log(`Sock error ${err}`);
    }
  });
});