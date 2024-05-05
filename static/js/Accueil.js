var user_position = { lat: 45.756681, lng: 4.831715 };
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



/////////////////////////////////////////////////////////////////////////////////
/////////////////////// Afficher les commerces sur la carte//////////////////////
/////////////////////////////////////////////////////////////////////////////////

function affiche_commerces(data) {

    // Ajout d'évènements : zoom + buffer + couleur
    function mouse_events(feature, leaflet_object) {
        leaflet_object.on('click', function (event) {
            map.setView(event.latlng, 16);
        });
        leaflet_object.on('mouseover', function (event) {
            var leaflet_object = event.target;
            leaflet_object.setRadius(12),
                leaflet_object.setStyle({
                    color: "white",
                    weight: 5
                })
        });
        leaflet_object.on('mouseout', function (event) {
            var leaflet_object = event.target;
            leaflet_object.setStyle({
                color: "white",
                weight: 1
            }),
                leaflet_object.setRadius(6)
        });
    }


    var commerces = L.geoJson(data, {

        style: function (feature) {
            return {
                radius: 6,
                color: 'white',
                weight: 1,
                fillOpacity: 1
            }
        },

        pointToLayer: function (latlng) {
            var marker = L.circleMarker(latlng);
            marker.on('click', function (ev) { marker.openPopup(marker.getLatLng()) })
            return marker
        },

        onEachFeature: mouse_events,

    }).addTo(map);
    // crer un control layer avec titre

}






/////////////////////////////////////////////////////////////////////////////////
///////////////////////////// Connaitre votre adresse ///////////////////////////
/////////////////////////////////////////////////////////////////////////////////

var geocoderBAN = L.geocoderBAN({
    collapsed: false,
    style: 'searchBar',
    resultsNumber: 5,
    placeholder: 'Entrez votre adresse'
}).addTo(map)


geocoderBAN.markGeocode = function (feature) {
    var latlng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]
    map.setView(latlng, 14)
    user_position = { lat: latlng[0], lng: latlng[1] };

    var popup = L.popup()
        .setLatLng(latlng)
        .setContent(feature.properties.label)
        .openOn(map)
}


/////////////////////////////////////////////////////////////////////////////////
///////////// Chargement des tous les commerces au 1er chargement////////////////
/////////////////////////////////////////////////////////////////////////////////
data = JSON.parse(document.getElementById("getdata").dataset.markers);
peakList = data[0][0]

const maxEle = findMax(peakList)
var outputElement = document.getElementById("maxEle");
outputElement.textContent = maxEle;

const minEle = findMin(peakList)
var outputElement = document.getElementById("minEle");
outputElement.textContent = minEle;

showLayer(peakList);

function showLayer(peakList) {
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
            // Créer le contenu du popup
            var popupContent = `<b>Nom</b> : ${feature.properties.name}\n<b>Élevation</b> : ${feature.properties.ele} m <a href="https://www.openstreetmap.org/${feature.properties.id}" target="_blank">OSM</a>`;
            layer.bindPopup(popupContent);
        }
    }).addTo(map);
}



function findMax(data) {

    var maxObject = null;

    for (var i = 0; i < data.features.length; i++) {
        var currentFeature = data.features[i];
        var currentEle = currentFeature.properties.ele;

        if (maxObject === null || currentEle > maxObject) {
            maxObject = currentEle;
        }
    }
    return maxObject;
}

function findMin(data) {

    var minObject = null;

    for (var i = 0; i < data.features.length; i++) {
        var currentFeature = data.features[i];
        var currentEle = currentFeature.properties.ele;

        if (minObject === null || currentEle < minObject) {
            minObject = currentEle;
        }
    }
    return minObject;
}




// Wait for the DOM content to be fully loaded
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
        toto(peakList, minEleUser, maxEleUser);
    });
    inputMaxEle.addEventListener("keyup", function () {
        maxEleUser = inputMaxEle.value;
        toto(peakList, minEleUser, maxEleUser);
    });

    sliderMinEle.addEventListener("mouseup", function () {
        minEleUser = sliderMinEle.value;
        toto(peakList, minEleUser, maxEleUser);
    });
    sliderMaxEle.addEventListener("mouseup", function () { //mousemove
        maxEleUser = sliderMaxEle.value;
        toto(peakList, minEleUser, maxEleUser);
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
        max = findMax(peakList);
    }

    if (isMin && isMax) {
        if (min < max || min === findMax(peakList)) {
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

function toto(peakList, min, max) {
    const filteredPeaks = filterPeak(peakList, min, max);
    if (peakMarkers) {
        map.removeLayer(peakMarkers);
    }

    showLayer(filteredPeaks);
}













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