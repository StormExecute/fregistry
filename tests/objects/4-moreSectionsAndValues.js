module.exports = pass => {
	
	const callback = (error, result) => {
		
		if(error) return pass(error);
		
		++global.tasks._id;
		global.runTasks();
		
	};
	
	global.tasks = [

		() => global.fRegistry.createSection(global.testSection + String.raw`\Section1`, callback),
		
		() => global.fRegistry.createValue(global.testSection + String.raw`\Section1`, "keyOfSection1", 123, callback, "REG_DWORD"),
		() => global.fRegistry.createValue(global.testSection + String.raw`\Section1`, "key2OfSection1", "value2", callback),
		
		() => global.fRegistry.createSections([global.testSection + String.raw`\Section2`, global.testSection + String.raw`\Section4`], callback),
		
		() => global.fRegistry.createSection(global.testSection + String.raw`\Section1\Section3`, callback),
		
		() => global.fRegistry.createValues(global.testSection + String.raw`\Section1\Section3`, { keyOfSection13: "value", key2OfSection13: { value: "value2" } }, callback),
		
		() => pass(true),

	];
	
	global.runTasks();
	
};