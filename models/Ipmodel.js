const mongoose = require('mongoose');

const IpmodelSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true
  },
  users: {
    type: Array,
    default: []
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Ipmodel = mongoose.model('Ipmodel', IpmodelSchema);

module.exports = Ipmodel;
