const getValueOfSection = (result, sections, key) => {
	
	if(!result) return undefined;
	
	for(let i = 0; i < sections.length; ++i) {
		
		const tResult = result;
		
		result = result[ sections[i] ];
		
		if(!result) {
			
			result = tResult.$sections[ sections[i] ];
			
			if(!result) return undefined;
			
		}
		
	}
	
	if(result[key] && result[key].value) {
		
		return result[key].value;
		
	}
	
	return undefined;
	
};

module.exports = pass => {
	
	global.fRegistry.readValuesAndSections(global.testSection, (error, result) => {
		
		if(error) return pass(error);
		
		return pass([
		
			getValueOfSection(result, ["root"], "key"),
			getValueOfSection(result, ["Section1"], "keyOfSection1"),
			getValueOfSection(result, ["Section1"], "key2OfSection1"),
			getValueOfSection(result, ["Section1", "Section3"], "keyOfSection13"),
			getValueOfSection(result, ["Section1", "Section3"], "key2OfSection13"),
		
		]);
		
	});
	
};