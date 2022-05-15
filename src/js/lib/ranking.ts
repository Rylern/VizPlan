import { select, max } from 'd3';
import { SmartCityPerformance } from '@models/SmartCityPerformance';
import { openSunBurst, currentArea, currentYear } from '@lib/sunburst/sunburst';
import { InfoDataset, KPI } from '@models/InfoDataset';
import { computeDistance, getTotalDistance } from '@helpers/distance';
import { getKPI } from '@lib/kpiLoader';
import { Area } from '../models/Area';


let areaSelect: HTMLSelectElement;
let yearSelect: HTMLSelectElement;


export function initRanking(infosDataset: InfoDataset) {
    const openBtn = document.getElementById("btn_open_ranking") as HTMLElement;
	const verticalScrollbar = document.getElementById("vertical-scrollbar") as HTMLElement;
    const closeBtn = document.getElementById("ranking-container-close") as HTMLElement;
    areaSelect = document.getElementById("area-ranking-area") as HTMLSelectElement;
    yearSelect = document.getElementById("area-ranking-year") as HTMLSelectElement;
    const distanceSelect = document.getElementById("area-ranking-distance") as HTMLSelectElement;
    const minkowskiOrderInput = document.getElementById("area-ranking-minkowski-order") as HTMLInputElement;
    const KPISelect = document.getElementById("area-ranking-kpi") as HTMLSelectElement;
    const computeBtn = document.getElementById("area-ranking-compute") as HTMLInputElement;
    const resultList = document.getElementById('area-ranking-result') as HTMLElement;
    const tooltip = document.getElementById("tooltip") as HTMLElement;
    const openSunBurstButton = document.getElementById('area-ranking-open-sunburst') as HTMLButtonElement;
    const openSunBurstCompareButton = document.getElementById("area-ranking-open-sunburst-compare") as HTMLButtonElement;
    
    const areas = infosDataset["areas"];
    const years = infosDataset["years"];
    const KPIs = infosDataset["kpi"];

    openBtn.onclick = () => {
        verticalScrollbar.style.display = "none";
        openRankingWindow();
    };
    closeBtn.onclick = () => {
        closeWindow();
    };
    window.addEventListener("click", function(event) {
        const elem = event.target as HTMLElement;
        if (!resultList.contains(elem)) {
            tooltip.style.display = "none";
        }
    });

    areas.forEach(area => {
        areaSelect.innerHTML += "<option>" + area.name + "</option>";
    });
    years.forEach(year => {
        yearSelect.innerHTML += "<option>" + year.toString() + "</option>";
    });

    distanceSelect.onchange = () => {
        if (distanceSelect.value == "Minkowski") {
            minkowskiOrderInput.style.display = "block";
        } else {
            minkowskiOrderInput.style.display = "none";
        }
    };

    KPIs.forEach(dimension => {
        KPISelect.innerHTML += setKPIItem('ranking', dimension);
    });

    KPIs.forEach(dimension => {
        setKPIOnClickExpand('ranking', dimension);
    });

    computeBtn.onclick = async () => {
        resultList.innerHTML = "<tr><th>Name</th><th>Year</th><th>Score</th></tr>";

        const areaSelected = areaSelect.value;
        const yearSelected = yearSelect.value;
        const distanceSelected = distanceSelect.value;
        const minkowskiOrder = parseInt(minkowskiOrderInput.value, 10);
        
        const IDKPISelected: String[] = [];
        KPIs.forEach(dimension => {
            IDKPISelected.push(...getSelectedKPI('ranking', dimension));
        });

        let baseArea: Area = areas[0];
        areas.forEach(area => {
            if (area.name == areaSelected) {
                baseArea = area;
            }
        });
        const KPISelected = getKPI(Number(yearSelected), baseArea);

        const allDistances = [];
        for (const year of years) {
            for (const area of areas) {
                if (year == parseInt(yearSelected, 10) && area.name == areaSelected) {
                    continue;
                }
                let distance = 0;
                for (const IDKPI of IDKPISelected) {
                    const KPIIdentifier = IDKPI.split('-');

                    const KPI = getKPI(year, area);
                    const score = getScore(KPIIdentifier, KPI);
                    const scoreRef = getScore(KPIIdentifier, KPISelected);
                    
                    distance += computeDistance(score, scoreRef, distanceSelected, minkowskiOrder);
                }
                distance = getTotalDistance(distance, distanceSelected, minkowskiOrder);
                allDistances.push({
                    "year": year,
                    "area": area,
                    "distance": distance
                });
            }
        }
        allDistances.sort((a, b) => {
            return a.distance - b.distance;
        });
        
        allDistances.forEach(yearAreaDistance => {
            const year = yearAreaDistance["year"].toString();
            const area = yearAreaDistance["area"];
            const distance = yearAreaDistance["distance"].toFixed(2);
            const id = 'area-ranking-' + area.datasetname + '-' + year;
            resultList.innerHTML += '<tr id="' + id + '" class="line-table"><td>' + area.name + '</td><td>' + year + '</td><td>' + distance + '</td></tr>';
        });

        allDistances.forEach(yearAreaDistance => {
            const year = yearAreaDistance["year"];
            const area = yearAreaDistance["area"];
            const id = 'area-ranking-' + area.datasetname + '-' + year.toString();
            const sunburstContainer = document.getElementById('sunburst-container');

            const distanceLink = document.getElementById(id) as HTMLElement;
            distanceLink.onclick = (e) => {
                tooltip.style.left = '0px';
                tooltip.style.top = '0px';
                tooltip.style.transform = 'translate(' + e.pageX + 'px, ' + e.pageY + 'px)';

                openSunBurstButton.textContent = "Open " + area.name + " " + year;
                openSunBurstButton.onclick = () => {
                    if (sunburstContainer) {
                        openSunBurst(area, year);
                        closeWindow();
                    }
                };
                openSunBurstCompareButton.textContent = "Open " + baseArea.name + " " + yearSelected + " / " + area.name + " " + year;
                openSunBurstCompareButton.onclick = () => {
                    if (sunburstContainer) {
                        openSunBurst(baseArea, parseInt(yearSelected, 10), area, year);
                        closeWindow();
                    }
                };

                tooltip.style.display = "block";
            };
        });
    };
}

