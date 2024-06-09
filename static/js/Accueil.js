var peakMarkers = '';

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////// fonction pour debuguer: liste tous les arguments d'un objet javascript /////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function listerToutesLesProprietes(o) {
    let objectToInspect;
    let resultat = [];

    for (objectToInspect = o;
        objectToInspect !== null;
        objectToInspect = Object.getPrototypeOf(objectToInspect)) {
        resultat = resultat.concat(Object.getOwnPropertyNames(objectToInspect));
    }
    return resultat;
}


/////////////////////////////////////////////////////////////////////////////////
////////////////////// envoi des donné au server app.py /////////////////////////
/////////////////////////////////////////////////////////////////////////////////

async function fetchAsync(url) {
    console.log('fetchAsync1', url);
    try {
        let response = await fetch(url);
        let data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        throw error; // Vous pouvez choisir de relancer l'erreur ou de la gérer différemment ici
    }
}


/////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// Carte Leaflet /////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

var map = L.map('map');
var osmUrl = 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png';
var osmAttrib = 'Map data © OpenStreetMap contributors';
var osm = new L.TileLayer(osmUrl, { attribution: osmAttrib }).addTo(map);
map.setView([42.08, 9.06], 9);

// FullScreen
map.addControl(new L.Control.Fullscreen());
var layerControl = L.control.layers().addTo(map);
layerControl.options = { collapsed: false }

//Gestion couche
var drawn_layer = new L.layerGroup();

/////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////// Echelle ////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

var scale = L.control.scale(
    options = {
        position: 'bottomleft',
        maxWidth: 100,
        metric: true,
        imperial: false,
        updateWhenIdle: false
    },
).addTo(map);

L.grid().addTo(map);

/////////////////////////////////////////////////////////////////////////////////
///////////// Chargement des tous les peaks au 1er chargement////////////////
/////////////////////////////////////////////////////////////////////////////////

data = JSON.parse(document.getElementById("getdata").dataset.markers);
peakList = data[0][0];
addLayer(peakList);

const maxPeak = findMax(peakList);
const maxEle = maxPeak.properties.ele;
var outputElement = document.getElementById("maxEle");
outputElement.textContent = maxEle;
//var maxMarker = L.marker([maxPeak.geometry.coordinates[1], maxPeak.geometry.coordinates[0]]).addTo(map);

function showMaxPeak() {
    map.setView([maxPeak.geometry.coordinates[1], maxPeak.geometry.coordinates[0]], 14);
    peakMarkers.eachLayer(function (layer) {
        var feature = layer.feature;
        if (feature.properties.ele === maxEle) {
            var popupContent = `<b>Nom</b> : ${feature.properties.name}\n<b>Élevation</b> : ${feature.properties.ele} m <a href="https://www.openstreetmap.org/${feature.properties.id}" target="_blank">OSM</a>`;
            layer.bindPopup(popupContent).openPopup();
        }
    });
}

const minPeak = findMin(peakList);
const minEle = minPeak.properties.ele;
var outputElement = document.getElementById("minEle");
outputElement.textContent = minEle;
//var minMarker = L.marker([minPeak.geometry.coordinates[1], minPeak.geometry.coordinates[0]]).addTo(map);

function showMinPeak() {
    map.setView([minPeak.geometry.coordinates[1], minPeak.geometry.coordinates[0]], 14);
    peakMarkers.eachLayer(function (layer) {
        var feature = layer.feature;
        if (feature.properties.ele === minEle) {
            var popupContent = `<b>Nom</b> : ${feature.properties.name}\n<b>Élevation</b> : ${feature.properties.ele} m <a href="https://www.openstreetmap.org/${feature.properties.id}" target="_blank">OSM</a>`;
            layer.bindPopup(popupContent).openPopup();
        }
    });
}

