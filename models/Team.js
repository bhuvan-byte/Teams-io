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
    default: [{
      user: "BOT",
      message: `Team created ${Date.now}`
    }]  
  }
});

const Team = mongoose.model('Team', TeamSchema);

module.exports = Team;