export function setKPIItem(type: string, dimension: KPI, parentDimensionID?: String) {
    let dimensionID = "";
    let listStyle: String;
    if (parentDimensionID == null) {
        listStyle = 'block';
    } else {
        listStyle = 'none';
        dimensionID += parentDimensionID + '-'; 
    }
    dimensionID += dimension.name;

    let line = '<li id="area-' + type + '-list-' + dimensionID + '" style="display:' + listStyle + ';">';
    line += '<input type="checkbox" id="area-' + type + '-' + dimensionID + '" value="' + dimensionID + '">';
    line += '<label for="area-' + type + '-' + dimensionID + '">' + dimension.name + ' </label>';
    if (dimension["children"] != null) {
        line += '<a id="area-' + type + '-expand-' + dimensionID + '" class="expand">[expand]</a>';
        line += "<ul>";
        dimension["children"].forEach(subDimension => {
            line += setKPIItem(type, subDimension, dimensionID);
        });
        line += "</ul>";
    }
    line += "</li>";
    return line;
}

export function setKPIOnClickExpand(type: string, dimension: KPI, parentDimensionID?: String) {
    if (dimension["children"] == null) {
        return;
    }
    let dimensionID = "";
    if (parentDimensionID == null) {
    } else {
        dimensionID += parentDimensionID + '-'; 
    }
    dimensionID += dimension.name;
    
    const expandLinkDimension = document.getElementById('area-' + type + '-expand-' + dimensionID) as HTMLElement;
    expandLinkDimension.onclick = () => {
        const alreadyExpanded = expandLinkDimension.innerHTML == "[hide]";
        expandLinkDimension.innerHTML = alreadyExpanded? "[expand]" : "[hide]";
        dimension["children"]?.forEach(subDimension => {
            const subDimensionID = dimensionID + '-' + subDimension.name;
            const itemSubDimension = document.getElementById('area-' + type + '-list-' + subDimensionID) as HTMLElement;
            itemSubDimension.style.display = alreadyExpanded? "none" : "block";
        });
    };

    dimension["children"].forEach(subDimension => {
        setKPIOnClickExpand(type, subDimension, dimensionID);
    });
}

export function getSelectedKPI(type: string, dimension: KPI, parentDimensionID?: String) {
    const IDKPISelected: String[] = [];

    let dimensionID = "";
    if (parentDimensionID == null) {
    } else {
        dimensionID += parentDimensionID + '-'; 
    }
    dimensionID += dimension.name;

    const checkboxDimension = document.getElementById('area-' + type + '-' + dimensionID) as HTMLInputElement;
    if (checkboxDimension.checked) {
        IDKPISelected.push(dimensionID);
    }

    if (dimension["children"] != null) {
        for (let subDimension of dimension["children"]) {
            IDKPISelected.push(...getSelectedKPI(type, subDimension, dimensionID));
        }
    }
    
    return IDKPISelected;
}

export function getScore(KPIIdentifier: String[], KPI: SmartCityPerformance | undefined) {
    if (KPI != undefined) {
        if (KPI["children"] == undefined) {
            return -1;
        }
        const dimensionScores: number[] = [];
        for (const dimension of KPI["children"]) {
            dimensionScores.push(getScoreRec(KPIIdentifier, dimension));
        }
        const maxScore = max(dimensionScores);
        return maxScore != null ? maxScore : -1;
    } else {
        return -1;
    }
}
function getScoreRec(KPIIdentifier: String[], dimension:SmartCityPerformance) {
    if (KPIIdentifier.length < 1) {
        return -1;
    }

    const selectedDimension = KPIIdentifier[0];
    if (dimension["name"] == selectedDimension) {
        if (KPIIdentifier.length == 1) {
            if (dimension["score"] == undefined || dimension["score"] > 100 || dimension["score"] < 0) {
                return -1;
            } else {
                return dimension["score"];
            }
        } else {
            const newKPIIdentifier = [...KPIIdentifier];
            newKPIIdentifier.shift(); 
            if (dimension["children"] == undefined) {
                return -1;
            }
            const subDimensionScores: number[] = [];
            for (const subDimension of dimension["children"]) {
                subDimensionScores.push(getScoreRec(newKPIIdentifier, subDimension));
            }
            const maxScore = max(subDimensionScores);
            return maxScore != null ? maxScore : -1;
        }
    } else {
        return -1;
    }
}

export function openRankingWindow() {
    for (let i=0; i<areaSelect.options.length; i++) {
        if (areaSelect.options[i].value == currentArea.name) {
            areaSelect.selectedIndex = i;
        }
    }
    for (let i=0; i<yearSelect.options.length; i++) {
        if (yearSelect.options[i].value == currentYear.toString()) {
            yearSelect.selectedIndex = i;
        }
    }

    select('#ranking-container')
        .style('z-index', '3000')
        .transition()
        .duration(600)
        .style('transform', 'translate(0px,0px)');
}

function closeWindow() {
    select('#ranking-container')
        .style('z-index', '1000')
        .transition()
        .duration(600)
        .style('transform', 'translate(-100vw,0px)');
}