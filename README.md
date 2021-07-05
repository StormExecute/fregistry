# fregistry [![NPM version][npm-image]][npm-url]

Fast windows registry editor.

# Description

This module will allow you to quickly manipulate the reg.exe utility using an intuitive interface. There are also export and import functions.

# Table of Contents

* [Install](#install)
* [Usage](#usage)
* [API](#api)
* [Contacts](#contacts)

<div id='install'></div>

# Install

```bash
$ npm install fregistry
```

<div id='usage'></div>

# Usage

```javascript

const fRegistry = require("fregistry");
//as example
const $async = require("async");

fRegistry.to("HKLM");

$async.waterfall([

	next => fRegistry.createSections(["SOFTWARE\\TestSection1", "SOFTWARE\\TestSection2"], error => {

		if(error) return next(error);
		
		next(null);

	}),

	next => fRegistry.createValues("SOFTWARE\\TestSection1", {

		key: "value",
		key2: { value: 123, type: "REG_DWORD" },

	}, error => {

		if(error) return next(error);
		
		next(null);

	}),
	
	next => fRegistry.readValuesAndSections("SOFTWARE\\TestSection1", (error, result) => {

		if(error) return next(error);
		
		if(result.root.key.value) next(null);

	}),
	
	next => fRegistry.exportValuesAndSections("SOFTWARE\\TestSection1", "./exports", error => {
	
		if(error) return next(error);
		
		next(null);
	
	}),
	
	next => fRegistry.removeValues("SOFTWARE\\TestSection1", ["key", "key2"], error => {
	
		if(error) return next(error);
		
		next(null);
	
	}),
	
	next => fRegistry.removeSections(["SOFTWARE\\TestSection1", "SOFTWARE\\TestSection2"], error => {
	
		if(error) return next(error);
		
		next(null);
	
	}),
	
	next => fRegistry.importValuesAndSections("SOFTWARE\\TestSection1", "./exports", error => {
	
		if(error) return next(error);
		
		next(null);
	
	}),
	
], error => { 

	console.error(error);

});

```

<div id='api'></div>

# API

Types: [HERE!](https://github.com/StormExecute/fregistry/blob/master/index.d.ts)

### fRegistry.to(arg: HTypeWithReductions) => typeof fRegistry
Allows you to set a prefix for the main path. It can only take the values described in HTypeWithReductions.

### fRegistry.customTo(arg: string) => typeof fRegistry
The same as fRegistry.to, only it can take any string argument. 

### fRegistry.resetTo() => typeof fRegistry
Clears the path prefix.

### fRegistry.exec(shellCmdString: string, cb: (error: execError, result: any) => void) => null
The system method for executing a reg request.

### fRegistry.setMaxBuffer(newValue: number) => typeof fRegistry
Sets the specified maximum buffer for stdout of fRegistry.exec .

### fRegistry.setRussiaEncoding() => typeof fRegistry
Sets the Russian encoding of the command result via fRegistry.exec .

### fRegistry.setChineEncoding() => typeof fRegistry
Sets the Chinese encoding of the command result via fRegistry.exec .

### fRegistry.setCustomEncoding() => typeof fRegistry
Allows you to set your own encoding.

### fRegistry.readValuesAndSections(path: string, cb: (error: execError, result: plainObjectT) => void, type?: boolean) => null
Returns by callback a list of values and sections in an object. 

### fRegistry.exportValuesAndSections(path: string, backupPath: string, cb: (error: Error) => void) => null
Exports all values and sections to the given path.

### fRegistry.importValuesAndSections(path: string, backupPath: string, cb: (error: Error) => void) => null
Imports all values and sections to the given path.

### fRegistry.removeSection(path: string, cb: (error: execError, result: any) => void) => null
Deletes one specified section.

### fRegistry.removeSections(paths: string[], cb: (error: pathResultErrorI) => void) => null
Deletes one or more specified sections.

### fRegistry.removeValue(path: string, valueName: string, cb: (error: execError, result: any) => void) => null
Removes one value in one section.

### fRegistry.removeValues(path: string, valueNames: string[], cb: (error: pathResultErrorI) => void) => null
Removes one or more values in one section.

### fRegistry.createSection(path: string, cb: (error: execError, result: any) => void) => null
Creates one section.

### fRegistry.createSections(paths: string[], cb: (error: pathResultErrorI) => void) => null
Creates one or more sections.

### fRegistry.createValue(path: string, key: string, value: string, cb: (error: execError, result: any) => void, type?: RegEditType) => null
Creates one value in one section.

### fRegistry.setDefaultType(newValue: RegEditType) => null
Sets the default value for the type to be used in fRegistry.createValue. Initially equal to REG_SZ.

### fRegistry.createValues(path: string, keyAndValues: keyAndValuesI, cb: (error: pathResultErrorI) => void) => null
Creates one or more values in one section.

<div id='contacts'></div>

# Contacts

**Yandex Mail** - vladimirvsevolodovi@yandex.ru

**Github** - https://github.com/StormExecute/

# Platforms

**Github** - https://github.com/StormExecute/fregistry/

**NPM** - https://www.npmjs.com/package/fregistry/

# License

**MIT** - https://mit-license.org/

[npm-url]: https://www.npmjs.com/package/fregistry
[npm-image]: https://img.shields.io/npm/v/fregistry.svg