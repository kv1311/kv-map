import { hospitals } from "./hospitals.js";
var coords;
var map;
var startCoords;

const GRAPHHOPPER_API_KEY = "8dda6af4-c857-46de-b071-602ea2fe8004";

const getRouteInfo = async (start, end) => {
  const query = new URLSearchParams({
    instructions: true,
    type: "json",
    key: GRAPHHOPPER_API_KEY,
  });
  query.append("point", start);
  query.append("point", end);
  const response = await fetch(`https://graphhopper.com/api/1/route?${query.toString()}`, {
    method: "GET",
  });
  const data = await response.json();
  console.log(data);
};

navigator.geolocation.getCurrentPosition((position) => {
  coords = [position.coords.latitude, position.coords.longitude];

  map = L.map("map").setView(coords, 7);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  hospitals.map((hospital) => {
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
    L.Routing.control({
      waypoints,
      router: L.Routing.graphHopper(GRAPHHOPPER_API_KEY, {
        details: ["distance"],
      }),
    }).addTo(map);
  }

  function onMapClick(e) {
    if (confirm("Confirm this location?")) {
      startCoords = e.latlng;
      hospitals.forEach((hospital) => {
        const start = [startCoords.lat, startCoords.lng];
        const end = [
          parseFloat(hospital.latlng.replace(" ", "").split(",")[0]),
          parseFloat(hospital.latlng.replace(" ", "").split(",")[1]),
        ];
        getRouteInfo(start, end);
      });
    }
  }
  map.on("click", onMapClick);
});
