const fs = require('fs');
const path = require('path');

const BASE_URL = path.join(__dirname, 'public', 'kpi');
const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MONTHS_NAME = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const targetAvailable = {
	AVAILABLE: 0,
	DATA_REPORTED: 1,
	NO_TARGET: 2,
};

module.exports = (csv, area, alreadyExist = false) => {
    const infoDataset = JSON.parse(fs.readFileSync(path.join(BASE_URL, "info.json")));
    const years = infoDataset["years"];
    const emptyKPIs = infoDataset["kpi"];

    const KPIByYearAndMonth = {};
    
    years.forEach(year => {

        // Add provided KPI
        MONTHS.forEach(month => {
            let KPIs;
            if (alreadyExist) {
                KPIs = JSON.parse(fs.readFileSync(path.join(BASE_URL, year.toString(), MONTHS_NAME[month], area.datasetname + ".json")))["children"];
            } else {
                KPIs = copyArray(emptyKPIs);
            }

            csv.forEach(l => {
                const line = processLine(l);
                if (line[2] == year && line[3] == month) {
                    addKPI(KPIs, line[0], line[1]);
                }
            });

            if (KPIByYearAndMonth[year] == undefined) {
                KPIByYearAndMonth[year] = {};
            }
            KPIByYearAndMonth[year][month] = KPIs;
        });


        // Define non provided KPI for each month
        let scoreForEachMonth = computeScoreForEachMonth(year);
        for (const kpiName in scoreForEachMonth[MONTHS[0]]) {
            let sum = 0;
            let nbOfValue = 0;
            MONTHS.forEach(month => {
                const score = scoreForEachMonth[month][kpiName];
                if (score >= 0) {
                    sum += score;
                    nbOfValue++;
                }
            });
            if (nbOfValue == 0) {
                MONTHS.forEach(month => {
                    addKPI(KPIByYearAndMonth[year][month], kpiName, -999);
                });
            }
            else if (nbOfValue < 12) {
                const mean = sum / nbOfValue;
                MONTHS.forEach(month => {
                    addKPI(KPIByYearAndMonth[year][month], kpiName, mean);
                });
            }
        }

        // Each dimension having children takes the mean value of them
        MONTHS.forEach(month => {
            KPIByYearAndMonth[year][month].forEach(dimension => {
                computeDimensionScore(dimension);
            });
        });
        
        // Define average scores on one year
        if (alreadyExist) {
            KPIByYearAndMonth[year]["0"] = JSON.parse(fs.readFileSync(path.join(BASE_URL, year.toString(), area.datasetname + ".json")))["children"];
        } else {
            KPIByYearAndMonth[year]["0"] = copyArray(emptyKPIs);
        }
        scoreForEachMonth = computeScoreForEachMonth(year);
        for (const kpiName in scoreForEachMonth[MONTHS[0]]) {
            let sum = 0;
            let nbOfValue = 0;
            MONTHS.forEach(month => {
                const score = scoreForEachMonth[month][kpiName];
                if (score >= 0) {
                    sum += score;
                    nbOfValue++;
                }
            });
            if (nbOfValue == 0) {
                addKPI(KPIByYearAndMonth[year]["0"], kpiName, -999);
            }
            else {
                const mean = sum / nbOfValue;
                addKPI(KPIByYearAndMonth[year]["0"], kpiName, mean);
            }
        }
        
        
        MONTHS.forEach(month => {
            let url = path.join(BASE_URL, year.toString());
            if (!fs.existsSync(url)) {
                fs.mkdirSync(url);
            }
            url = path.join(url, MONTHS_NAME[month]); 
            if (!fs.existsSync(url)) {
                fs.mkdirSync(url);
            }
            url = path.join(url, area.datasetname + ".json");

            const KPI = getGlobalKPI(KPIByYearAndMonth[year][month]);
            fs.writeFileSync(url, JSON.stringify(KPI));
        });
        const url = path.join(BASE_URL, year.toString(), area.datasetname + ".json");
        const KPI = getGlobalKPI(KPIByYearAndMonth[year]["0"]);
        fs.writeFileSync(url, JSON.stringify(KPI));
        
    });


    function processLine(line) {
        const year = parseInt(line[2], 10);
        let score;
        if (line.length > 1) {
            score = Number(line[1]);
            if (score > 100 || score < 0) {
                score = -999;
            }
        } else {
            score = -999;
        }
        const month = line.length > 3 ? parseInt(line[3], 10) : 0;
        return [line[0], score, year, month];
    }

    
    function computeScoreForEachMonth(year) {
        let scoreForEachMonth = {};
        MONTHS.forEach(month => {
            scoreForEachMonth[month] = {};
            KPIByYearAndMonth[year][month].forEach(dimension => {
                computeScoreDimension(month, dimension);
            });
        });
        return scoreForEachMonth;

        function computeScoreDimension(month, dimension) {
            scoreForEachMonth[month][dimension.name] = 'score' in dimension? dimension.score : -999;
            if (dimension["children"] != null) {
                dimension["children"].forEach(subDimension => {
                    computeScoreDimension(month, subDimension);
                });
            }
        }
    }

    function copyArray(arr) {
        return JSON.parse(JSON.stringify(arr));
    }
    
    function addKPI(KPIList, name, score) {
        if (KPIList == undefined) {
            return;
        }
        KPIList.forEach(subKPIList => {
            if (subKPIList["name"] == name) {
                if (score >= 0) {
                    subKPIList["targetAvailable"] = targetAvailable.AVAILABLE;
                } else {
                    subKPIList["targetAvailable"] = targetAvailable.NO_TARGET;
                }
                subKPIList["score"] = score;
            } else {
                addKPI(subKPIList["children"], name, score);
            }
        });
    }

    function computeDimensionScore(dimension) {
        if (dimension["children"] == null) {
            return;
        }
        dimension["children"].forEach(subDimension => {
            computeDimensionScore(subDimension);
        });

        if (dimension.score < 0 || dimension.score > 100) {
            let sum = 0;
            let hasAnyValue = false;
            dimension["children"].forEach(subDimension => {
                const score = subDimension.score;
                if (score >= 0) {
                    sum += score;
                    hasAnyValue = true;
                }
            });
            if (hasAnyValue) {
                const mean = sum / dimension["children"].length;
                dimension["score"] = mean;
                dimension["targetAvailable"] = targetAvailable.AVAILABLE;
            }
        }
    }

    function getGlobalKPI(dimensions) {
        let sum = 0;
        let hasAnyDimensions = false;
        dimensions.forEach(dimension => {
            let score = dimension["score"];
            if (score > 0) {
                sum += score;
                hasAnyDimensions = true;
            }
        });
        let score;
        let available;
        if (hasAnyDimensions) {
            score = sum / dimensions.length;
            available = targetAvailable.AVAILABLE;
        } else {
            score = -999;
            available = targetAvailable.NO_TARGET;
        }
        return {
            name: area.name,
            children: dimensions,
            targetAvailable: available,
            score: score
        };
    }
};