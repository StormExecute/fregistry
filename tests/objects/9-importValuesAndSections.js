const nodePath = require("path");

module.exports = pass => {
	
	global.fRegistry.importValuesAndSections(global.testSection, nodePath.join(__dirname, "exportedValuesAndSections"), error => {
		
		return pass(!!error);
		
	});
	
};