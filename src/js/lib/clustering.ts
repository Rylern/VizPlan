import { select } from 'd3';
import { InfoDataset } from '@models/InfoDataset';
import { computeDistance, getTotalDistance } from '@helpers/distance';
import { setKPIItem, setKPIOnClickExpand, getSelectedKPI, getScore } from '@lib/ranking';
import { Area } from '@models/Area';
import { getKPI } from '@lib/kpiLoader';


interface Point {
    year?: number;
    area?: Area;
    KPIValues: {
        KPI: String;
        value: number;
    }[];
    centroidIndex?: number;
};

const MAX_NUMBER_OF_ITERATIONS = 1000;


export function initClustering(infosDataset: InfoDataset) {
    const openBtn = document.getElementById("btn_open_clustering") as HTMLElement;
	const verticalScrollbar = document.getElementById("vertical-scrollbar") as HTMLElement;
    const closeBtn = document.getElementById("clustering-container-close") as HTMLElement;
    const distanceSelect = document.getElementById("area-clustering-distance") as HTMLSelectElement;
    const minkowskiOrderInput = document.getElementById("area-clustering-minkowski-order") as HTMLInputElement;
    const KPISelect = document.getElementById("area-clustering-kpi") as HTMLSelectElement;
    const computeBtn = document.getElementById("area-clustering-compute") as HTMLInputElement;
    const resultList = document.getElementById('area-clustering-result') as HTMLElement;
    const nbClustersInput = document.getElementById('area-clustering-nb-clusters') as HTMLInputElement;

    const KPIs = infosDataset["kpi"];
    const areas = infosDataset["areas"];
    const years = infosDataset["years"];

    openBtn.onclick = () => {
        verticalScrollbar.style.display = "none";
        openClusteringWindow();
    };
    closeBtn.onclick = () => {
        closeWindow();
    };

    distanceSelect.onchange = () => {
        if (distanceSelect.value == "Minkowski") {
            minkowskiOrderInput.style.display = "block";
        } else {
            minkowskiOrderInput.style.display = "none";
        }
    };

    KPIs.forEach(dimension => {
        KPISelect.innerHTML += setKPIItem('clustering', dimension);
    });
    
    KPIs.forEach(dimension => {
        setKPIOnClickExpand('clustering', dimension);
    });

    computeBtn.onclick = async () => {
        const distanceSelected = distanceSelect.value;
        const minkowskiOrder = parseInt(minkowskiOrderInput.value, 10);
        const nbClusters = parseInt(nbClustersInput.value, 10);

        const IDKPISelected: String[] = [];
        KPIs.forEach(dimension => {
            IDKPISelected.push(...getSelectedKPI('clustering', dimension));
        });

        const yearsCitiesKPIvalues = await getYearsCitiesKPIvalues(IDKPISelected);
        const points = clustering(yearsCitiesKPIvalues);

        let resultText = "";
        for (let i=0; i<nbClusters; i++) {
            resultText += `<strong>Cluster ${i+1}</strong><br>`;
            points.forEach(point => {
                if (point.centroidIndex == i) {
                    resultText += point.area?.name + ' ' + point.year + '<br>';
                }
            });
            resultText += '<br><br>';
        }
        resultList.innerHTML = resultText;

        
        async function getYearsCitiesKPIvalues(IDKPISelected: String[]) {
            const yearsCitiesKPIvalues: Point[] = [];
            for (let year of years) {
                for (let area of areas) {
                    const KPIvalues: { KPI: String; value: number; }[] = [];

                    const yearAreaKPI = getKPI(year, area);
                    IDKPISelected.forEach(IDKPI => {
                        const IDKPISplit = IDKPI.split('-');
                        KPIvalues.push({
                            'KPI': IDKPI,
                            'value': getScore(IDKPISplit, yearAreaKPI)
                        });
                    });
                    yearsCitiesKPIvalues.push({
                        'year': year,
                        'area': area,
                        'KPIValues': KPIvalues
                    });
                }
            }
            return yearsCitiesKPIvalues;
        }

        function clustering(yearsCitiesKPIvalues: Point[]) {
            const points: Point[] = [];
            yearsCitiesKPIvalues.forEach(yearAreaKPIvalue => {
                points.push({
                    'year': yearAreaKPIvalue['year'],
                    'area': yearAreaKPIvalue['area'],
                    'KPIValues': yearAreaKPIvalue['KPIValues'],
                    'centroidIndex': -1
                });
            })

            const centroids: Point[] = [];
            for (let i=0; i<nbClusters; i++) {
                centroids.push(points[Math.floor(Math.random() * points.length)]);
            }

            let currentNumberOfIterations = 0;
            const baseCentroid: Point = {
                'KPIValues': [...yearsCitiesKPIvalues[0]['KPIValues']]
            };
            baseCentroid['KPIValues'].forEach(KPIValue => {
                KPIValue['value'] = 0;
            });

            while (currentNumberOfIterations <= MAX_NUMBER_OF_ITERATIONS) {
                currentNumberOfIterations += 1;

                points.forEach(point => {
                    let minDistance = Infinity;
                    let nearestCentroidIndex = 0;
                    centroids.forEach((centroid, index) => {
                        const distance = getDistance(point, centroid);
                        if (distance < minDistance) {
                            minDistance = distance;
                            nearestCentroidIndex = index;
                        }
                    });
                    point['centroidIndex'] = nearestCentroidIndex;
                });
        
                centroids.forEach((centroid, centroidIndex) => {
                    const newCentroid = Object.assign({}, baseCentroid);
        
                    let nbOfPointsInCentroid = 0;
                    points.forEach(point => {
                        if (point.centroidIndex == centroidIndex) {
                            nbOfPointsInCentroid += 1;
                            newCentroid['KPIValues'].forEach((KPIValue, KPIValueIndex) => {
                                KPIValue['value'] += point['KPIValues'][KPIValueIndex]['value'];
                            });
                        }
                    });
                    newCentroid['KPIValues'].forEach(KPIValue => {
                        KPIValue['value'] /= nbOfPointsInCentroid;
                    });
                    centroid = newCentroid;
                });
            }
            return points;


            function getDistance(point1: Point, point2: Point) {
                let totalDistance = 0;
                for (let i=0; i<point1['KPIValues'].length; i++) {
                    totalDistance += computeDistance(point1['KPIValues'][i]['value'], point2['KPIValues'][i]['value'], distanceSelected, minkowskiOrder)
                }
                return getTotalDistance(totalDistance, distanceSelected, minkowskiOrder);
            }
        }
    };
}


function openClusteringWindow() {
    select('#clustering-container')
        .style('z-index', '3000')
        .transition()
        .duration(600)
        .style('transform', 'translate(0px,0px)');
}

function closeWindow() {
    select('#clustering-container')
        .style('z-index', '1000')
        .transition()
        .duration(600)
        .style('transform', 'translate(-100vw,0px)');
}