const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const Team = require('../models/Team');
const User = require('../models/User');
const Ipmodel = require('../models/Ipmodel');

// nano id for teams 
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789abcdefghjkmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 4);

// Welcome Page
router.get('/', forwardAuthenticated, async (req, res) => {
  let client_ip;
  try{
    client_ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress ;
    let ip =await Ipmodel.findOne({ip:client_ip}).exec();
    if(!ip) ip = Ipmodel({ip:client_ip});
    ip.save();
  }catch(err) {console.log(`warning: failed store ${client_ip} ${err}`);}
  res.render('welcome');
});

// Dashboard
router.get('/dashboard', ensureAuthenticated, async (req, res) =>{
  let client_ip;
  try{
    client_ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress ;
    let ip =await Ipmodel.findOne({ip:client_ip}).exec();
    if(!ip) ip = Ipmodel({ip:client_ip});
    ip.users.push(req.user._id);
    ip.save();
  }catch(err) {console.log(`warning: failed store ${client_ip} ${err}`);}
  res.render('dashboard', {
    user: req.user,
    teams: req.user.teams
  });
});

// Specific Team
router.get('/dashboard/:teamId',ensureAuthenticated,async function(req, res) {
  try {
    const team = await Team.findOne({ uid: req.params.teamId }).exec();
    let chats = [];
    for(let chat of team.chat){
      let mchat = {...chat};
      if(mchat.user == req.user.name) mchat.user = "me";
      chats.push(mchat);
    }
    res.render('meet',{
      team:team,
      chats:chats,
      layout:false,
      user: req.user.name
    });
  }catch(err) {
    console.log(`error ${err}`);
    res.send(err);
  }
});

// Add team
router.post('/create', ensureAuthenticated,async (req,res)=>{
  try {
    const newTeam = new Team({
      name: req.body.teamName,
      uid: nanoid() 
    });
    await newTeam.save();
    req.user.teams.push({id:newTeam.uid,name:req.body.teamName});
    req.user.save();
  }catch (err) {
    console.log(`Team ${req.body.teamName} not added ${err}`);
  }
  res.redirect('/dashboard'); 
});
router.post('/join', ensureAuthenticated, async (req,res)=>{
  try {
    const team = await Team.findOne({ uid: req.body.teamId }).exec();
    if(!team) res.redirect('/dashboard');
    req.user.teams.push({id:team.uid,name:team.name});
    await req.user.save();
    res.redirect('/dashboard');
  }catch (error) {
    // Todo error handling: Display error to client
    console.log(`Join team: ${error}`);
    res.redirect('/dashboard');
  }
});

module.exports = router;
