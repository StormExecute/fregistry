module.exports = pass => {
	
	global.fRegistry.createSection(global.testSection, (error, result) => {
		
		return pass(error || result);
		
	});
	
};