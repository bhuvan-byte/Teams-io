const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const Team = require('../models/Team');
const User = require('../models/User');
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
    const team = await Team.findById(req.params.teamId);
    res.render('meet',{team:team,layout:false});
  }catch(err) {
    console.log(`error ${err}`);
    res.send(err);
  }
});

// Add team
router.post('/create', ensureAuthenticated, (req,res)=>{
  const newTeam = new Team({
    name: req.body.teamName
  });
  newTeam.save().then((team)=>{console.log(team,"added")}).catch((err)=>{console.log(err)});
  req.user.teams.push({id:newTeam._id,name:req.body.teamName});
  req.user.save().then((user)=>{console.log(user.teams)}).catch(err=> console.log(err));
  res.redirect('/dashboard');
});
router.post('/join', ensureAuthenticated, async (req,res)=>{
  try {
    const team = await Team.findById(req.body.teamId);
    req.user.teams.push({id:team._id,name:team.name});
    req.user.save().then((user)=>{console.log(user.teams)}).catch(err=> console.log(err));
    res.redirect('/dashboard');
  }catch (error) {
    // Todo error handling: Display error to client
    console.log(`Join team: ${error}`);
    res.redirect('/dashboard');
  }
});

module.exports = router;
