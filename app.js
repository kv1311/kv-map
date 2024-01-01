import { hospitals } from "./hospitals.js";

var map;
var sortedDistances = [];
var sortedTimes = [];

const GRAPHHOPPER_API_KEY = "8dda6af4-c857-46de-b071-602ea2fe8004";

const sortDistanceTimePerLocation = (start, end, distance, time, locationIndex) => {
  sortedDistances.push({ start, end, distance, time, locationIndex });
  sortedTimes.push({ start, end, distance, time, locationIndex });
};

const sortDistances = () => {
  sortedDistances.sort((a, b) => {
    if (a.locationIndex !== b.locationIndex) {
      return a.locationIndex - b.locationIndex;
    } else if (a.time !== b.time) {
      return a.time - b.time;
    } else {
      return a.distance - b.distance;
    }
  });

  sortedTimes.sort((a, b) => {
    if (a.locationIndex !== b.locationIndex) {
      return a.locationIndex - b.locationIndex;
    } else if (a.distance !== b.distance) {
      return a.distance - b.distance;
    } else {
      return a.time - b.time;
    }
  });
};

const getRouteInfo = async (start, end, hospitalName, locationIndex) => {
  const query = new URLSearchParams({
    instructions: true,
    type: "json",
    key: GRAPHHOPPER_API_KEY,
  });
  query.append("point", start.join(","));
  query.append("point", end.join(","));
  const response = await fetch(`https://graphhopper.com/api/1/route?${query.toString()}`, {
    method: "GET",
  });
  const data = await response.json();

  const distance = data.paths && data.paths[0] ? data.paths[0].distance : null;
  const time = data.paths && data.paths[0] ? data.paths[0].time : null;

  if (distance !== null && time !== null) {
    sortDistanceTimePerLocation(start, hospitalName, distance, time, locationIndex);
    sortDistances(); // Sort after each addition
  } else {
    console.error("Unable to retrieve distance or time data.");
  }
};

const locations = [
  [10.765089, 79.841486],
  [10.7570, 79.8259]
  // Add more locations as needed
];

map = L.map("map").setView(locations[0], 7);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

hospitals.map((hospital) => {
  const latlng = hospital.latlng.split(",");
  const marker = L.marker(latlng).addTo(map);
  L.circle(latlng, 500, {
    color: "#" + Math.floor(Math.random() * 16777215).toString(16),
  }).addTo(map);
  marker.bindPopup(hospital.hospital).openPopup();
});

const replaceWithRandomPoints = async () => {
  try {
    const response = await fetch('http://127.0.0.1:5500/nagai.geojson');
 // Replace 'data.geojson' with your file path
    const data = await response.json();
    console.log(data);
    const geojsonFeatures = turf.featureCollection(data.features);
    const randomPoints = turf.randomPoint(3, { bbox: turf.bbox(geojsonFeatures) });
    const pointsArray = randomPoints.features.map(feature => feature.geometry.coordinates.reverse());
    console.log(pointsArray);

    locations.splice(0, 15, ...pointsArray);
    calculateDistances();
  } catch (error) {
    console.error('Error fetching and replacing random points:', error);
  }
};

const calculateDistances = async () => {
  for (let i = 0; i < locations.length; i++) {
    const location = locations[i];
    for (const hospital of hospitals) {
      const end = hospital.latlng.split(",");
      await getRouteInfo(location, end, hospital.hospital, i);
    }
  }

  const locationOneDistancesTimes = sortedDistances.filter(entry => entry.locationIndex === 0);
  console.log("Distances and Times for Location 1:", locationOneDistancesTimes);
};

replaceWithRandomPoints();
