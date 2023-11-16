import { hospitals } from "./hospitals.js";
var coords;
var map;
var startCoords;

navigator.geolocation.getCurrentPosition((position) => {
  coords = [position.coords.latitude, position.coords.longitude];

  map = L.map("map").setView(coords, 7);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  hospitals.map((hospital, index) => {
    const latlng = hospital.latlng.split(",");
    const marker = L.marker(latlng).addTo(map);
    L.circle(latlng, 500, {
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
    }).addTo(map);
    marker.bindPopup(hospital.hospital).openPopup();
  });

  function calculateDistances(startCoords, endCoords) {
    const waypoints = [
      L.latLng(startCoords.lat, startCoords.lng),
      L.latLng(endCoords.split(",")[0], endCoords.split(",")[1]),
    ];
    L.Routing.control({ waypoints }).addTo(map);
  }

  function onMapClick(e) {
    if (confirm("Confirm this location?")) {
      startCoords = e.latlng;
      hospitals.forEach((hospital) => {
        calculateDistances(startCoords, hospital.latlng);
      });
    }
  }
  map.on("click", onMapClick);
});
