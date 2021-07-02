module.exports = pass => {
	
	global.fRegistry.createValue(global.testSection, "key", "value", (error, result) => {
		
		return pass(error || result);
		
	});
	
};