function addLayer(peakList) {
    peakMarkers = L.geoJSON(peakList, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: 'static/images/mountain.svg', // Spécifiez le chemin de l'icône personnalisée
                    iconSize: [25, 41], // Taille de l'icône
                    iconAnchor: [12, 41], // Point d'ancrage de l'icône, généralement son centre en bas
                    popupAnchor: [0, -35] // Point d'ancrage du popup, en relation avec l'icône
                })
            });
        },
        onEachFeature: function (feature, layer) {
            const link = createHikeLink(feature.properties.id);
            var popupContent_ = `<b>Nom</b> : ${feature.properties.name}\n
            <b>Élevation</b> : ${feature.properties.ele} m 
            <a href="https://www.openstreetmap.org/${feature.properties.id}" target="_blank">OSM</a>
            <a href="${link}" target="_blank">link</a>`;

            var popupContent = `<a href="${link}" target="_blank">link</a>`;

            layer.bindPopup(popupContent);
        }
    }).addTo(map);
}

function createHikeLink(nodeId) {
    const parts = nodeId.split('/');
    const id = parts[parts.length - 1];
    const idNum = Number(id);

    const link = `https://overpass-turbo.eu/?Q=[out:json][timeout:25];node(${idNum});way["highway"="path"](around:2000);out geom;&R`;

    return link;
}

/////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// Stats /////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

function findMax(data) {
    var maxObject = null;
    for (var i = 0; i < data.features.length; i++) {
        var currentFeature = data.features[i];
        var currentEle = currentFeature.properties.ele;

        if (maxObject === null || currentEle > maxObject.properties.ele) {
            maxObject = currentFeature;
        }
    }
    return maxObject;
}

function findMin(data) {
    var minObject = null;
    for (var i = 0; i < data.features.length; i++) {
        var currentFeature = data.features[i];
        var currentEle = currentFeature.properties.ele;

        if (minObject === null || currentEle < minObject.properties.ele) {
            minObject = currentFeature;
        }
    }
    return minObject;
}

/////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// Init //////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", function () {
    var inputMinEle = document.getElementById("fromInput");
    inputMinEle.value = minEle;
    inputMinEle.min = minEle;
    var inputMaxEle = document.getElementById("toInput");
    inputMaxEle.value = maxEle;
    inputMaxEle.max = maxEle;
    var sliderMinEle = document.getElementById("fromSlider");
    sliderMinEle.value = minEle;
    sliderMinEle.min = minEle;
    var sliderMaxEle = document.getElementById("toSlider");
    sliderMaxEle.value = maxEle;
    sliderMaxEle.max = maxEle;

    fillSlider(fromSlider, toSlider, '#C6C6C6', '#3E95B8', toSlider);

    let minEleUser = minEle;
    let maxEleUser = maxEle;

    // Add event listener for keyup event
    inputMinEle.addEventListener("keyup", function () {
        minEleUser = inputMinEle.value;
        showFilteredPeaks(peakList, minEleUser, maxEleUser);
    });
    inputMaxEle.addEventListener("keyup", function () {
        maxEleUser = inputMaxEle.value;
        showFilteredPeaks(peakList, minEleUser, maxEleUser);
    });

    sliderMinEle.addEventListener("mouseup", function () {
        minEleUser = sliderMinEle.value;
        showFilteredPeaks(peakList, minEleUser, maxEleUser);
    });
    sliderMaxEle.addEventListener("mouseup", function () { //mousemove
        maxEleUser = sliderMaxEle.value;
        showFilteredPeaks(peakList, minEleUser, maxEleUser);
    });


});

function filterPeak(peakList, min, max) {
    min = Number(min);
    max = Number(max);
    let filteredPeaks = { "type": "FeatureCollection", "features": [] };

    let isMin = false
    let isMax = false
    if (min !== '' || min !== null || min !== undefined) {
        isMin = true;
    }
    if (max !== '' || max !== null || max !== undefined) {
        isMax = true;
    }
    if (max === 0) {
        max = maxEle;
    }

    if (isMin && isMax) {
        if (min < max || min === maxEle) {
            peakList.features.forEach(peak => {
                if (peak.properties.ele >= min && peak.properties.ele <= max) {
                    filteredPeaks.features.push(peak);
                }
            });
        } else {
            return peakList;
        }
    }
    else if (!isMin && isMax) {
        peakList.features.forEach(peak => {
            if (peak.properties.ele <= max) {
                filteredPeaks.features.push(peak);
            }
        })
    }
    else if (isMin && !isMax) {
        peakList.features.forEach(peak => {
            if (peak.properties.ele >= min) {
                filteredPeaks.features.push(peak);
            }
        })
    } else {
        return peakList;
    }

    return filteredPeaks;
}

