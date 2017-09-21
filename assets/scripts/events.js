(function(app) {
  var eventFile = {
      "levelUp": "levelup",
      "heroDeath": "kill",
      "siegeCampTaken": "siege",
      "bruiserCampTaken": "bruiser",
      "buildingDestroyed": "tower",
      "dragonActivated": "dragon",
      "shipActivated": "pirate",
      "shrineCapture": "punisher",
      "curseUp": "curse",
      "terrorActivated": "terror",
      "altarCaptured": "shrine",
      "fortCaptured": "fort",
      "tributeCollected": "tribute",
      "soulEaterSpawned": "spider",
      "bossTaken": "boss",
      "punisherKilled": "punisherdead",
      "immortalDefeated": "immortal"
  };

  var friendlyNames = {
    "levelUp": "Level Up",
    "level": "Level",
    "heroDeath": "Hero Death",
    "siegeCampTaken": "Siege Captured",
    "bruiserCampTaken": "Bruiser Captured",
    "buildingDestroyed": "Building Destroyed",
    "dragonActivated": "Dragon Activated",
    "shipActivated": "Pirate Ship Activated",
    "shrineCapture": "Punisher Activated",
    "curseUp": "Curse Activated",
    "terrorActivated": "Terror Activated",
    "altarCaptured": "Altar Captured",
    "fortCaptured": "Fort Captured",
    "tributeCollected": "Tribute Collected",
    "soulEaterSpawned": "Spider Activated",
    "bossTaken": "Boss Taken",
    "punisherKilled": "Punisher Destroyed",
    "immortalDefeated": "Immortal Spawned",
    "soloDeath": "Solo Death?",
    "unitName": "Name",
    "seconds": "Seconds into game",
    "team": "Team",
    "skullCount": "Skulls Collected",
    "opponentScore": "Opponent Score",
    "teamScore": "Team Score",
    "power": "Shield Power",
    "shots": "Shots fired",
    "heroDmg": "Dmg. to Heroes",
    "type": "Punisher Type",
    "buildingDmg": "Dmg. to Buildings",
    "teamGems": "Team Gems",
    "opponentGems": "Opponent Gems",
    "event": "Event",
    "true": "Yes",
    "false": "No",
    "TownCannonTowerDead": "Tower",
    "TownCannonTowerL2": "Tower",
    "TownCannonTowerL2Standalone": "Tower",
    "TownCannonTowerL3": "Tower",
    "TownCannonTowerL3Standalone": "Tower",
    "TownTownHallL2": "Fort",
    "TownTownHallL3": "Fort",
    "KingsCore": "Core"
  };

  var constants = {
    'buildingDestroyed': 'buildingDestroyed',
    'core' : 'KingsCore',
    'heroDeath': 'heroDeath',
    'levelUp': 'levelUp'
  }

  app.events = {
    constants:  constants,
    friendlyNames: function(arg) { return friendlyNames[arg]; },
    fileName: function(prefix, name, color) {
      if (!eventFile[name]) {
        debugger;
      }
      var path = 'css/images/' + prefix + eventFile[name];
      path += color ? "_" + color : "";
      path += '.svg';
      return path;
    }
  };
})(window.app || (window.app = {}));
