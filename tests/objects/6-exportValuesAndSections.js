const nodePath = require("path");

module.exports = pass => {
	
	global.fRegistry.exportValuesAndSections(global.testSection, nodePath.join(__dirname, "exportedValuesAndSections"), error => {
		
		return pass(!!error);
		
	});
	
};