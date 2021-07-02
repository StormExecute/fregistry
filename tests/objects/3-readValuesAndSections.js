module.exports = pass => {
	
	global.fRegistry.readValuesAndSections(global.testSection, (error, result) => {
		
		return pass(error || (result && result.root && result.root.key && result.root.key.value));
		
	});
	
};