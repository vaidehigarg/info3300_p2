var svg = d3.select("#season-graph");
var episodeTitle = d3.select(".ep-title-div");
var episodeImage = d3.select(".ep-image-div");
var episodeLink = d3.select(".ep-link-div");

var width = 800;
var height = 500;
var padding = 75;

var slideContainer = d3.select(".slidecontainer");
var seasonSlider = document.getElementById("season-slider");
var previousEp = document.getElementById("previous");
var nextEp = document.getElementById("next");

/* season variable, controlled by slider */
var season = 1;

/* episode variable, controlled by buttons */
var episode = 1;

/* import data */
d3.queue()
.defer(d3.csv, "mod-data/simpsons_episodes.csv", parseRow)
.await(callback);

var parseRow = function (row) {
  return row;
}

ratings = [];
viewership = [];
episodes = [];
seasons = [];

function callback (error, data) {

  if (error) { console.log(error); }
  console.log(data);

  for (var i=0; i<27; i++) {
    ratings.push([]);
    viewership.push([]);
    episodes.push([]);
    seasons.push([]);
  }

  data.forEach(function(d, i) {
    season_num = d.season;

    if (season_num < 28) {
      ratings[season_num-1].push(Number(d.imdb_rating));
      viewership[season_num-1].push(Number(d.us_viewers_in_millions));
      episodes[season_num-1].push(Number(d.number_in_season));
      seasons[season_num-1].push(d);
    }
  });

  console.log(ratings);
  console.log(viewership);
  console.log(episodes);
  console.log(seasons);

  var xScale = d3.scaleLinear();
  var yRatingScale = d3.scaleLinear();
  var yViewsScale = d3.scaleLinear();

  var xAxis = d3.axisBottom();
  var yRatingAxis = d3.axisLeft();
  var yViewsAxis = d3.axisRight();

  setScale();
  initAxis();
  initGraph();

  seasonSlider.oninput = function () {
    season = Number(seasonSlider.value);
    episode = 1;
    setScale();
    drawAxis();
    drawGraph();
  };

  previousEp.onclick = function () {
    if (episode == 1) {
      episode = 1;
    } else {
      episode = episode - 1;
      console.log("Next Episode: " + episode);
      updateEpisode();
    }
  };

  nextEp.onclick = function () {
    if (episode == Math.max.apply(null, episodes[season-1])) {
      episode = Math.max.apply(null, episodes[season-1]);
    } else {
      episode = episode + 1;
      console.log("Previous Episode: " + episode);
      updateEpisode();
    }
  };

  function setScale() {
    xScale.domain(d3.extent(episodes[season-1])).range([padding,width-padding]);
    // yRatingScale.domain([0,10]).range([height-padding,2*padding]);
    // yViewsScale.domain([0,35]).range([height-padding,2*padding]);
    yRatingScale
    .domain([d3.extent(ratings[season-1])[0]-0.1, d3.extent(ratings[season-1])[1]])
    .range([height-padding,1.25*padding]);

    yViewsScale
    .domain([d3.extent(viewership[season-1])[0], d3.extent(viewership[season-1])[1]])
    .range([height-padding,1.25*padding]);

    xAxis.scale(xScale).ticks(episodes[season-1].length);
    yRatingAxis.scale(yRatingScale);
    yViewsAxis.scale(yViewsScale);
  } // end setScale

  function initAxis() {
    svg.append("g")
      .attr("class", "x axis")
      .style("font-size", "16px")
      .style("font-family", "Gaegu, sans-serif")
      .attr("transform", "translate(" + 0 + "," + (height-padding) + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .style("font-size", "16px")
      .style("font-family", "Gaegu, sans-serif")
      .attr("transform", "translate(" + padding + "," + 0 + ")")
      .call(yRatingAxis);

    svg.append("g")
      .attr("class", "z axis")
      .style("font-size", "16px")
      .style("font-family", "Gaegu, sans-serif")
      .attr("transform", "translate(" + (width-padding) + "," + 0 + ")")
      .call(yViewsAxis);

    /* Add x-axis label */
    svg.append("text")
      .text("Episode #")
      .style("text-anchor", "middle")
      .attr("x", "50%")
      .attr("y", "95%")
      .attr("font-size", 24)
      .attr("font-family", "Gaegu, sans-serif");

    /* Add y-axis-rating label */
    svg.append("text")
      .text("IMDb Rating (# stars)")
      .style("text-anchor", "middle")
      .attr("x", padding/2.5)
      .attr("y", height/2)
      .attr("transform", "rotate (" + 270 + "," + padding/2.5 + "," + height/2 + ")")
      .style("font-size", 24)
      .style("font-family", "Gaegu, sans-serif")
      .style("fill", "rgb(232,70,28)");

    /* Add y-axis-viewership label */
    svg.append("text")
      .text("US Viewership (millions)")
      .style("text-anchor", "middle")
      .attr("x", width-padding/3.5)
      .attr("y", height/2)
      .attr("transform", "rotate (" + 270 + "," + (width-padding/3.5) + "," + (height/2) + ")")
      .style("font-size", 24)
      .style("font-family", "Gaegu, sans-serif")
      .style("fill", "rgb(30,103,180)");
  } // end initAxis

  function drawAxis() {
    var t = d3.transition()
    .duration(500)

    var x = svg.selectAll(".x")
    .data(["dummy"]);

    var newX = x.enter().append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(" + 0 + "," + (height-padding) + ")");

    x.merge(newX).transition(t).call(xAxis);

    var y = svg.selectAll(".y")
    .data(["dummy"]);

    var newRating = y.enter().append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + padding + "," + 0 + ")");

    y.merge(newRating).transition(t).call(yRatingAxis);

    var z = svg.selectAll(".z")
    .data(["dummy"]);

    var newViews = z.enter().append("g")
    .attr("class", "z axis")
    .attr("transform", "translate(" + (width-padding) + "," + 0 + ")");

    z.merge(newViews).transition(t).call(yViewsAxis);
  } //end drawAxis

  function initGraph() {
    svg.append("text")
      .attr("id", "season-number")
      .attr("x", "50%")
      .attr("y", "10%")
      .attr("text-anchor", "middle")
      .text("Episode Viewership and Rating: Season " + String(season));

    var ratingLineGenerator = d3.line()
    .x(d => xScale(d.number_in_season))
    .y(d => yRatingScale(d.imdb_rating))
    .curve(d3.curveCardinal);

    var viewLineGenerator = d3.line()
    .x(d => xScale(d.number_in_season))
    .y(d => yViewsScale(d.us_viewers_in_millions))
    .curve(d3.curveCardinal);

    var ratingLine = svg.append("path")
    .attr("id", "ratings")
    .attr("d", ratingLineGenerator(seasons[season-1]))
    .style("stroke", "rgb(232,70,28)")
    .style("stroke-width", 2)
    .style("fill", "none");

    var viewLine = svg.append("path")
    .attr("id", "views")
    .attr("d", viewLineGenerator(seasons[season-1]))
    .style("stroke", "rgb(30,103,180)")
    .style("stroke-width", 2)
    .style("fill", "none");

    // slideContainer.append("text")
    //   .attr("id", "season-number")
    //   .attr("x", "50%")
    //   .attr("y", "10%")
    //   .attr("text-anchor", "middle")
    //   .text("Slide to pick a season (1-27)");

    // initCircles();

    function initCircles() {
      var circles1 = svg.selectAll("ratings_circles").data(seasons[season-1]);
      var addedCircles1 = circles1.enter().append("circle");
      var mergedCircles1 = addedCircles1.merge(circles1);

      var circles2 = svg.selectAll("views_circles").data(seasons[season-1]);
      var addedCircles2 = circles2.enter().append("circle");
      var mergedCircles2 = addedCircles2.merge(circles2);

      mergedCircles1
      .attr("id", "ratings_points")
      .attr("cx", function (d) { return xScale(d.number_in_season) })
      .attr("cy", function (d) { return yRatingScale(d.imdb_rating) })
      .attr("r", 3)
      .style("fill", "rgb(232,70,28)");

      mergedCircles2
      .attr("id", "views_points")
      .attr("cx", function (d) { return xScale(d.number_in_season) })
      .attr("cy", function (d) { return yViewsScale(d.us_viewers_in_millions) })
      .attr("r", 3)
      .style("fill", "rgb(30,103,180)");
    } // end initCircles

    initEpisode();
  } // end initGraph

  function drawGraph() {
    var t = d3.transition()
    .duration(500)

    svg.select("#season-number")
    .text("Episode Viewership and Rating: Season " + String(season))
    .transition(t);

    var ratingLineGenerator = d3.line()
    .x(d => xScale(d.number_in_season))
    .y(d => yRatingScale(d.imdb_rating))
    .curve(d3.curveCardinal);

    var viewLineGenerator = d3.line()
    .x(d => xScale(d.number_in_season))
    .y(d => yViewsScale(d.us_viewers_in_millions))
    .curve(d3.curveCardinal);

    var newRatingLine = svg.selectAll("#ratings").transition(t)
    .attr("id", "ratings")
    .attr("d", ratingLineGenerator(seasons[season-1]))
    .style("stroke", "rgb(232,70,28)")
    .style("stroke-width", 2)
    .style("fill", "none");

    var newViewLine = svg.selectAll("#views").transition(t)
    .attr("id", "views")
    .attr("d", viewLineGenerator(seasons[season-1]))
    .style("stroke", "rgb(30,103,180)")
    .style("stroke-width", 2)
    .style("fill", "none");

    // d3.queue
    // .defer(removeCircles)
    // .await(updateCircles)

    // removeCircles();
    // updateCircles();

    function removeCircles() {
      svg.selectAll("#ratings_points").remove();
      svg.selectAll("#views_points").remove();
    } // end removeCircles
    
    function updateCircles() {
      var circles1 = svg.selectAll("ratings_circles").data(seasons[season-1]);
      var addedCircles1 = circles1.enter().append("circle");
      var mergedCircles1 = addedCircles1.merge(circles1);

      var circles2 = svg.selectAll("views_circles").data(seasons[season-1]);
      var addedCircles2 = circles2.enter().append("circle");
      var mergedCircles2 = addedCircles2.merge(circles2);

      mergedCircles1.data(seasons[season-1])
      .transition()
      .duration(0)
      .delay(400)
      .attr("id", "ratings_points")
      .attr("cx", function (d) { return xScale(d.number_in_season) })
      .attr("cy", function (d) { return yRatingScale(d.imdb_rating) })
      .attr("r", 3)
      .style("fill", "rgb(232,70,28)");

      mergedCircles2.data(seasons[season-1])
      .transition()
      .duration(0)
      .delay(400)
      .attr("id", "views_points")
      .attr("cx", function (d) { return xScale(d.number_in_season) })
      .attr("cy", function (d) { return yViewsScale(d.us_viewers_in_millions) })
      .attr("r", 3)
      .style("fill", "rgb(30,103,180)");
    } // end updateCircles

    updateEpisode();
  } // end drawgraph

  function initEpisode() {
    episodeTitle.append("text")
      .attr("x", "50%")
      .attr("y", "10%")
      .attr("text-anchor", "middle")
      .attr("id", "ep-title")
      .style("font-size", "32px")
      .text("Season " + season + ", Ep " + episode + ": " + seasons[season-1][episode-1].title);

    episodeImage.append("img")
      .attr("src", seasons[season-1][episode-1].image_url)
      .attr("width", "750px")
      .attr("id", "ep-image");

    // episodeLink.append("text")
    //   .attr("x", "50%")
    //   .attr("y", "10%")
    //   .attr("text-anchor", "middle")
    //   .attr("id", "ep-link")
    //   .style("font-size", "24px")
    //   .text(seasons[season-1][episode-1].video_url);

    episodeLink.append("a")
      .attr("href", seasons[season-1][episode-1].video_url)
      .attr("id", "ep-link-link")
      .append("text")
        .attr("x", "50%")
        .attr("y", "10%")
        .attr("text-anchor", "middle")
        .attr("id", "ep-link-text")
        .style("font-size", "24px")
        .text(seasons[season-1][episode-1].video_url);

  }

  function updateEpisode() {
    episodeTitle.select("#ep-title")
      .text("Season " + season + ", Ep " + episode + ": " + seasons[season-1][episode-1].title);

    episodeImage.select("#ep-image")
      .attr("src", seasons[season-1][episode-1].image_url);

    episodeLink.select("#ep-link-link")
      .attr("href", seasons[season-1][episode-1].video_url);

    episodeLink.select("#ep-link-text")
      .text(seasons[season-1][episode-1].video_url);
  }
} // end callback