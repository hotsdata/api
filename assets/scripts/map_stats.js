(function(app){
  app.mapInfo = function(mapName, width) {
    // factor = height / width
    var factors = {
      "Towers of Doom": 0.727078891,
      "Blackheart's Bay": 0.674804688,
      "Tomb of the Spider Queen": 0.574729597,
      "Infernal Shrines": 0.75,
      "Battlefield of Eternity": 0.631010795,
      "Sky Temple": 0.753694581,
      "Garden of Terror": 0.615228426,
      "Dragon Shire": 0.697959184,
      "Cursed Hollow": 0.664763882,
      "Haunted Mines": 0.454959514,
      "Lost Cavern": 0.398333333,
    };

    var maps = {
      "Towers of Doom": {
          "margins": [[-43, 71], [0.054 * (width * factors["Towers of Doom"]), -0.094 * (width * factors["Towers of Doom"])]],
          "core": [[47, 94], [201, 94]],
          "mapSize": [256, 216],
          "factor": factors["Towers of Doom"],
          "image": "css/images/Towers-of-doom.jpg"
      },
      "Blackheart's Bay": {
          "margins": [[-15, 25], [0.152 * (width * factors["Blackheart's Bay"]), -0.1 * (width * factors["Blackheart's Bay"])]],
          "core": [[208, 103], [46, 103]],
          "mapSize": [256, 232],
          "factor": factors["Blackheart's Bay"],
          "image": "css/images/Blackhearts-bay.jpg"
      },
      "Tomb of the Spider Queen": {
          "margins": [[-18, 27], [(width * factors["Tomb of the Spider Queen"]) * 0.204, -0.255 * (width * factors["Tomb of the Spider Queen"])]],
          "core": [[46, 116], [202, 116]],
          "mapSize": [248, 216],
          "factor": factors["Tomb of the Spider Queen"],
          "image": "css/images/Tomb-of-the-spider-queen.jpg"
      },
      "Infernal Shrines": {
          "margins": [[18, -1], [(width * factors["Infernal Shrines"]) * 0.00130208333333, (width * factors["Infernal Shrines"]) * 0.01692708333333]],
          "core": [[40, 93], [208, 93]],
          "mapSize": [248, 208],
          "factor": factors["Infernal Shrines"],
          "image": "css/images/Infernal-Shrines.jpg"
      },
      "Battlefield of Eternity": {
          "margins": [[-29, 25], [(width * factors["Battlefield of Eternity"]) * 0.124, -0.115 * (width * factors["Battlefield of Eternity"])]],
          "core": [[49, 100], [199, 108]],
          "mapSize": [248, 208],
          "factor": factors["Battlefield of Eternity"],
          "image": "css/images/Battlefield-of-eternity.jpg"
      },
      "Sky Temple": {
          "margins": [[-0.009765625 * width, 0.009765625 * width], [(width * factors["Sky Temple"]) * 0.02591401143791, -0.11661305147059 * (width * factors["Sky Temple"])]],
          "core": [[45, 116], [203, 116]],
          "mapSize": [248, 232],
          "factor": factors["Sky Temple"],
          "image": "css/images/Sky-temple.jpg"
      },
      "Garden of Terror": {
          "margins": [[-0.02734375 * width, 0.05859375 * width], [(width * factors["Garden of Terror"]) * 0.1857142857, -0.1555555556 * (width * factors["Garden of Terror"])]],
          "core": [[43, 104], [205, 112]],
          "mapSize": [256, 216],
          "factor": factors["Garden of Terror"],
          "image": "css/images/Garden-of-terror.jpg"
      },
      "Dragon Shire": {
          "margins": [[-0.029296875 * width, -0.0556640625 * width], [0.06016510424 * (factors["Dragon Shire"] * width), -0.06296348118 * (factors["Dragon Shire"] * width)]],
          "core": [[46, 92], [202, 92]],
          "mapSize": [228, 208],
          "factor": factors["Dragon Shire"],
          "image": "css/images/Dragon-shire.jpg"
      },
      "Cursed Hollow": {
          "margins": [[-0.009765625 * width, 0.0556640625 * width], [0.1028353166 * (width * factors["Cursed Hollow"]), -0.1175260761 * (factors["Cursed Hollow"] * width)]],
          "core": [[43, 103], [205, 113]],
          "mapSize": [256, 216],
          "factor": factors["Cursed Hollow"],
          "image": "css/images/Cursed-hollow.jpg"
      },
      "Haunted Mines": {
          "margins": [[-0.033203125 * width, 0.0361328125 * width], [0.8586086247 * (factors["Haunted Mines"] * width), -0.02146521562 * (factors["Haunted Mines"] * width)]],
          "core": [[48, 183], [208, 183]],
          "mapSize": [256, 256],
          "factor": factors["Haunted Mines"],
          "image": "css/images/Haunted-mines.jpg"
      },
      "Lost Cavern": {
          "margins": [[0, 0], [0.5135855609 * (width * factors["Lost Cavern"]), -0.4891291056 * (width * factors["Lost Cavern"])]],
          "core": [[52, 108], [196, 108]],
          "mapSize": [248, 216],
          "factor": factors["Lost Cavern"],
          "image": "css/images/aram-map.png"
      }
    };
    return maps[mapName];
  };
})(window.app || (window.app = {}));
