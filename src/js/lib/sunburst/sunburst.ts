"use strict";
import * as d3 from 'd3';
import { colorScaleForNoValues, colorScaleForValues } from '@helpers/Colors';
import { getTextRotation } from '@helpers/getTextRotation';
import { SmartCityPerformance, TargetAvailable } from '@models/SmartCityPerformance';
import { Legend, LegendConfig } from '@lib/Legend/Legend';
import { tooltip } from '@helpers/tooltip';
import { getTextAnchorByAngle } from '@helpers/getTextAnchor';
import { HierarchyNode, partition, D3ZoomEvent, select } from 'd3';
import { sunburstArc } from '@lib/sunburst/sunburstArc';
import { SunburstConfig } from './SunburstConfig';
import { Area } from '@models/Area';
import { createGraph, createRanking } from '@lib/sunburst/graphs';
import { openRankingWindow } from '@lib/ranking';
import { getKPI } from '@lib/kpiLoader';
var Highcharts = require('highcharts');
require('highcharts/modules/exporting')(Highcharts);  


import { DATASET_PATH, DATASET_EXT } from '../../index';
import { InfoDataset, KPI } from '@models/InfoDataset';

export let areas: Area[];
export let years: number[];
export let currentArea: Area;
export let currentYear: number;
export let currentKPI: string;
let originalConfig: SunburstConfig;
let selectedDimension: number;
let labelToggler: HTMLInputElement;
let compareToggler: HTMLInputElement;
let selectedArea: HTMLSelectElement;
let selectedYear: HTMLSelectElement;
let compareParameters: HTMLElement;
let compareType: HTMLSelectElement;
let documentWidth: number;
let documentHeight: number;



export function initSunBurst(infosDataset: InfoDataset) {
	areas = infosDataset["areas"];
	years = infosDataset["years"];
	const KPIs = infosDataset["kpi"];

	currentKPI = KPIs[0].name;
	currentYear = years[0];
	currentArea = areas[0];
	selectedDimension = 0;

	documentWidth = document.body.clientWidth;
	documentHeight = document.body.clientHeight;

	labelToggler = document.getElementById('label-toggler') as HTMLInputElement;
	compareToggler = document.getElementById('compare-toggler') as HTMLInputElement;
	selectedArea = document.getElementById('compare-selected-area') as HTMLSelectElement;
	selectedYear = document.getElementById('compare-selected-year') as HTMLSelectElement;
	compareParameters = document.getElementById('compare-parameters') as HTMLElement;
	compareType = document.getElementById('compare-type') as HTMLSelectElement;
	const yearsButton = document.getElementById('sunburst-years-buttons') as HTMLElement;
	const dimensionCompare = document.getElementById('compare-dimension') as HTMLSelectElement;
	const rankingButton = document.getElementById('open-ranking') as HTMLButtonElement;
	const closeSunburst = document.getElementById('sunburst-close');

	years.forEach(year => {
		yearsButton.innerHTML += "<button id='" + year.toString() + "'>" + year.toString() + "</button>";
	});

	const getNumberOfDimensions = (dimension: KPI): number => {
        if (dimension["children"] == null) {
			return 1;
		} else {
			let maxNumberOfDimensions = 0;
			dimension["children"].forEach(subDimension => {
				const numberOfDimensionsChild = getNumberOfDimensions(subDimension);
				if (numberOfDimensionsChild > maxNumberOfDimensions) {
					maxNumberOfDimensions = numberOfDimensionsChild;
				}
            });
			return 1 + maxNumberOfDimensions;
        }
    }
	const numberOfDimensions = KPIs.reduce((max, dimension) => {
		const numberOfDimensionsChild = getNumberOfDimensions(dimension);
    	return numberOfDimensionsChild > max ? numberOfDimensionsChild : max;
	}, 0);
	for (let i=0; i<numberOfDimensions; i++) {
		dimensionCompare.innerHTML += '<option value="' + (i+1).toString() + '">' + (i+1).toString() + '</option>';
	}
	
	labelToggler?.addEventListener('change', (e) => {
		const element = e.target as HTMLInputElement;
		d3.selectAll('.node-label')
			.transition()
			.duration(200)
			.style('opacity', (d: any) => {
				const ancestors = d.ancestors();
				const root = ancestors[ancestors.length - 1];
				if (root.height == d.depth && !element.checked) return 0;
				if (compareToggler.checked && d.children) return 0
				return 1
			});
	});
	let changeComparator = function() {
		if (compareToggler.checked) {
			createComparator();
		}
	};
	selectedArea.addEventListener('change', (e: any) => {
		changeComparator();
	});
	selectedYear.addEventListener('change', (e: any) => {
		changeComparator();
	});

	dimensionCompare.addEventListener('change', (e: any) => {
		selectedDimension = e.target.selectedIndex;
		changeComparator();
	});

	compareType.addEventListener('change', (e: any) => {
		if (compareType.selectedIndex == 0) {
			selectedArea.style.display = "block";
			selectedYear.style.display = "none";
		}
		else if (compareType.selectedIndex == 1) {
			selectedArea.style.display = "none";
			selectedYear.style.display = "block";
		}
		else {
			selectedArea.style.display = "block";
			selectedYear.style.display = "block";
		}
		changeComparator();
	});
	compareToggler.addEventListener('change', async (e: any) => {
		if (e.target.checked) {
			compareParameters.style.display = "block";
			createComparator();
		} else {
			compareParameters.style.display = "none";
			destroySunburst();
			
			const kpi = getKPI(currentYear, currentArea);
			if (kpi != undefined) {
				createSunBurst(kpi, originalConfig);
			}
		}
	});
	closeSunburst?.addEventListener('click', (e) => {
		d3.select('#sunburst-container')
			.transition()
			.duration(350)
			.style('transform', 'translate(100vw,0px)')
			.call(destroySunburst);
		labelToggler.checked = false;
	});
	rankingButton.onclick = () => {
		d3.select('#sunburst-container')
			.transition()
			.duration(350)
			.style('transform', 'translate(100vw,0px)')
			.call(destroySunburst);
		labelToggler.checked = false;
		openRankingWindow();
	};

	const currentYearBtn = document.getElementById('' + currentYear);
	if (currentYearBtn) {
		currentYearBtn.className = 'active';
	}

	years.forEach(function (year) {
		const yearBtn = document.getElementById(''+year);
		if (!yearBtn)
			return;
		yearBtn.addEventListener('click', async () => 
		{
			currentYear = year;

			document.querySelectorAll('.buttons button.active').forEach(function (active) {
				active.className = '';
			});
			yearBtn.className = 'active';
			
			generateOptions();
			destroySunburst();
			
			if (compareToggler.checked) {
				await createComparator();
			} else {
				const kpi = getKPI(currentYear, currentArea);
				if (kpi != undefined) {
					createSunBurst(kpi, {
						width: documentWidth,
						height: documentHeight,
						radius: Math.min(documentWidth, documentHeight) / 2,
						elementId: 'sunburst',
						rootHtmlNode: '#svg-container',
						name: currentArea.name,
					});
				}
			}
		});
	});
}

