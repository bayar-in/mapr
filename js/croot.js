import { map } from "./config/peta.js";
import VectorLayer from "https://cdn.skypack.dev/ol/layer/Vector.js";
import VectorSource from "https://cdn.skypack.dev/ol/source/Vector.js";
import Point from "https://cdn.skypack.dev/ol/geom/Point.js";
import Feature from "https://cdn.skypack.dev/ol/Feature.js";
import GeoJSON from "https://cdn.skypack.dev/ol/format/GeoJSON.js";
import { toLonLat } from "https://cdn.skypack.dev/ol/proj.js";
import { Style, Stroke, Icon, Fill } from "https://cdn.skypack.dev/ol/style.js";

// Sources and layers
const roadsSource = new VectorSource();
const markerSource = new VectorSource();
const polygonSource = new VectorSource();

const roadsLayer = new VectorLayer({
  source: roadsSource,
  style: new Style({
    stroke: new Stroke({
      color: "black",
      width: 4,
    }),
  }),
});
const markerLayer = new VectorLayer({
  source: markerSource,
  style: new Style({
    image: new Icon({
      src:
        "data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(` 
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
          <path fill="red" d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 10.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>`),
      scale: 1,
      anchor: [0.5, 1],
    }),
  }),
});
const polygonLayer = new VectorLayer({
  source: polygonSource,
  style: new Style({
    fill: new Fill({
      color: "rgba(165, 163, 164, 0.59)", // Warna arsiran (biru transparan)
    }),
    stroke: new Stroke({
      color: "gray",
      width: 2,
    }),
  }),
});

map.addLayer(roadsLayer);
map.addLayer(markerLayer);
map.addLayer(polygonLayer);

let clickedCoordinates = null; // Global variable to store clicked coordinates

// Event handler for map clicks
map.on("click", async (event) => {
  const coordinates = event.coordinate;
  const [longitude, latitude] = toLonLat(coordinates);

  console.log(`Longitude: ${longitude}, Latitude: ${latitude}`);
  clickedCoordinates = [longitude, latitude]; // Save the clicked coordinates

  // Add marker
  addMarker(coordinates);
});

// Event listener for "Hitung" button
document.getElementById("btn-distance").addEventListener("click", async () => {
  try {
    const distanceInput = document.getElementById("distance-input").value;

    if (!distanceInput || isNaN(distanceInput) || Number(distanceInput) <= 0) {
      Swal.fire({
        title: "Invalid Input",
        text: "Masukkan jarak yang valid (angka positif)!",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    if (!clickedCoordinates) {
      Swal.fire({
        title: "No Location Selected",
        text: "Silakan pilih lokasi di peta terlebih dahulu!",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    const maxDistance = Number(distanceInput);
    const [longitude, latitude] = clickedCoordinates;
    const token = validateToken();

    // Fetch and display roads
    const roadsData = await fetchRoads(longitude, latitude, maxDistance, token);
    if (roadsData) {
      const geoJSON = convertToGeoJSON(roadsData);
      displayRoads(geoJSON);
    }
  } catch (error) {
    console.error("Error in distance calculation:", error);
  }
});

// Region
document.getElementById("regionSearch").addEventListener("click", async () => {
  try {
    if (!clickedCoordinates) {
      Swal.fire({
        title: "No Location Selected",
        text: "Silakan pilih lokasi di peta terlebih dahulu!",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    const [longitude, latitude] = clickedCoordinates;
    const token = validateToken();

    // Clear roads and fetch GeoJSON
    roadsSource.clear();
    const geoJSON = await fetchRegionGeoJSON(longitude, latitude, token);
    if (geoJSON) {
      displayPolygonOnMap(geoJSON);

      const regionProperties = geoJSON.features[0]?.properties;
      if (regionProperties) {
        // Save longitude, latitude, and properties to localStorage
        localStorage.setItem("longitude", longitude);
        localStorage.setItem("latitude", latitude);
        localStorage.setItem("district", regionProperties.district || "N/A");
        localStorage.setItem("province", regionProperties.province || "N/A");
        localStorage.setItem(
          "sub_district",
          regionProperties.sub_district || "N/A"
        );
        localStorage.setItem("village", regionProperties.village || "N/A");

        // Update UI with stored data
        updateRegionInfo();
      }
    } else {
      Swal.fire({
        title: "Fetch Failed",
        text: "Failed to fetch region data. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  } catch (error) {
    console.error("Error fetching region:", error);
  }
});

function updateRegionInfo() {
  // Retrieve data from localStorage
  const longitude = localStorage.getItem("longitude");
  const latitude = localStorage.getItem("latitude");
  const district = localStorage.getItem("district");
  const province = localStorage.getItem("province");
  const subDistrict = localStorage.getItem("sub_district");
  const village = localStorage.getItem("village");

  // Update the HTML elements with the retrieved data
  document.getElementById("longitude").textContent = longitude;
  document.getElementById("latitude").textContent = latitude;
  document.getElementById("district").textContent = district;
  document.getElementById("province").textContent = province;
  document.getElementById("sub-district").textContent = subDistrict;
  document.getElementById("village").textContent = village;
}

// Function to fetch roads
async function fetchRoads(longitude, latitude, maxDistance, token) {
  try {
    const response = await fetch(
      "https://asia-southeast2-awangga.cloudfunctions.net/bayarin/data/get/roads",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Login: token,
        },
        body: JSON.stringify({
          long: longitude,
          lat: latitude,
          max_distance: maxDistance,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching roads:", error);
    Swal.fire({
      title: "Error",
      text: "Error fetching roads. Please try again.",
      icon: "error",
      confirmButtonText: "OK",
    });
    return null;
  }
}

// Function to display roads
function displayRoads(geoJSON) {
  const format = new GeoJSON();
  const features = format.readFeatures(geoJSON, {
    dataProjection: "EPSG:4326",
    featureProjection: "EPSG:3857",
  });

  roadsSource.clear(); // Clear previous roads
  roadsSource.addFeatures(features); // Add new roads
}

async function fetchRegionGeoJSON(longitude, latitude, token) {
  try {
    const response = await fetch(
      "https://asia-southeast2-awangga.cloudfunctions.net/bayarin/data/get/region",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Login: token,
        },
        body: JSON.stringify({
          long: longitude,
          lat: latitude,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching GeoJSON region:", error);
    Swal.fire({
      title: "Error",
      text: "Error fetching region data. Please try again.",
      icon: "error",
      confirmButtonText: "OK",
    });
    return null;
  }
}

// Fungsi untuk menampilkan poligon pada peta
function displayPolygonOnMap(geoJSON) {
  // Parse GeoJSON ke dalam fitur OpenLayers
  const features = new GeoJSON().readFeatures(geoJSON, {
    dataProjection: "EPSG:4326", // Proyeksi data GeoJSON
    featureProjection: "EPSG:3857", // Proyeksi untuk peta
  });

  polygonSource.clear(); // Hapus semua poligon sebelumnya
  polygonSource.addFeatures(features); // Tambahkan fitur baru ke sumber

  // Zoom ke area poligon jika ada
  if (features.length > 0) {
    const extent = polygonSource.getExtent();
    map.getView().fit(extent, { padding: [50, 50, 50, 50] });
  } else {
    alert("Tidak ada data region yang ditemukan.");
  }
}

// Function to add marker
function addMarker(coordinate) {
  const marker = new Feature({
    geometry: new Point(coordinate),
  });

  markerSource.clear(); // Clear previous markers
  markerSource.addFeature(marker); // Add new marker
}

// Function to convert response to GeoJSON
function convertToGeoJSON(response) {
  return {
    type: "FeatureCollection",
    features: response.map((road) => ({
      type: "Feature",
      geometry: road.geometry,
      properties: road.properties,
    })),
  };
}

function checkLoginStatus() {
  const isLoggedIn = window.Cookies.get("login");

  // Jika belum login, tampilkan alert dan redirect ke halaman login
  if (isLoggedIn) {
    // Jika cookie ada, redirect ke dashboard
    Swal.fire({
      title: "Sukses",
      text: "Login Berhasil!!",
      icon: "success",
      confirmButtonText: "OK",
    }); // Ganti dengan URL dashboard Anda
  } else {
    // Jika cookie tidak ada, tampilkan alert atau lakukan tindakan lain
    Swal.fire({
      title: "Akses Ditolak",
      text: "Anda belum login. Silakan login terlebih dahulu.",
      icon: "warning",
      confirmButtonText: "OK",
    }).then(() => {
      window.location.href = "/login"; // Redirect ke halaman login
    });
  }
}

function getToken() {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("login="))
    ?.split("=")[1];
}

// Check and validate token
function validateToken() {
  const token = getToken();
  if (!token) {
    Swal.fire({
      title: "Authentication Error",
      text: "Anda harus login terlebih dahulu",
      icon: "error",
      confirmButtonText: "Go to Login",
    }).then(() => {
      window.location.href = "/login";
    });
    throw new Error("Token is missing in cookies!");
  }
  return token;
}
