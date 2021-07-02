global.fRegistry = require("../src");
global.testSection = String.raw`SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\FREGISTRY_TEST_SECTION`;

global.fRegistry.to("HKLM").setRussiaEncoding();

global.tasks = [];
global.runTasks = () => {
	
	global.tasks._id = global.tasks._id || 0;
	
	if((global.tasks._id + 1) > global.tasks.length) return false;
	
	global.tasks[global.tasks._id](/* () => {
			
		++global.tasks._id;
		global.runTasks();
			
	} */);
	
};

const { passTest, throwTest } = require("./logs");
const checkArrIdentify = require("./checkArrIdentify");

const fs = require("fs");
const nodePath = require("path");

const objects = fs.readdirSync(nodePath.join(__dirname, "./objects")).filter(object => !fs.lstatSync( nodePath.join(__dirname, "./objects/" + object) ).isDirectory() && object.match(/\.js$/) ).sort((a, b) => {
	
	const $a = parseInt(a.match(/\d+/));
	const $b = parseInt(b.match(/\d+/));
	
	return $a - $b;
	
});

const results = require("./results");

async function runTests() {

	for(let i = 0; i < objects.length; ++i) {
		
		const test = require("./objects/" + objects[i]);
		const testName = objects[i].replace(".js", "");
		
		let result;
		
		try {
		
			result = await new Promise((resolve, reject) => {
				
				test(resolve);
				
				setTimeout(() => reject("$$$TIMEOUT"), 10000);
				
			});
			
		} catch(e) {
			
			result = e;
			
		}
		
		if(result === "$$$TIMEOUT") {
			
			throwTest(i, "timeout");
			continue;
			
		}
		
		if(Array.isArray(result) && checkArrIdentify(results[i], result)) {
			
			passTest(testName);
			continue;
			
		} else if(results[i] === result) {
			
			passTest(testName);
			continue;
			
		} else {
			
			throwTest(i, "value");
			console.log(result);
			break;
			
		}
		
	}
	
	console.log("Done!");
	process.exit(0);
	
}

runTests();