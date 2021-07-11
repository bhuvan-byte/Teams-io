const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const Team = require('../models/Team');
const User = require('../models/User');

// nano id for teams 
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789abcdefghjkmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 4);

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, async (req, res) =>{
  res.render('dashboard', {
    user: req.user,
    teams: req.user.teams
  });
});

// Specific Team
router.get('/dashboard/:teamId',ensureAuthenticated,async function(req, res) {
  try {
    const team = await Team.findOne({ uid: req.params.teamId }).exec();
    res.render('meet',{
      team:team,
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
