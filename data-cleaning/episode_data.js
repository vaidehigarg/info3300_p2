var episodes = new Array(27);
for (var i = 0; i < 27; i++) {
  episodes[i] = [];
}

var lines = new Array(27);
for (var i = 0; i < 27; i++) {
  lines[i] = [];
}

var characters = new Array(27);
for (var i = 0; i < 27; i++) {
  characters[i] = [];
}

var locations = new Array(27);
for (var i = 0; i < 27; i++) {
  locations[i] = [];
}

var max_episode_id = new Array(27);
for (var i = 0; i < 27; i++) {
  max_episode_id[i] = [];
}

char_files = [];
loc_files = [];

d3.csv("mod-data/simpsons_episodes.csv", episode_callback);
d3.csv("mod-data/simpsons_script_lines.csv", script_callback);

var parseRow = function (row) {
  return row;
}

function episode_callback (data) {
  data.forEach(function(row) {
    var season = Number(row.season)-1;
    if (season < 27) {
      var episode_id = Number(row.id);
      max_episode_id[season].push(episode_id);
      episodes[season].push({id: episode_id});
    }
  });

  max_episode_id.forEach(function(season, index) {
    max_episode_id[index] = Math.max.apply(null, season);
  });

  episodes.forEach(function(season, season_index) {
    season.forEach(function(episode, episode_index) {
      episode["num_lines"] = 0;
      episode["characters"] = [];
      episode["locations"] = [];
    });
  });

  console.log(episodes);
  console.log(max_episode_id);
}

