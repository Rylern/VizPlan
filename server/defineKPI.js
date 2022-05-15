const formidable = require('formidable');
const fs = require('fs');
const parse = require('csv-parse');
const path = require('path');
const utils = require('./utils');
const createDatasetFromCSV = require('./createDatasetFromCSV');

const BASE_URL = path.join(__dirname, 'public', 'kpi');


module.exports = (req, res) => {
	const form = formidable({ multiples: true });
	
	form.parse(req, (err, fields, files) => {
		if (err) {
			utils.redirectWithMsg(err.message, res);
			return;
		}
		if (fields["define_kpi_starting_year"] == "" || fields["define_kpi_ending_year"] == "") {
			utils.redirectWithMsg("A year was not specified", res);
			return;
		}
		fs.readFile(files["kpi_csv"].filepath, 'utf8', (err, data) => {
			if (err) {
				utils.redirectWithMsg(err.message, res);
				return;
			}
			parse(data, {relax_column_count: true}, function(err, output) {
				try {
					if (err) throw err;

					const info = createKPI(fields, output);
					updateDatasets(info);
					
					utils.redirectWithMsg("The KPI have been created.", res);
				} catch (error) {
					utils.redirectWithMsg(error.message, res);
				}
				
			});
		});
	});
};

function createKPI(fields, output) {
    const infoURL = path.join(BASE_URL, "info.json");
	const info = JSON.parse(fs.readFileSync(infoURL));

    info["years"].forEach(year => {
        fs.rmSync(path.join(BASE_URL, year.toString()), {recursive: true});
    });
    let startingYear = parseInt(fields["define_kpi_starting_year"]);
    let endingYear = parseInt(fields["define_kpi_ending_year"]);
    if (startingYear > endingYear) {
        [startingYear, endingYear] = [endingYear, startingYear];
    }
    const years = [];
    for (let i=0; i<endingYear-startingYear+1; i++) {
        years.push(startingYear + i);
    }
    info["years"] = years;

    const KPIs = [];
    output.forEach(line => {
        let KPI = addKPI(KPIs, line[0]);
        for (let i=1; i<line.length; i++) {
            KPI = addKPI(KPI.children, line[i]);
        }
    });
    KPIs.forEach(KPI => {
        deleteUnusedChildren(KPI);
    })
    info["kpi"] = KPIs;

    fs.writeFileSync(infoURL, JSON.stringify(info));
    return info;
}

function updateDatasets(info) {
    info["areas"].forEach(area => {
        createDatasetFromCSV([], area);
    });
}

function addKPI(KPIs, newKPIName) {
    for (let i=0; i<KPIs.length; i++) {
        if (KPIs[i].name == newKPIName) {
            return KPIs[i];
        }
    }
    const newKPI = {
        name: newKPIName,
        children: []
    };
    KPIs.push(newKPI);
    return newKPI;
}

function deleteUnusedChildren(KPI) {
    if (KPI.children.length == 0) {
        delete KPI.children;
    } else {
        KPI.children.forEach(KPIChild => {
            deleteUnusedChildren(KPIChild);
        });
    }
}
