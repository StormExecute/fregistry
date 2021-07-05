const isObject = require("../deps/isObject");
const ObjectKeys = require("../deps/getObjectKeys");

const nodePath = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const iconv = require("iconv-lite");

const importValuesProcess = (valuesArray, valuesObject, path, cb) => {
		
	if(!valuesArray.length) return cb(null);
	
	const thisValueName = valuesArray.shift();
	const thisValue = valuesObject[thisValueName];
	
	if(thisValue.type == "REG_BINARY") {
		
		thisValue.value = Buffer.from(thisValue.value).toString("hex");
		
	}
	
	if(thisValue.type == "REG_MULTI_SZ") {
		
		thisValue.value = thisValue.value.join('\\0');
		
	}
	
	fRegistry.createValue(path, thisValueName, thisValue.value, err => {
		
		if(err) return cb(err);
		
		return importValuesProcess(valuesArray, valuesObject, path, cb);
		
	}, thisValue.type);
	
	return null;
	
};
	
const importSectionsProcess = (sectionsArray, sectionsObject, path, cb) => {
		
	if(!sectionsArray.length) return cb(null);
	
	const thisSectionName = sectionsArray.shift();
	const thisSection = sectionsObject[thisSectionName];
	
	const pathO = path;
	path = nodePath.join(path, thisSectionName);
	
	fRegistry.createSection(path, err => {
		
		if(err) return cb(err);
		
		const sectionsOfSection = thisSection.$sections;
		delete thisSection.$sections;
		
		importValuesProcess(ObjectKeys(thisSection), thisSection, path, err => {
			
			if(err) return cb(err);
			
			if(sectionsOfSection) {
				
				importSectionsProcess(ObjectKeys(sectionsOfSection), sectionsOfSection, path, err => {
					
					if(err) return cb(err);
					
					importSectionsProcess(sectionsArray, sectionsObject, pathO, cb);
					
				});
				
			} else {
				
				importSectionsProcess(sectionsArray, sectionsObject, pathO, cb);
				
			}
			
		});
		
	});
	
};

const usuallyProcessFunction = (objects, doCb, finalCb) => {
	
	doCb(objects.shift(), () => {
		
		if(!objects.length) return finalCb(null);
		
		usuallyProcessFunction(objects, doCb, finalCb)
		
	});
	
};

const privateVariables = {

	defaultType: "REG_SZ",
	
	maxBuffer: 1024 * 1024,
	
	nowTo: "HKEY_LOCAL_MACHINE",
	useNowTo: false,
	
	outputEncoding: "utf8",
	
};

