const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const utils = require('./utils');


const BASE_URL = path.join(__dirname, 'public', 'kpi');
const MONTHS_NAME = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


module.exports = (req, res) => {
	const form = formidable({ multiples: true });
	
	form.parse(req, (err, fields, files) => {
        if (err) {
            utils.redirectWithMsg(err.message, res);
            return;
        }
        if (fields["list_areas"] == "") {
            utils.redirectWithMsg("The area was not specified", res);
            return;
        }
        try {
            const infoURL = path.join(BASE_URL, "info.json");
            const info = JSON.parse(fs.readFileSync(infoURL));
            const areas = info["areas"];
            const years = info["years"];
    
            let index = -1;
            let areaDatasetName;
            areas.forEach((area, i) => {
                if (area.name == fields["list_areas"]) {
                    index = i;
                }
            });
            if (index == -1) {
                utils.redirectWithMsg("The area does not exist", res);
                return;
            } else {
                areaDatasetName = areas[index]["datasetname"];
                areas.splice(index, 1);
            }
    
            years.forEach(year => {
                const datasetURL = path.join(BASE_URL, year.toString());
                fs.unlinkSync(path.join(datasetURL, areaDatasetName + ".json"));
    
                MONTHS_NAME.forEach(month => {
                    fs.unlinkSync(path.join(datasetURL, month, areaDatasetName + ".json"));
                });
            });
    
            fs.writeFileSync(infoURL, JSON.stringify(info));

            utils.redirectWithMsg("The area " + fields["list_areas"] + " has been removed from the platform", res);
        } catch (err) {
            utils.redirectWithMsg(err.message, res);
            return;
        }
    });
};