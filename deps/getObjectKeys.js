const fastGetObjectKeys = obj => {

	const result = [];

	for (const objKey in obj) {

		result.push(objKey);

	}

	return result;

};

module.exports = fastGetObjectKeys;