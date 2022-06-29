window.onload = ()=>{
	updatePanel();
};



function updatePanel(){
	if('geolocation' in navigator) {
		navigator.geolocation.getCurrentPosition((position) => {
		  getNearbyPlanes(position.coords.latitude, position.coords.longitude);
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

let departure = null;
let arrival = null;
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


	console.log(data.states);

	if(data.states == null){
		console.log("No airplane nearby...");
		return;
	}
	document.getElementById('textContainer').innerHTML = data.states;

	
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
	console.log("The closest aircraft is ", data.states[idMin])

	//getInformationsAboutFlight(data.states[idMin][1]);
	getInformationsAboutFlight(data.states[idMin][0]);

	


}


function getInformationsAboutFlight(icao24){
	const data = null;

	const xhr = new XMLHttpRequest();
	xhr.withCredentials = true;

	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === this.DONE) {
			console.log("All good!");
			chooseRightFlight(this.responseText, icao24);
		}
	});

	xhr.open("GET", "https://aerodatabox.p.rapidapi.com/flights/icao24/"+icao24+"/"+getTodaysDate());
	xhr.setRequestHeader("X-RapidAPI-Key", "45f22e099emsh7826a81c40a9578p1ca45ajsn4ebf89e8a0fd");
	xhr.setRequestHeader("X-RapidAPI-Host", "aerodatabox.p.rapidapi.com");

	xhr.send(data);
}


function chooseRightFlight(data, icao24){

	console.log("All the flights : "+data);

	if(data==null || data=="" || data=="[]"){
		console.log("Flight n°"+icao24+" was not found.");
	}


	data = JSON.parse(data);

	let latestDetection = "";
	let idLatest = null;

	for(let i = 0; i<data.length; i++){

		if(data[i].lastUpdatedUtc>latestDetection){
			
			latestDetection = data[i].lastUpdatedUtc;
			idLatest = i;
		}
	}
	console.log("The right aircraft : ", data[idLatest]);

	//Get the right flight, but not at the right time!
	let rightAircraft = data[idLatest];

	let date = new Date();
	let currentHourMinusOne = getTodaysDate()+" "+(parseInt(date.getUTCHours())-1).toString()+":"+date.getUTCMinutes()+"Z";
	console.log(currentHourMinusOne);
	if(rightAircraft.lastUpdatedUtc<currentHourMinusOne){
		console.log("Flight isn't accurate enough, calling another API.");
		getPreciseLocations(rightAircraft.number);
	}else{
		console.log("Flight is very accurate !!");
	}
	
}


function getPreciseLocations(nb) {
	console.log("Searching for", nb, " in FlightStats");
}



function getInformationsAboutAircraft(icao24){
	
	const data = null;

	const xhr = new XMLHttpRequest();
	xhr.withCredentials = true;

	xhr.addEventListener("readystatechange", function () {
		if (this.readyState === this.DONE) {
			console.log(this.responseText);
		}
	});

	xhr.open("GET", "https://aerodatabox.p.rapidapi.com/aircrafts/icao24/3944EA");
	xhr.setRequestHeader("X-RapidAPI-Key", "800e0bfac8mshb116d4cb2d357a8p1fa69fjsnd8e55f05bcb9");
	xhr.setRequestHeader("X-RapidAPI-Host", "aerodatabox.p.rapidapi.com");
	xhr.setRequestHeader("SameSite","None");
	xhr.send(data);

}



function requestedFields(){
	
}