export async function openSunBurst(areaSelected: Area, yearSelected?: number, areaToCompare?: Area, yearToCompare?: number)
{
	if (yearSelected){
		currentYear = yearSelected;
		years.forEach(year => {
			const currentYearBtn = document.getElementById(year.toString());
			if (currentYearBtn && year == currentYear) {
				currentYearBtn.className = 'active';
			} else if (currentYearBtn) {
				currentYearBtn.className = '';
			}
		})
	}

	currentArea = areaSelected;

	compareToggler.checked = false;
	compareParameters.style.display = "none";
	selectedArea.style.display = "block";
	selectedYear.style.display = "none";
	compareType.selectedIndex = 0;

	generateOptions();

	const kpi = getKPI(currentYear, currentArea);
	if (kpi != undefined) {
		createSunBurst(kpi, {
			width: documentWidth,
			height: documentHeight,
			radius: Math.min(documentWidth, documentHeight) / 2,
			elementId: 'sunburst',
			rootHtmlNode: '#svg-container',
			name: areaSelected.name,
		});
	}

	if (areaToCompare && yearToCompare)
	{
		compareToggler.checked = true;
		compareParameters.style.display = "block";

		if (areaSelected.datasetname == areaToCompare.datasetname) {
			selectedArea.style.display = "none";
			selectedYear.style.display = "block";
			compareType.selectedIndex = 1;
			for (let i=0; i<selectedYear.options.length; i++) {
				const opt = selectedYear.options[i];
				if (opt.text == yearToCompare.toString()) {
					selectedYear.selectedIndex = i;
				}
			}
		}
		else if (yearSelected == yearToCompare) {
			selectedArea.style.display = "block";
			selectedYear.style.display = "none";
			compareType.selectedIndex = 0;
			for (let i=0; i<selectedArea.options.length; i++) {
				const opt = selectedArea.options[i];
				if (opt.value.split('/')[3] == areaToCompare.datasetname + DATASET_EXT) {
					selectedArea.selectedIndex = i;
				}
			}
		}
		else {
			selectedArea.style.display = "block";
			selectedYear.style.display = "block";
			compareType.selectedIndex = 2;
			for (let i=0; i<selectedArea.options.length; i++) {
				const opt = selectedArea.options[i];
				if (opt.value.split('/')[3] == areaToCompare.datasetname + DATASET_EXT) {
					selectedArea.selectedIndex = i;
				}
			}
			for (let i=0; i<selectedYear.options.length; i++) {
				const opt = selectedYear.options[i];
				if (opt.text == yearToCompare.toString()) {
					selectedYear.selectedIndex = i;
				}
			}
		}
		createComparator();
	}
	
	await createGraph();
	await createRanking();

	select('#sunburst-container')
		.transition()
		.duration(600)
		.style('transform', 'translate(0px,0px)');
}


