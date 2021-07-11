const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  chat: {
    type: Array,
    default: function(){
      let d = new Date();
      return [{user:"BOT",message:`Team created on ${d.toDateString()} ${d.toLocaleTimeString()}`}]
    }  
  }
});

const Team = mongoose.model('Team', TeamSchema);

module.exports = Team;
