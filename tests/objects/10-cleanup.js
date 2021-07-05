const nodePath = require("path");
const fs = require("fs");

module.exports = pass => {
	
	fs.unlinkSync(nodePath.join(__dirname, "exportedValuesAndSections.json"));
	
	global.fRegistry.removeSection(global.testSection, error => {
		
		return pass(!!error);
		
	});
	
};