async function createComparator() {
	let year: number;
	let area: Area | undefined;
	if (compareType.selectedIndex == 0) {
		year = currentYear;
		let areaName = selectedArea.selectedOptions[0].text;
		area = areas.find(a => {
			return a.name == areaName;
		});
	}
	else if (compareType.selectedIndex == 1) {
		year = Number(selectedYear.selectedOptions[0].text);
		area = currentArea;
	}
	else {
		year = Number(selectedYear.selectedOptions[0].text);
		let areaName = selectedArea.selectedOptions[0].text;
		area = areas.find(a => {
			return a.name == areaName;
		});
	}

	if (area != undefined) {
		const comparedDataset = getKPI(year, area);

		if (comparedDataset != undefined) {
			const currentAreaAndYearDatasetCopy: SmartCityPerformance = getKPI(currentYear, currentArea);
			const comparisonDataset = createComparisonDataset(comparedDataset, currentAreaAndYearDatasetCopy);
	
			let title: string;
			if (compareType.selectedIndex == 0) {
				title = currentArea.name + ' / ' + comparedDataset.name;
			}
			else if (compareType.selectedIndex == 1) {
				title = currentArea.name + ' ' + currentYear + ' / ' + year;
			}
			else {
				title = currentArea.name + ' ' + currentYear + ' / ' + comparedDataset.name + ' ' + year;
			}
	
			destroySunburst();
			createSunBurst(comparisonDataset, {
				width: documentWidth,
				height: documentHeight,
				radius: Math.min(documentWidth, documentHeight) / 2,
				elementId: 'sunburst',
				rootHtmlNode: '#svg-container',
				name: title,
				compare: true
			});
		}
	}

	function createComparisonDataset(comparedDataset: SmartCityPerformance, dataset: SmartCityPerformance) {
		let comparisonDataset: SmartCityPerformance = {
			name: dataset.name,
			targetAvailable: dataset.targetAvailable
		};

		comparisonDataset.children = getKPIFromSelectedDimension(dataset, 0);

		const comparedDatasetKPI = getKPIFromSelectedDimension(comparedDataset, 0);
		const numberOfKPI = comparedDataset.children ? comparisonDataset.children.length : 0;
		for (let i=0; i<numberOfKPI; i++) {
			comparedDatasetKPI[i].children = undefined;
			comparisonDataset.children[i].children = [comparedDatasetKPI[i]];
		}
		
		return comparisonDataset;
	}
	function getKPIFromSelectedDimension(dataset: SmartCityPerformance, currentDimension: number): Array<SmartCityPerformance> {
		if (currentDimension == selectedDimension) {
			const childrenKPI = dataset.children ? dataset.children : [];
			childrenKPI.forEach(childKPI => {
				childKPI.children = [];
			})
			return childrenKPI;
		}
		
		const KPIs: Array<SmartCityPerformance> = [];
		if (dataset.children) {
			dataset.children.forEach(datasetChild => {
				KPIs.push(...getKPIFromSelectedDimension(datasetChild, currentDimension+1));
			});
		}
		return KPIs;
	}
}