const fRegistry = {
	
	setDefaultType: newValue => {
		
		if(newValue == "REG_SZ" || newValue == "REG_EXPAND" || newValue == "REG_DWORD" || newValue == "REG_MULTI_SZ" || newValue == "REG_BINARY" || newValue == "REG_DEFAULT") {
		
			privateVariables.defaultType = newValue;
			
		}
		
		return fRegistry;
		
	},
	
	setMaxBuffer: newValue => typeof newValue == "number" && (privateVariables.maxBuffer = newValue, fRegistry),
	
	to: arg => {
		
		if(arg == "HKLM" || arg == "HKEY_LOCAL_MACHINE") {
			
			privateVariables.nowTo = "HKEY_LOCAL_MACHINE";
		
		} else if(arg == "HKCU" || arg == "HKEY_CURRENT_USER") {
			
			privateVariables.nowTo = "HKEY_CURRENT_USER";
			
		} else if(arg == "HKU" || arg == "HKEY_USERS") {
			
			privateVariables.nowTo = "HKEY_USERS";
			
		} else if(arg == "HKCR" || arg == "HKEY_CLASSES_ROOT") {
			
			privateVariables.nowTo = "HKEY_CLASSES_ROOT";
			
		} else if(arg == "HKCC" || arg == "HKEY_CURRENT_CONFIG") {
			
			privateVariables.nowTo = "HKEY_CURRENT_CONFIG";
			
		} else {
			
			return fRegistry;
			
		}
		
		privateVariables.useNowTo = true;
		
		return fRegistry;
		
	},
	
	customTo: arg => {
		
		if(typeof arg == "string") {
			
			privateVariables.nowTo = arg;
			
			privateVariables.useNowTo = true;
			
		}
		
		return fRegistry;
		
	},
	
	resetTo: () => {
		
		privateVariables.nowTo = "HKEY_LOCAL_MACHINE";
			
		privateVariables.useNowTo = false;
		
		return fRegistry;
		
	},
	
	setRussiaEncoding: () => (privateVariables.outputEncoding = "cp866", fRegistry),
	setChineEncoding: () => (privateVariables.outputEncoding = "cp936", fRegistry),
	
	setCustomEncoding: encoding => {
		
		if(typeof encoding == "string") {
			
			privateVariables.outputEncoding = encoding;
			
		}
		
		return fRegistry;
		
	},
	
	exec: (shellCmdString, cb) => {
		
		exec(shellCmdString, { encoding: "buffer", maxBuffer: privateVariables.maxBuffer }, (error, stdout, stderr) => {
			
			stderr = privateVariables.outputEncoding != "utf8" ? iconv.decode(stderr, privateVariables.outputEncoding) : stderr.toString();
			
			if(error) {
				
				error.origin = {
					
					message: stderr,
					cmd: error.cmd,
					
				};
			
				return cb({
					
					type: 1,
					error,
					
				});
				
			}
			
			if(stderr) {
				
				return cb({
					
					type: 2,
					error: stderr.replace(/\r*\n/g, '\r\n'),
					
				});
				
			}
			
			stdout = privateVariables.outputEncoding != "utf8" ? iconv.decode(stdout, privateVariables.outputEncoding) : stdout.toString()
			
			cb(null, stdout.replace(/\r*\n/g, '\r\n'));
			
			return null;
			
      });
	  
	  return null;
		
	},
	
	readValuesAndSections: (path, cb, type) => {
		
		if(privateVariables.useNowTo) path = nodePath.join(privateVariables.nowTo, path);
		
		let query = `reg query "${path}" /s`;
		
		if(type) query += ` /t "${type}"`;
		
		fRegistry.exec(query, (err, result) => {
			
			if(err) return cb(err);
			
			const finalResult = {};
			
			const lines = result.split("\r\n");
			
			let nowSection = "";
			
			for(let i = 0; i < lines.length; ++i) {
				
				if(lines[i]) {
					
					if(lines[i][0] == "H" && lines[i][1] == "K" && lines[i][2] == "E" && lines[i][3] == "Y") {
						
						nowSection = lines[i].substr(path.length + 1);
						
						if(!nowSection) nowSection = "root";
						
						if(!finalResult[nowSection]) {
							
							finalResult[nowSection] = {};
							
						}
						
						continue;
						
					}
					
					let spaces = 0;
					let mode = 0;
					
					let key = "";
					let type = "";
					let value = "";
					
					for(let j = 0; j < lines[i].length; ++j) {
						
						if(lines[i][j] == " ") {
							
							++spaces;
							
							if(spaces == 4) {
								
								++mode;
								
							}
							
						} else {
							
							if(mode == 1) {
								
								if(spaces != 4) {
									
									for(let k = 0; k < spaces; ++k) {
										
										key += " ";
										
									}
									
								}
								
								key += lines[i][j];
								
							} else if(mode == 2) {
								
								if(spaces != 4) {
									
									for(let k = 0; k < spaces; ++k) {
										
										type += " ";
										
									}
									
								}
								
								type += lines[i][j];
								
							} else if(mode > 2) {
								
								if(spaces != 4) {
									
									for(let k = 0; k < spaces; ++k) {
										
										value += " ";
										
									}
									
								}
								
								value += lines[i][j];
								
							}
							
							spaces = 0;
							
						}
						
					}
					
					/* if(key == "(по умолчанию)") {
					
						continue;
					
					} */
					
					if(type == "REG_BINARY") {
						
						value = Buffer.from(value, 'hex');
						
					}
					
					if(type == "REG_DWORD" || type == "REG_QWORD") {
						
						value = parseInt(value);
						
					}
					
					if(type == "REG_MULTI_SZ") {
						
						value = value.split('\\0');
						
					}
					
					finalResult[nowSection][key] = { type, value };
					
				}
				
			}
			
			for(const key in finalResult) {
				
				if(key == "root") continue;
				
				const splitted = key.split("\\");
				
				if(splitted.length == 1) continue;
				
				let thisObjectPointer = finalResult;
				
				for(let i = 0; i < splitted.length; ++i) {
					
					if(!thisObjectPointer[splitted[i]]) {
						
						if(thisObjectPointer.$sections && thisObjectPointer.$sections[splitted[i]]) {
							
						} else {
						
							if(!thisObjectPointer.$sections) thisObjectPointer.$sections = {};
						
							thisObjectPointer.$sections[splitted[i]] = finalResult[key];
							
						}
						
					}
					
					thisObjectPointer = thisObjectPointer[splitted[i]] || thisObjectPointer.$sections[splitted[i]];
					
				}
				
				delete finalResult[key];
				
			}
			
			cb(null, finalResult);
			
		});
		
		return null;
		
	},
	
	exportValuesAndSections: (path, backupPath, cb) => {
		
		fRegistry.readValuesAndSections(path, (err, result) => {
			
			if(err) return cb(err);
			
			fs.writeFile(backupPath + ".json", JSON.stringify(result, null, "\t"), cb);
			
		});
		
		return null;
		
	},
	
	importValuesAndSections: (path, backupPath, cb) => {
		
		fRegistry.createSection(path, (err, result) => {
			
			if(err) return cb(err);
			
			const data = JSON.parse(fs.readFileSync(backupPath + ".json").toString());
			
			importValuesProcess(ObjectKeys(data.root), data.root, path, err => {
				
				if(err) return cb(err);
				
				delete data.root;
				
				importSectionsProcess(ObjectKeys(data), data, path, err => {
					
					if(err) return cb(err);
					
					return cb(null);
					
				});
				
			});
			
		});
		
		return null;
		
	},
	
	removeSection: (path, cb) => {
		
		if(privateVariables.useNowTo) path = nodePath.join(privateVariables.nowTo, path);
		
		fRegistry.exec(`reg delete "${path}" /f`, cb);
		
		return null;
		
	},
	
	removeValue: (path, valueName, cb) => {
		
		if(privateVariables.useNowTo) path = nodePath.join(privateVariables.nowTo, path);
		
		fRegistry.exec(`reg delete "${path}" /v "${valueName}" /f`, cb);
		
		return null;
		
	},
	
	removeSections: (paths, cb) => {
		
		const result = [];
		
		usuallyProcessFunction(paths, (path, next) => {
			
			if(privateVariables.useNowTo) path = nodePath.join(privateVariables.nowTo, path);
			
			fRegistry.exec(`reg delete "${path}" /f`, error => {
				
				if(error) {
					
					return cb({
					
						path,
						result,
						error,
					
					});
					
				}
				
				result.push(path);
				
				next();
				
			});
			
		}, cb);
		
		return null;
		
	},
	
	removeValues: (path, valueNames, cb) => {
		
		if(privateVariables.useNowTo) path = nodePath.join(privateVariables.nowTo, path);
		
		if(!Array.isArray(valueNames)) return cb(new Error("valueNames is not an array"));
		
		const result = [];
		
		usuallyProcessFunction(valueNames, (valueName, next) => {
			
			fRegistry.exec(`reg delete "${path}" /v "${valueName}" /f`, error => {
				
				if(error) {
					
					return cb({
					
						path,
						result,
						error,
					
					});
					
				}
				
				result.push(valueName);
				
				next();
				
			});
			
		}, cb);
		
		return null;
		
	},
	
	createSection: (path, cb) => {
		
		if(privateVariables.useNowTo) path = nodePath.join(privateVariables.nowTo, path);
		
		fRegistry.exec(`reg add "${path}" /f`, cb);
		
		return null;
		
	},
	
	createValue: (path, key, value, cb, type) => {
		
		if(privateVariables.useNowTo) path = nodePath.join(privateVariables.nowTo, path);
		
		if(!type) {
			
			if(Buffer.isBuffer(value)) {
				
				value = value.toString("hex");
				type = "REG_BINARY";
				
			} else if(typeof value == "number") {
				
				type = "REG_DWORD";
				
			} else {
			
				type = privateVariables.defaultType;
				
			}
			
		}
		
		fRegistry.exec(`reg add "${path}" /v "${key}" /t "${type}" /d "${value}" /f`, cb);
		
		return null;
		
	},
	
	createSections: (paths, cb) => {
		
		const result = [];
		
		usuallyProcessFunction(paths, (path, next) => {
			
			if(privateVariables.useNowTo) path = nodePath.join(privateVariables.nowTo, path);
			
			fRegistry.exec(`reg add "${path}" /f`, error => {
				
				if(error) {
					
					return cb({
					
						path,
						result,
						error,
					
					});
					
				}
				
				result.push(path);
				
				next();
				
			});
			
		}, cb);
		
		return null;
		
	},
	
	createValues: (path, keyAndValues, cb) => {
		
		if(!isObject(keyAndValues)) return cb(new Error("keyAndValues is not an object"));
		
		const result = [];
		
		usuallyProcessFunction(ObjectKeys(keyAndValues), (key, next) => {
			
			fRegistry.createValue(path, key, typeof keyAndValues[key] == "string" ? keyAndValues[key] : keyAndValues[key].value, error => {
				
				if(error) {
					
					return cb({
					
						path,
						result,
						error,
					
					});
					
				}
				
				result.push(keyAndValues[key]);
				
				next();
				
			}, keyAndValues[key].type);
			
		}, cb);
		
		return null;
		
	},
	
};

module.exports = fRegistry;