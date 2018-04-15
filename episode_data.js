var episodes;
var lines = new Array(27);
for(var i = 0; i < lines.length; i++){
  lines[i] = [];
}

var characters = new Array(27);
for(var i = 0; i < characters.length; i++){
  characters[i] = [];
}

var locations = new Array(27);
for(var i = 0; i < locations.length; i++){
  locations[i] = [];
}

d3.queue()
.defer(d3.csv, "mod-data/simpsons_episodes.csv", parseRow)
.awaitAll(v2callback); //fetch 27 episodes

d3.queue()
.defer(d3.csv, "mod-data/simpsons_script_lines.csv", parseRow)
.awaitAll(linesCallback); //get the lines, need these for data on characters/locations

d3.queue()
.defer(d3.csv, "mod-data/simpsons_characters.csv", parseRow)
.awaitAll(charactersCallback);

d3.queue()
.defer(d3.csv, "mod-data/simpsons_locations.csv", parseRow)
.awaitAll(locationsCallback);

//code below takes info for the season 1 episode; extension to more episodes to come
var male = 0 ;
var female = 0;
var unlabled = 0;
var occurrence; //i can't think of a good name for this rigth now
characters[0].forEach(function(character){//each character is in once per spoken line
!character['gender']  ? unlabled++ : (character['gender'] == 'm' ? male++ : female++);
!occurrence[character['name']] ? occurrence[character['name']] = 1 : occurrence[character['name']]++;
});

var names = [];
for(var char in occurrence) {names.push(char);}
names.sort(function(a,b){return occurrence[b]-occurrence[a]});

var locationOccurrence;
locations[0].forEach(function(location){
!locationOccurrence[location['name']] ? locationOccurrence[location['name']] = 1 : locationOccurrence[location['name']]++;
});

var locs = [];
for(var loc in locationOccurrence) {locs.push(loc);}
locs.sort(function(a,b){return locationOccurrence[b]-locationOccurrence[a]});



function v2callback(error, data){
  if (error) { console.log(error); }
  var topEpisodes = [];
  var seasonBuffer = [];
  var svg = d3.select("#episode-analysis");
  data.forEach(function(row){//this works because the data is sorted by season, ie each season comes in a block
    if(seasonBuffer.length == 0){ //makes sure there is always an episode to look at
      seasonBuffer.push(row);
      return;
    }
    if(row['season'] != seasonBuffer[0]['season']){ //if the current episode is a new season, find most watched episode and push it
      seasonBuffer.sort(function(a,b){return b['us_viewers_in_millions'] - a['us_viewers_in_millions']});
      console.log(seasonBuffer);
      topEpisodes.push(seasonBuffer[0]);
      seasonBuffer.length = 0;
    }
    else{
      seasonBuffer.push(row);
    }
  });

  episodes = topEpisodes;

}

function linesCallback(error, data){
data.forEach(function(row){
  episodes.forEach(function(episode, index){
    if(row['episode_id'] == episode['id']){
      consle.log("a");
      lines[episode['season']].push(row); //get every line assigned to its episode separating them by season
    }
  });
});
  console.log(lines);
}

function charactersCallback(error, data){
//console.log(lines);
data.forEach(function(row){
  lines.forEach(function(episode, index){//lines is an array of arrays, each of which represents one episode
//    console.log(episode);
    episode.forEach(function(line){
    //  console.log(line);
      if(row['id']==line['character_id']){
        characters[episode['season']].push(row);
      }
    //  console.log("a");
    });
  });
});
//  console.log(characters);
}

function locationsCallback(error, data){
data.forEach(function(row){
  lines.forEach(function(episode, index){
    episode.forEach(function(line){
      if(row['id'] == line['location_id']){
        locations[episode['season']].push(row);
      }
    });
  });
});
//console.log(locations);
}