function createSunBurst(nodeData: SmartCityPerformance, config: SunburstConfig) {
	const {
		width,
		height,
		radius,
		rootHtmlNode = 'body',
		elementId,
		compare = false,
	} = config;

	if (!compare) {
		originalConfig = config;
	}

	/**
	 * DATA SETUP
	 */
	let hierarchyDataNode = d3
		.hierarchy<SmartCityPerformance>(nodeData)
		.sum(function (d: SmartCityPerformance) {
			return d.children ? 0 : 20
		});

	let partitionedRoot = partition<SmartCityPerformance>().size([
		2 * Math.PI,
		radius
	])(hierarchyDataNode);

	/**
	 * SVG SUNBURST SETUP
	 */
	const sunburst = d3
		.select(rootHtmlNode)
		.append('svg')
		.attr('id', elementId)
		.attr('width', 100 + '%')
		.attr('height', 100 + '%')
		.attr('preserveAspectRatio', 'xMidYMid slice')
		.attr('viewBox', 0 + ' ' + -height*0.1 +' ' + width + ' ' + height*1.2 + '')
		.classed('svg-content', true);

	let zoom: any = d3
		.zoom()
		.scaleExtent([0, 8])
		.on('zoom', function () {
			sunburst.select('g').attr('transform', () => {
				const { x, y, k } = (d3.event as D3ZoomEvent<
					Element,
					unknown
				>).transform
				return `translate(${width / 2 + x}, ${height / 2 + y}) scale(${
					k <= 0.5 ? 0.5 : k
				})`
			})
		});

	sunburst.call(zoom);

	const sunburstGroup = sunburst
		.append('g')
		.attr('id', 'node-group')
		.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

	sunburstGroup
		.append('text')
		.attr('text-anchor', 'middle')
		.style('font', 'bold 1.2em Arial')
		.text(config.name);

	/**
	 * SIDEBAR SETUP
	 */
	const sidebar = d3
		.select('#sunburst-sidebar')
		.append('div')
		.attr('id', 'legend-container');
	const legend = sidebar
		.insert<HTMLElement>('ul', ':first-child')
		.attr('class', 'legend');
	sidebar
		.insert('h3', ':first-child')
		.text(hierarchyDataNode.ancestors()[0].data.name + ' KPI');
	sidebar
		.insert('span', '.legend')
		.text('Click a label for filtering')
		.attr('class', 'is-italic');

	let selectedScoreValue: string | null = null;

	const isTargetAvailable = (node: HierarchyNode<SmartCityPerformance>) =>
		node.data.targetAvailable == TargetAvailable.AVAILABLE;
	const getTargetAvailable = (node: HierarchyNode<SmartCityPerformance>) =>
		node.data.targetAvailable;

	render();
	createText();

	function render() {
		drawSunburst();
		drawSidebar();
	}

	function drawSunburst() {
		sunburstGroup
			.selectAll('g')
			.data(partitionedRoot.descendants())
			.join(
				function (enter) {
					return enter
						.append('g')
						.attr('class', 'node')
						.append('path')
						.on('click', async function(d){
							currentKPI = d.data.name;

							await createGraph();
							await createRanking();
						})
						.attr('display', function (d) {
							return d.depth ? null : 'none';
						})
						.attr('d', (e) => {
							return sunburstArc(!compare)(e);
						})
						.style('stroke', '#fff')
						.attr('fill', (d) => {
							if (isTargetAvailable(d)) {
								return colorScaleForValues(
									d.data.score ? d.data.score : 0
								) as any;
							}
							let color = colorScaleForNoValues(getTargetAvailable(d));
							return color;
						});
				},
				function (update) {
					update
						.transition()
						.duration(200)
						.attr('opacity', (d) => {
							if (selectedScoreValue == null) return 1
							const targetAvailable = isTargetAvailable(d);
							if (
								targetAvailable &&
								selectedScoreValue ==
									colorScaleForValues(d.data.score ? d.data.score : 0)
							) {
								return 1;
							} else if (
								!targetAvailable &&
								selectedScoreValue ==
									colorScaleForNoValues(d.data.targetAvailable)
							) {
								return 1;
							}

							return 0.2;
						})
					return update;
				}
			)
	}

	function drawSidebar() {
		legend.call(Legend, {
			x: width - 420,
			y: 40,
			items: tooltip,
			selectedScoreValue: selectedScoreValue,
			clickCallback: (d) => {
				if (d.colorValue === selectedScoreValue) selectedScoreValue = null;
				else selectedScoreValue = d.colorValue;
				render();
			}
		} as LegendConfig);
	}

	function removeSunburst() {
		sunburstGroup.selectAll('g').remove();
	}

	let scaleTimeoutCallback: any;
	globalThis.addEventListener('resize', (e) => {
		if (scaleTimeoutCallback) clearInterval(scaleTimeoutCallback);
		scaleTimeoutCallback = setTimeout(() => {
			config.width = document.body.clientWidth;
			config.height = document.body.clientHeight;
			config.radius = Math.min(config.width, config.height) / 2;
			partitionedRoot = partition<SmartCityPerformance>().size([
				2 * Math.PI,
				config.radius
			])(hierarchyDataNode);
			sunburst.attr('viewBox', '0 0 ' + config.width + ' ' + config.height + '');
			removeSunburst();
			drawSunburst();
			createText();
		}, 20);
	})

	function createText() {
		createOuterLabels();
		createHints();

		function createOuterLabels() {
			sunburstGroup
				.selectAll('.node')
				.attr('text-anchor', (d: unknown) => {
					return getTextAnchorByAngle(d);
				})
				.append('text')
				.attr('class', 'node-label')
				.attr('transform', function (d: any) {
					return `translate(${sunburstArc(!compare).centroid(
						d
					)})rotate(${getTextRotation(d)})`
				})
				.attr('dx', (d: any) => {
					if (!d.children && compare) {
						return (getTextRotation(d) < 180 ? radius : -radius) * 0.195;
					}

					const ancestors = d.ancestors();
					const root = ancestors[ancestors.length - 1];
					if (root.height == d.depth && root.height == 3) {
						return (getTextRotation(d) < 180 ? radius : -radius) * 0.065;
					}

					return 0;
				})
				.attr('dy', '.5em')
				.text((d: any) => {
					return d.parent ? d.data.name : '';
				})
				.style('fill', '#fff')
				.style('opacity', (d: any) => {
					const ancestors = d.ancestors();
					const root = ancestors[ancestors.length - 1];
					if (root.height == d.depth && !labelToggler.checked) return 0;
					if (compare && d.children) return 0;
					return 1;
				})
				.style('font-weight', '400');
		}
		function createHints() {
			sunburstGroup
				.selectAll('.node')
				.append('title')
				.text((d: any) => {
					if (compare) {
						if (compareType.selectedIndex == 0) {
							const areaNameIndex = d.data.children ? 0 : 1;
							const areaName = config.name.split(' / ')[areaNameIndex];
							return `${areaName}/${d.data.name}\n${isTargetAvailable(d) ? d.data.score?.toFixed(2) : 0}%`;
						}
						else if (compareType.selectedIndex == 1) {
							const yearIndex = d.data.children ? 0 : 1;
							const titlePart = config.name.split(' / ')[yearIndex];
							const year = titlePart.replace(/\D/g,'');
							return `${currentArea.name} ${year}/${d.data.name}\n${isTargetAvailable(d) ? d.data.score?.toFixed(2) : 0}%`;
						}
						else {
							const yearIndex = d.data.children ? 0 : 1;
							const titlePart = config.name.split(' / ')[yearIndex];
							return `${titlePart}/${d.data.name}\n${isTargetAvailable(d) ? d.data.score?.toFixed(2) : 0}%`;
						}
					}
					else {
						return `${d
							.ancestors()
							.map((d: any) => {
								return d.data.name;
							})
							.reverse()
							.join('/')}\n${isTargetAvailable(d) ? d.data.score?.toFixed(2) : 0}%`;
					}
				});
		}
	}
}

function destroySunburst() {
	d3.select('#sunburst').remove();
	d3.select('#legend-container').remove();
}


function generateOptions() {
	let optArea = '';
	areas
		.filter((areaToFilter) => {
			return areaToFilter.name != currentArea.name;
		}).forEach((area) => {
			let datasetURL = DATASET_PATH + currentYear + '/' + area.datasetname + DATASET_EXT;
			let name = area.name;
			optArea += `<option value="${datasetURL}">${name}</option>`;
		});
	const selectedIndex = selectedArea.selectedIndex;
	selectedArea.innerHTML = optArea;
	if (selectedIndex != -1)
		selectedArea.selectedIndex = selectedIndex;
	
	let optYear = '';
	years
		.filter(year => {
			return year != currentYear;
		}).forEach(year => {
			let datasetURL = DATASET_PATH + year + '/' + getDatasetName() + DATASET_EXT;
			optYear += `<option value="${datasetURL}">${year}</option>`;
		});
	selectedYear.innerHTML = optYear;

	function getDatasetName(): string {
		let datasetName = "";
		areas
			.filter((areaToFilter) => {
				return areaToFilter.name == currentArea.name;
			}).forEach((area) => {
				datasetName = area.datasetname;
			});
		return datasetName;
	}
}