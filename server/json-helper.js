
function merger ( json1, json2 ) {
	if (json1 == undefined) {
		return json2
	}
	if (json2 == undefined) {
		return json1
	}

	if (typeof json1 != typeof json2) {
		return { json1: json1, json2: json2 }
	}

	if (Array.isArray(json1) && Array.isArray(json2)) {
		return json1.concat(json2)
	}

	if (typeof json1 == 'object' && typeof json2 == 'object') {
		for (let key of Object.keys(json2)) {
			json1[key] = merger(json1[key], json2[key])
		}
		return json1
	}

	if (typeof json1 == 'string' || typeof json1 == 'boolean' || typeof json1 == 'number') {
		return json1
	}

	console.log(`Unknown case: ${json1} and ${json2} (${ typeof json1 } and ${ typeof json1 })`)

}


module.exports = {
	merger: merger
}