function script_callback (data) {

  count = 0;

  data.forEach(function(row) {
    speaking_line = row.speaking_line;
    if (speaking_line == "TRUE") {
      episode_id = Number(row.episode_id);
      character_id = Number(row.character_id);
      location_id = Number(row.location_id);
      character_name = String(row.raw_character_text);
      location_name = String(row.raw_location_text);
      
      if (episode_id <= max_episode_id[0]) season_num = 0;
      else if (episode_id <= max_episode_id[1]) season_num = 1;
      else if (episode_id <= max_episode_id[2]) season_num = 2;
      else if (episode_id <= max_episode_id[3]) season_num = 3;
      else if (episode_id <= max_episode_id[4]) season_num = 4;
      else if (episode_id <= max_episode_id[5]) season_num = 5;
      else if (episode_id <= max_episode_id[6]) season_num = 6;
      else if (episode_id <= max_episode_id[7]) season_num = 7;
      else if (episode_id <= max_episode_id[8]) season_num = 8;
      else if (episode_id <= max_episode_id[9]) season_num = 9;
      else if (episode_id <= max_episode_id[10]) season_num = 10;
      else if (episode_id <= max_episode_id[11]) season_num = 11;
      else if (episode_id <= max_episode_id[12]) season_num = 12;
      else if (episode_id <= max_episode_id[13]) season_num = 13;
      else if (episode_id <= max_episode_id[14]) season_num = 14;
      else if (episode_id <= max_episode_id[15]) season_num = 15;
      else if (episode_id <= max_episode_id[16]) season_num = 16;
      else if (episode_id <= max_episode_id[17]) season_num = 17;
      else if (episode_id <= max_episode_id[18]) season_num = 18;
      else if (episode_id <= max_episode_id[19]) season_num = 19;
      else if (episode_id <= max_episode_id[20]) season_num = 20;
      else if (episode_id <= max_episode_id[21]) season_num = 21;
      else if (episode_id <= max_episode_id[22]) season_num = 22;
      else if (episode_id <= max_episode_id[23]) season_num = 23;
      else if (episode_id <= max_episode_id[24]) season_num = 24;
      else if (episode_id <= max_episode_id[25]) season_num = 25;
      else season_num = 26;

      //data for season 27 is garbage/nonexistent
      if (season_num < 26) {
        // console.log(season_num);
        if (season_num == 0) {
          episode = episodes[season_num][episode_id-1];
        }
        else {
          episode_id = episode_id - max_episode_id[season_num-1];
          episode = episodes[season_num][episode_id-1];
        }
        // console.log(episode);
        episode["num_lines"]++;
        episode["characters"].push(character_name);
        episode["locations"].push(location_name);
      }
    }
  });

  episodes.forEach(function(season, season_index){
    season.forEach(function(episode, episode_index){
      episode.character_single = [];
      episode.character_count = [];
      episode.location_single = [];
      episode.location_count = [];
      episode.character_data = [];
      episode.location_data = [];

      episode.characters.forEach(function(character){
        // console.log(character);
        if (episode.character_single.indexOf(character) == -1) {
          episode.character_single.push(character);
          episode.character_count.push(1);
        }
        else {
          index = episode.character_single.indexOf(character);
          episode.character_count[index]++;
        }
      });

      episode.locations.forEach(function(loc){
        // console.log(character);
        if (episode.location_single.indexOf(loc) == -1) {
          episode.location_single.push(loc);
          episode.location_count.push(1);
        }
        else {
          index = episode.location_single.indexOf(loc);
          episode.location_count[index]++;
        }
      });

      episode.location_single.forEach(function(loc, index){
        count = episode.location_count[index];
        episode.location_data.push({name:loc, count:count});
      });

      episode.character_single.forEach(function(character, index){
        count = episode.character_count[index];
        episode.character_data.push({name:character, count:count});
      });

      if (episode.character_data.length != 0) {
        var character_json = sortResults(episode.character_data, "count", false);
        // console.log(character_json);
        var fields = Object.keys(character_json[0]);
        // console.log(fields);
        var replacer = function(key, value) { return value === null ? '' : value } 
        var csv = character_json.map(function(row){
          return fields.map(function(fieldName){
            return JSON.stringify(row[fieldName], replacer)
          }).join(',');
        });
        csv.unshift(fields.join(',')); // add header column
        csv_data = csv.join('\r\n');
        filename = "s" + (season_index+1) + "e" + (episode_index+1);
        console.log(filename);
        console.log(csv_data);
        char_files.push(exportToCsvFile(csv_data, filename));
      }

      if (episode.location_data.length != 0) {
        var location_json = sortResults(episode.location_data, "count", false);
        // console.log(location_json);
        var fields = Object.keys(location_json[0]);
        // console.log(fields);
        var replacer = function(key, value) { return value === null ? '' : value } 
        var csv = location_json.map(function(row){
          return fields.map(function(fieldName){
            return JSON.stringify(row[fieldName], replacer)
          }).join(',');
        });
        csv.unshift(fields.join(',')); // add header column
        csv_data = csv.join('\r\n');
        filename = "s" + (season_index+1) + "e" + (episode_index+1) + "-loc";
        console.log(filename);
        console.log(csv_data);
        loc_files.push(exportToCsvFile(csv_data, filename));
      }
    });
  });
  // console.log(files);
  console.log(episodes);
  $('a.download-csv').on('click', function(){
    downloadAll(char_files);
  });
}

/* Function to sort JSON by value, from https://stackoverflow.com/questions/881510/sorting-json-by-values */
function sortResults(json, prop, ascending) {
  var newjson = json.sort(function(a, b) {
      if (ascending) {
          return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
      } else {
          return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
      }
  });
  return newjson;
}

function exportToCsvFile(csvData, fileName) {
  var dataStr = csvData;
  var dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  var exportFileDefaultName = fileName + '.csv';
  
  // let linkElement = document.createElement('a');
  // linkElement.setAttribute('href', dataUri);
  // linkElement.setAttribute('download', exportFileDefaultName);
  // linkElement.click();
  return [exportFileDefaultName, dataUri];
}

function downloadAll(files){
  if(files.length == 0) return;

  file = files.pop();
  var theAnchor = $('<a />')
      .attr('href', file[1])
      .attr('download',file[0])
      // Firefox does not fires click if the link is outside
      // the DOM
      .appendTo('body');
  
  theAnchor[0].click(); 
  theAnchor.remove();
  downloadAll(files);
}