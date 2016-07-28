var map,
    buildings,
    nature,
    places,
    streets,
    info,
    command,
    legend;

map = L.map('map', {
    center: [32.10805, 34.833],
    zoom: 18
});

buildings = L.geoJson(tlvYisgavBuildings, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);

nature = L.geoJson(tlvYisgavNature, {
    style: natureStyle,
    onEachFeature: function(feature, layer) {
        layer.bindPopup(feature.properties.title);
    }
});

places = L.geoJson(tlvYisgavPlaces, {
    pointToLayer: function(feature, latlng) {
        var customIcon = L.icon({
            iconUrl: 'icons-mapbox/' + feature.properties.markerSymbol + '.png',
            iconSize: [32, 64],
            iconAnchor: [16, 37],
            popupAnchor: [0, -36]
        });
        return L.marker(latlng, {
            icon: customIcon
        });
    },
    onEachFeature: function(feature, layer) {
        layer.bindPopup(feature.properties.title)
    }
})

streets = L.geoJson(tlvYisgavStreets, {
    style: streetsStyle,
    onEachFeature: function(feature, layer) {
        layer.bindPopup(feature.properties.title);
    }
});

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.light'
}).addTo(map);


// Control that shows building info on hover
info = L.control();

info.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function(props) {
    this._div.innerHTML = '<h4>Tama38 - Yisgav TLV</h4>' + (props ?
        '<b>' + props.title + '</b><br />Current: ' + props.currentFloors + ' floors' + '</b><br /> Maximum: ' + props.maximumFloors + ' floors' :
        'Hover over a building');
};

info.addTo(map);

// Get color depending on the number of floors
function getColor(d) {
    return d > 6 ? '#800026' :
        d > 5 ? '#BD0026' :
        d > 4 ? '#E31A1C' :
        d > 3 ? '#FC4E2A' :
        d > 2 ? '#FD8D3C' :
        d > 1 ? '#FEB24C' :
        '#FFEDA0';
}

function style(feature) {
    return {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getColor(feature.properties.currentFloors)
    };
}

function natureStyle(feature) {
    return {
        weight: 2,
        opacity: 1,
        color: feature.properties.stroke,
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: feature.properties.fill
    };
}

function streetsStyle(feature) {
    return {
        color: feature.properties.stroke
    };
}

function showTama38Options(buildings) {
    buildings.eachLayer(function(layer) {
        layer.setStyle({
            fillColor: getColor(layer.feature.properties.maximumFloors)
        });
    });
}

function showCurrentBuildingsStatus(buildings) {
    buildings.eachLayer(function(layer) {
        layer.setStyle({
            fillColor: getColor(layer.feature.properties.currentFloors)
        })
    });
}

command = L.control({
    position: 'topright'
});

command.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'command');

    div.innerHTML = '<form><input id="command" type="checkbox"/>Show Tama38 building rights</form>';
    return div;
};

command.addTo(map);

function handleCommand(e) {
    var isChecked = e.currentTarget.checked;
    if (isChecked) {
        showTama38Options(buildings);
    } else {
        showCurrentBuildingsStatus(buildings)
    }
}

document.getElementById("command").addEventListener("click", handleCommand, false);


function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}


function resetHighlight(e) {
    buildings.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });
}

legend = L.control({
    position: 'bottomright'
});

legend.onAdd = function(map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [1, 2, 3, 4, 5, 6, 7],
        labels = [],
        from, to;

    for (var i = 0; i < grades.length; i++) {
        from = grades[i];

        labels.push(
            '<i style="background:' + getColor(from) + '"></i> ' +
            from);
    }

    div.innerHTML = labels.join('<br>');
    return div;
};

legend.addTo(map);

var overlayMaps = {
    "Nature": nature,
    "Places": places,
    "Streets": streets
};

L.control.layers(null, overlayMaps).addTo(map);
