interface plainObjectT {

	[key: string]: any

}

type RegEditType = "REG_SZ" | "REG_EXPAND" | "REG_DWORD" | "REG_MULTI_SZ" | "REG_BINARY" | "REG_DEFAULT";

type HType = "HKEY_LOCAL_MACHINE" | "HKEY_CURRENT_USER" | "HKEY_USERS" | "HKEY_CLASSES_ROOT" | "HKEY_CURRENT_CONFIG";
type HTypeWithReductions = HType | "HKLM" | "HKCU" | "HKU" | "HKCR" | "HKCC";

interface execError {
	
	type: number,
	error: Error,
	origin: {
		
		message: string,
		cmd: string,
		
	}
	
}

interface pathResultErrorI {
	
	path: string,
	result: string[],
	error: execError
	
}

interface keyAndValuesI {
	
	[key: string]: string | {
		
		value: string,
		type: string
		
	}
	
}

declare namespace fRegistry {
	
	function setDefaultType(newValue: RegEditType): typeof fRegistry;
	function setMaxBuffer(newValue: number): typeof fRegistry;
	
	function to(arg: HTypeWithReductions): typeof fRegistry;
	function customTo(arg: string): typeof fRegistry;
	function resetTo(): typeof fRegistry;
	
	function setRussiaEncoding(): typeof fRegistry;
	function setChineEncoding(): typeof fRegistry;
	
	function setCustomEncoding(encoding: string): typeof fRegistry;
	
	function exec(shellCmdString: string, cb: (error: execError, result: any) => void): null;
	
	function readValuesAndSections(path: string, cb: (error: execError, result: plainObjectT) => void, type?: boolean): null;
	
	function exportValuesAndSections(path: string, backupPath: string, cb: (error: Error) => void): null;
	function importValuesAndSections(path: string, backupPath: string, cb: (error: Error) => void): null;
	
	function removeSection(path: string, cb: (error: execError, result: any) => void): null;
	function removeSections(paths: string[], cb: (error: pathResultErrorI) => void): null;
	
	function removeValue(path: string, valueName: string, cb: (error: execError, result: any) => void): null;
	function removeValues(path: string, valueNames: string[], cb: (error: pathResultErrorI) => void): null;
	
	function createSection(path: string, cb: (error: execError, result: any) => void): null;
	function createSections(paths: string[], cb: (error: pathResultErrorI) => void): null;
	
	function createValue(path: string, key: string, value: string, cb: (error: execError, result: any) => void, type?: RegEditType): null;
	function createValues(path: string, keyAndValues: keyAndValuesI, cb: (error: pathResultErrorI) => void): null;
	
}

export = fRegistry;