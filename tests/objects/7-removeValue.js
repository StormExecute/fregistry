module.exports = pass => {
	
	global.fRegistry.removeValues(global.testSection + "\\Section1", ["keyOfSection1", "key2OfSection1"], error => {
		
		return pass(!!error);
		
	});
	
};