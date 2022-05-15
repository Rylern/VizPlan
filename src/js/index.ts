"use strict";
import '../scss/main.scss';
import '../scss/highcharts.scss';
import '../scss/logos.scss';
import '../scss/leaflet.scss';
import '../scss/charts.scss';
import '../scss/windows.scss';
import '../scss/ranking.scss';
import '../scss/sunburst.scss';
import '../scss/switch.scss';
import '../scss/scrollbar.scss';
import { initMap } from '@lib/map';
import { initRanking } from '@lib/ranking';
import { initClustering } from '@lib/clustering';
import { initCreateArea, initEditArea, initRemoveArea } from '@lib/manageAreas';
import { initDefineKPI } from '@lib/defineKPI';
import { initSunBurst } from '@lib/sunburst/sunburst';
import { json } from 'd3';
import { InfoDataset } from '@models/InfoDataset';
import { getAllKPI } from '@lib/kpiLoader';
import { Indicator } from '@models/Indicator';


export const DATASET_PATH = 'public/kpi/';
export const DATASET_EXT = '.json';

export let indicators: Indicator[] = [];


handleMessage();

json<InfoDataset>(DATASET_PATH + 'info' + DATASET_EXT)
	.then(async infosDataset => {
		if (infosDataset != undefined) {
			indicators = await getAllKPI(infosDataset);
			initUI(infosDataset);
			initMap(infosDataset["areas"]);
			initSunBurst(infosDataset);
		}
	});

	

function initUI(infosDataset: InfoDataset) {
	const barMenu = document.getElementById("bar_menu") as HTMLElement;
	const verticalScrollbar = document.getElementById("vertical-scrollbar") as HTMLElement;

	barMenu.onclick = () => {
		if (verticalScrollbar.style.display == "block") {
			verticalScrollbar.style.display = "none";
		} else {
			verticalScrollbar.style.display = "block";
		}
	};

	initCreateArea(infosDataset);
	initEditArea(infosDataset);
	initRemoveArea(infosDataset);
	initDefineKPI(infosDataset);
	initRanking(infosDataset);
	initClustering(infosDataset);
}

function handleMessage() {
	const urlParams = new URLSearchParams(window.location.search);
	const message = urlParams.get('msg');
	if (message) {
		const infoWindow = document.getElementById("info_window") as HTMLElement;
		const closeBtn = document.getElementById("modal-close_info") as HTMLElement;
		const content = document.getElementById("info_content") as HTMLElement;

		infoWindow.style.display = "block";
		content.innerHTML = message;

		closeBtn.onclick = () => {
			infoWindow.style.display = "none";
			window.history.replaceState({}, document.title, "/");
		};

		window.addEventListener("click", function(event) {
			if (event.target == infoWindow) {
				infoWindow.style.display = "none";
				window.history.replaceState({}, document.title, "/");
			}
		});
	}
}