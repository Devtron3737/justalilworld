console.log("starting add to map!");

import data from "./data.js";

console.log("rquire data!");

const map = L.map("map").setView([51.505, -0.09], 13);

console.log("create map!");

L.geoJSON(data).addTo(map);

console.log("done adding to map!");
