
"use strict";
import { SmartCityPerformance } from '@models/SmartCityPerformance';
import { Area } from '@models/Area';
var Highcharts = require('highcharts');
require('highcharts/modules/exporting')(Highcharts);
import { MONTHS, getKPI } from '@lib/kpiLoader';
import { years, areas, currentArea, currentKPI, currentYear } from '@lib/sunburst/sunburst';



export async function createGraph() {
	const scores = await getScores(currentYear, currentArea);

	const graph = Highcharts.chart('graph', {
		chart: {
			type: 'line',
			styledMode: true
		},
		title: {
			text: currentArea.name + ' : ' + currentKPI + ' KPI Monthly Average for year ' + currentYear,
		},
		xAxis: {
			categories: MONTHS,
		},
		yAxis: {
			title: {
				text: 'KPI value'
			},
		},
		plotOptions: {
			line: {
				dataLabels: {
					enabled: true
				},
				enableMouseTracking: true
			}
		},
		series: [{
			name: currentKPI,
			data: scores
		}]
	});

	years.forEach(newYear => {
		const btn = document.getElementById(String(newYear));
		if (btn) {
			btn.addEventListener('click', async function () {
				const scores = await getScores(newYear, currentArea);

				graph.update({
					title: {
						text: currentArea.name + ' : ' + currentKPI + ' KPI Monthly Average for year ' + newYear,
					},	
					series: [{
						name: currentKPI,
						data: scores
					}]	
				})
			})
		}
	});
	return graph;
}

async function getScores(year: number, area: Area){
	const scores: number[] = [];

	MONTHS.forEach(month => {
		const kpi = getKPI(year, area, month);
		getScore(kpi);
	});
	return scores;

	function getScore(kpi : SmartCityPerformance) {
		if (kpi.name == currentKPI){
			let score = parseFloat((kpi.score as number).toFixed(2));
			if (score < 0) {
				score = 0;
			}
			scores.push(score);
		} else {
			if (kpi.children) {
				kpi.children.forEach(child => {
					getScore(child);
				});
			};
		}
		
	}
}


export async function createRanking() {
	const scoresWithAreas = await getScoresWithAreas(currentYear);

	const chart = Highcharts.chart('rankings_chart', {
		chart: {
			type: 'column',
			styledMode: true
		},
		title: {
			text: currentKPI + ' KPI Rankings for year ' + currentYear,
		},
		plotOptions: {
			series: {
				grouping: true,
				borderWidth: 0
			}
		},
		legend: {
			enabled: false
		},
		tooltip: {
			shared: true,
			headerFormat: '<span style="font-size: 15px">{point.point.name}</span><br/>',
			pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>'
		},
		xAxis: {
			type: 'category',
			max: areas.length - 1,
		},
		yAxis: [{
			title: {
				text: 'KPI Value'
			},
			showFirstLabel: true
		}],
		series: [
		{
			name: currentYear,
			id: 'main',
			dataSorting: {
				enabled: true,
				matchByName: true
			},
			dataLabels: [{
				enabled: true,
				inside: false,
				style: {
					fontSize: '16px'
				}
			}],
			data: scoresWithAreas
		}],
		exporting: {
			allowHTML: true
		}
	});
	
	years.forEach(newYear => {
		var btn = document.getElementById(String(newYear));
		if (btn) {
			btn.addEventListener('click', async function () {
				const scoresWithAreas = await getScoresWithAreas(newYear);

				chart.update({
					title: {
						text: currentKPI + ' KPI Rankings for year ' + newYear
					},
					series: [{
						name: newYear,
						data: scoresWithAreas
					}]
				}, true, false, {
					duration: 400
				});
			});
		}
	});
	return chart;
}

async function getScoresWithAreas(year: number) {
	let scoresWithAreas = new Array();

	areas.forEach(area => {
		const kpi = getKPI(year, area);
		getScore(kpi, area.name);
	});
	return scoresWithAreas;

	function getScore(kpi : SmartCityPerformance, areaName: string) {
		if (kpi.name == currentKPI){
			let score = parseFloat((kpi.score as number).toFixed(2));
			if (score < 0) {
				score = 0;
			}
			scoresWithAreas = scoresWithAreas.concat(new Array([areaName, score]));
		} else {
			if (kpi.children) {
				kpi.children.forEach(child => {
					getScore(child, areaName);
				});
			};
		}
		
	}
}