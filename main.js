window.onload = ()=>{
	updatePanel();
	
};



function updatePanel(){
	if('geolocation' in navigator) {
		navigator.geolocation.getCurrentPosition((position) => {
		  getNearbyPlanes(position.coords.latitude, position.coords.longitude);
		  showLoadingPanel();
		});
	
	} else {
		console.log("Geolocation is not available...");
	}
}


//Helper functions
function httpGet(theUrl)
{
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
	xmlHttp.send( null );
	return xmlHttp.responseText;
}

function httpGetV2(theUrl){
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
	xmlHttp.send( null );
	return xmlHttp.responseText;
}

function getTodaysDate(){
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();

	today = yyyy + '-' + mm + '-' + dd;
	return today;

}

function sleep(milliseconds) {
	const date = Date.now();
	let currentDate = null;
	do {
		currentDate = Date.now();
	} while (currentDate - date < milliseconds);
}

//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
function getBirdDistance(lon1, lat1, lon2, lat2) 
{
  var R = 6371; // km
  var dLat = toRad(lat2-lat1);
  var dLon = toRad(lon2-lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  return d;
}

// Converts numeric degrees to radians
function toRad(Value) 
{
	return Value * Math.PI / 180;
}





const url = "https://opensky-network.org/api"
let flightDatas = []
let nbFlights = []

let aircraftType = null;
let aircraftAge = null;
let passengerCapacity = null;


function getNearbyPlanes(latitude, longitude){

	const radius = 0.18;


	let lamin = parseFloat(latitude)-parseFloat(radius);
	let lamax = parseFloat(latitude)+parseFloat(radius);
	let lomin = parseFloat(longitude)-parseFloat(radius);
	let lomax = parseFloat(longitude)+parseFloat(radius);

	let path = "/states/all?lamin="+lamin+"&lomin="+lomin+"&lamax="+lamax+"&lomax="+lomax;

	let data = JSON.parse(httpGet(url+path));


	if(data.states == null){
		console.log("No airplane nearby...");
		return;
	}

	
	nbFlights = data.states.length;


	let minDistances = Infinity;
	let idMin = null;
	for(let i=0; i<data.states.length;i++){
		//If the distance between the aircraft and you is smaller than the minimal distance, then it becomes the minimal distance!
		let distanceAircraftYou = getBirdDistance(data.states[i][5],data.states[i][6],longitude, latitude);
		if(distanceAircraftYou<minDistances){
			minDistances = distanceAircraftYou;
			idMin = i;
		}
		
	}


	//Call the details of the closest aircraft :
	console.log("The closest aircraft is ", data.states[idMin]);
	console.log("Because the distance is :",minDistances,"km.");
	//getInformationsAboutFlight(data.states[idMin][1]);
	getInformationsAboutFlight(data.states[idMin][0], data.states[idMin][1]);
	getInformationsAboutAircraft(data.states[idMin][0]);
	


}


function getInformationsAboutFlight(icao24, callsign){
	var xhttp=new XMLHttpRequest();
	xhttp.addEventListener("readystatechange", function () {
		if (this.readyState === this.DONE) {
			if(xhttp.responseText != null){
				findInformations(xhttp.responseText);
			} else{
				console.log("Flight n°" +icao24+" not found.");
			}
		}
	});
	console.log("Trying to get : "+`https://api.allorigins.win/get?url=https://www.radarbox.com/data/flights/`+callsign)
	xhttp.open("GET",`https://api.allorigins.win/get?url=https://www.radarbox.com/data/flights/`+callsign);
	xhttp.send();

}


function findInformations(data){

	data = JSON.parse(data);

	let rawText = data.contents;


	//document.getElementById("hiddenDiv").innerHTML = (data.contents);
	let identifierOfFlight = '<meta property="og:title" content="Follow flight '
	let flightNumber = ((rawText.substr(rawText.indexOf(identifierOfFlight)+(identifierOfFlight.length),100)).split(" "))[0];

	
	let identifierOfDepartureCity = "aporgci";
	let departureCity = (rawText.substr(rawText.indexOf(identifierOfDepartureCity)+identifierOfDepartureCity.length,100).split('"'))[2];

	let identifierOfDepartureCountry = "aporgco";
	let departureCountry = (rawText.substr(rawText.indexOf(identifierOfDepartureCountry)+identifierOfDepartureCountry.length,100).split('"'))[2];
	
	let identifierOfArrivalCity = "apdstci";
	let arrivalCity = (rawText.substr(rawText.indexOf(identifierOfArrivalCity)+identifierOfArrivalCity.length,100).split('"'))[2];


	let identifierOfArrivalCountry = "apdstco";
	let arrivalCountry = (rawText.substr(rawText.indexOf(identifierOfArrivalCountry)+identifierOfArrivalCountry.length,100).split('"'))[2];
	

	console.log("Flight number :",flightNumber, "From",departureCity," to...", arrivalCity);
	console.log(departureCity,"is in ",departureCountry);
	console.log(arrivalCity,"is in ",arrivalCountry);


	let identifierOfAirine = "<title>";
	let airline = (rawText.substr(rawText.indexOf(identifierOfAirine)+identifierOfAirine.length,100).split(' - '))[1];
	console.log("The airline is :",airline);

	let identifierOfDepartureTime = '<div id="actual"><div id="time">';
	let departureTime = (rawText.substr(rawText.indexOf(identifierOfDepartureTime)+identifierOfDepartureTime.length,100).split(">"))[1].substr(0,5);
	if(departureTime[2]!=":"){
		departureTime = "N/A";
	}
	console.log("Departed at",departureTime);

	let identifierOfArrivalTime = '<div id="actual"><div id="time">';
	let newRawText = (rawText.slice(rawText.indexOf(identifierOfDepartureTime)+25));

	let arrivalTime = (newRawText.substr(newRawText.indexOf(identifierOfArrivalTime)+identifierOfArrivalTime.length,100).split(">"))[1].substr(0,5);
	if(arrivalTime[2]!=":"){
		arrivalTime = "N/A";
	}
	console.log("Estimated arrival :",arrivalTime);





	//Actualise tous les champs (sur index.html) : 

	document.getElementById("number").innerHTML = flightNumber;	
	document.getElementById("departure").innerHTML = "From "+ departureCity+", " + departureCountry +" at "+ departureTime;		
	document.getElementById("arrival").innerHTML = "To "+ arrivalCity+", " + arrivalCountry +" at "+ arrivalTime;
	
	console.log("I'm done!!");
	//All Done !

	hideLoadingPanel();
}




function getInformationsAboutAircraft(icao24){
	
	const data = null;

	const xhr = new XMLHttpRequest();
	xhr.withCredentials = true;

	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === this.DONE) {
			pickRightInformationsAboutAircraft(this.responseText);
		}
	});

	xhr.open("GET", "https://aerodatabox.p.rapidapi.com/aircrafts/icao24/"+icao24);
	xhr.setRequestHeader("X-RapidAPI-Key", "800e0bfac8mshb116d4cb2d357a8p1fa69fjsnd8e55f05bcb9");
	xhr.setRequestHeader("X-RapidAPI-Host", "aerodatabox.p.rapidapi.com");
	xhr.setRequestHeader("SameSite","None");
	xhr.setRequestHeader("cross-site-cookie","whatever");
	xhr.send(data);

}



function pickRightInformationsAboutAircraft(data){
	console.log(data);
	data = JSON.parse(data);


	let aircraftModel = data.model;
	let aircraftAge = "N/A";
	try {
		aircraftAge = data.ageYears;
	} catch (error) {
		
	}


	//Refresh infos about aircraft;
	document.getElementById("aircraft").innerHTML = "Model : "+aircraftModel+". It has "+aircraftAge+ " years !";
}




function showLoadingPanel(){
	document.getElementById('loading--info').style.opacity = 1;
	disableScroll();
}

function hideLoadingPanel(){
	document.getElementById('loading--info').style.opacity = 0;
	enableScroll();
}




//Other things

function disableScroll() {
    // Get the current page scroll position
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
  
        // if any scroll is attempted, set this to the previous value
        window.onscroll = function() {
            window.scrollTo(scrollLeft, scrollTop);
        };
}
  
function enableScroll() {
    window.onscroll = function() {};
}
