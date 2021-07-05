module.exports = pass => {
	
	global.fRegistry.removeSections([global.testSection + "\\Section2", global.testSection + "\\Section4"], error => {
		
		if(error) return pass(error);
		
		global.fRegistry.removeSection(global.testSection, (error, result) => {
			
			return pass(error || result);
			
		});
		
	});
	
};