function showFilteredPeaks(peakList, min, max) {
    const filteredPeaks = filterPeak(peakList, min, max);
    if (peakMarkers) {
        map.removeLayer(peakMarkers);
    }
    addLayer(filteredPeaks);
}

/////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// Slider & Input /////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

function controlFromInput(fromSlider, fromInput, toInput, controlSlider) {
    const [from, to] = getParsed(fromInput, toInput);
    fillSlider(fromInput, toInput, '#C6C6C6', '#3E95B8', controlSlider);
    if (from > to) {
        fromSlider.value = to;
        fromInput.value = to;
    } else {
        fromSlider.value = from;
    }
}

function controlToInput(toSlider, fromInput, toInput, controlSlider) {
    const [from, to] = getParsed(fromInput, toInput);
    fillSlider(fromInput, toInput, '#C6C6C6', '#3E95B8', controlSlider);
    setToggleAccessible(toInput);
    if (from <= to) {
        toSlider.value = to;
        toInput.value = to;
    } else {
        toInput.value = from;
    }
}

function controlFromSlider(fromSlider, toSlider, fromInput) {
    const [from, to] = getParsed(fromSlider, toSlider);
    fillSlider(fromSlider, toSlider, '#C6C6C6', '#3E95B8', toSlider);
    if (from > to) {
        fromSlider.value = to;
        fromInput.value = to;
    } else {
        fromInput.value = from;
    }
}

function controlToSlider(fromSlider, toSlider, toInput) {
    const [from, to] = getParsed(fromSlider, toSlider);
    fillSlider(fromSlider, toSlider, '#C6C6C6', '#3E95B8', toSlider);
    setToggleAccessible(toSlider);
    if (from <= to) {
        toSlider.value = to;
        toInput.value = to;
    } else {
        toInput.value = from;
        toSlider.value = from;
    }
}

function getParsed(currentFrom, currentTo) {
    const from = parseInt(currentFrom.value, 10);
    const to = parseInt(currentTo.value, 10);
    return [from, to];
}

function fillSlider(from, to, sliderColor, rangeColor, controlSlider) {
    const rangeDistance = to.max - to.min;
    const fromPosition = from.value - to.min;
    const toPosition = to.value - to.min;
    controlSlider.style.background = `linear-gradient(
      to right,
      ${sliderColor} 0%,
      ${sliderColor} ${(fromPosition) / (rangeDistance) * 100}%,
      ${rangeColor} ${((fromPosition) / (rangeDistance)) * 100}%,
      ${rangeColor} ${(toPosition) / (rangeDistance) * 100}%, 
      ${sliderColor} ${(toPosition) / (rangeDistance) * 100}%, 
      ${sliderColor} 100%)`;
}

function setToggleAccessible(currentTarget) {
    const toSlider = document.querySelector('#toSlider');
    if (Number(currentTarget.value) <= 0) {
        toSlider.style.zIndex = 2;
    } else {
        toSlider.style.zIndex = 0;
    }
}

const fromSlider = document.querySelector('#fromSlider');
const toSlider = document.querySelector('#toSlider');
const fromInput = document.querySelector('#fromInput');
const toInput = document.querySelector('#toInput');
fillSlider(fromSlider, toSlider, '#C6C6C6', '#3E95B8', toSlider);
setToggleAccessible(toSlider);

fromSlider.oninput = () => controlFromSlider(fromSlider, toSlider, fromInput);
toSlider.oninput = () => controlToSlider(fromSlider, toSlider, toInput);
fromInput.oninput = () => controlFromInput(fromSlider, fromInput, toInput, toSlider);
toInput.oninput = () => controlToInput(toSlider, fromInput, toInput, toSlider);