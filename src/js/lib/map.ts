import leaflet from 'leaflet';
import { Area } from '@models/Area'
import { openSunBurst } from '@lib/sunburst/sunburst';


const ACCESS_TOKEN = 'pk.eyJ1IjoiZHdzb3VtaXRyYSIsImEiOiJja2ZjOWMyYW4wMHpvMnJ1Z3JseW13ZHYwIn0.pTObRybmF7SuB1p0AwWntA';


export function initMap(areas : Area[]) {
	const map = newMap();
	addAreasToMap(map, areas);
	resizeLabels(map.getZoom());
}

function newMap() : leaflet.Map {
	const map = leaflet
		.map('leaflet-map', { maxZoom: 15, minZoom: 3, zoomSnap: 0.1, zoomDelta: 0.5, maxBounds: leaflet.latLngBounds([-90, -180], [90, 180])})
		.setView([30, 0], 3);

	map.on('zoomanim', (e) => resizeLabels(e.zoom));

	leaflet.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox/light-v10',	
		tileSize: 512,
		zoomOffset: -1,
		accessToken: ACCESS_TOKEN
	}).addTo(map);

	return map;
}

function addAreasToMap(map: leaflet.Map, areas: Area[]) {
	const sunburstContainer = document.getElementById('sunburst-container');
	for (const area of areas) {
		leaflet
			.geoJSON(area.geojson, {
				pointToLayer: function(geoJsonPoint, latlng) {
					return leaflet
						.marker(latlng, {
							icon: leaflet.divIcon({
								iconSize: undefined,
								className: 'map-label',
								html:
									'<div><div class="map-pin"></div><span class="map-label-text">' +
									area.name +
									'</span></div>',
							}),
						})
				}
			})
			.on('click', () => {
				if (sunburstContainer) {
					openSunBurst(area);
				}
			})
			.addTo(map);
	}
}

function resizeLabels(zoomlevel: any) {
	const elements = document.getElementsByClassName('map-label-text')
	for (let index = 0; index < elements.length; index++) {
		const element = elements[index] as HTMLDivElement;
		let fontSize = 20 * Math.log10(zoomlevel);
		element.style.fontSize = `${fontSize}px`;
	}
}