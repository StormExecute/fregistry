const log = colorPrefix => message => console.log(colorPrefix + "%s\x1b[0m", message);

module.exports = {
	
	redLog: log("\x1b[31m"),
	blueLog: log("\x1b[34m"),
	
};

module.exports.passTest = name => module.exports.blueLog("test #" + name + ": COMPLETED SUCCESSFULLY!");
module.exports.throwTest = (name, r) => module.exports.redLog("test #" + name + ": FAILED!" + (r ? (" Reason: " + r) : ""));