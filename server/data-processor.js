const fs = require('fs')
const zipper = require('adm-zip')
const path = require('path')
const jsh = require('./json-helper.js')

const modes = {
	"extended": {
		"channelName": "master_metadata_album_artist_name",
		"trackName": "master_metadata_track_name"
	},
	"basic": {
		"channelName": "artistName",
		"trackName": "trackName"
	}
}

/**** DATA SAVING ****/

function saveFileZip (file, uid) {
	fs.mkdirSync('tmp/' + uid)
	fs.mkdirSync('tmp/' + uid + '/raw')
	fs.writeFileSync(`tmp/${uid}/raw/data.zip`, file.data)
}

function saveFileJson (file, uid) {
	fs.mkdirSync('tmp/' + uid)
	fs.mkdirSync('tmp/' + uid + '/extracted')
	fs.writeFileSync(`tmp/${uid}/extracted/data.json`, file.data)
}

function saveFile (file, uid) {
	console.log(`Starting saving for ${uid}`)
	if (file.mimetype === 'application/x-zip-compressed') {
		saveFileZip(file, uid)
	} else if (file.mimetype === 'application/json') {
		saveFileJson(file, uid)
	}
	console.log(`Ending saving for ${uid}`)
}


/**** DATA PREPROCESSING ****/

function preprocess (uid) {
	console.log(`Starting preprocessing for ${uid}`)
	let foldername = `tmp/${uid}`
	let rawFoldername = foldername + '/raw'
	fs.mkdirSync(foldername + '/data')
	fs.mkdirSync(foldername + '/extracted')
	files = fs.readdirSync(rawFoldername)
	files.forEach(file => {
		if (path.extname(file) == ".zip") {
			let zip = new zipper(rawFoldername + "/" + file)
			zip.getEntries().forEach(zipEntry => {
				fs.writeFileSync(`${foldername}/data/${zipEntry.entryName}`, zipEntry.getData().toString('utf8'))
			})
		}

		if (path.extname(file) == ".json") {
			fs.copyFileSync(`${foldername}/data/${file}`, `${foldername}/extracted/${file}`)
		}
	})
	console.log(`Finishing preprocessing for ${uid}`)
}


/**** DATA PROCESSING ****/

function guessMode (jsonData) {
	for (mode in modes) {
		if (jsonData[0][modes[mode]["trackName"]] != undefined) {
			console.log(`Chosing ${mode} for this`)
			return mode
		}
	}
	console.log("Unable to guess mode, chosing basic by default")
	return "basic"
}

function dataextractor_obj (jsonData) {

	let mode = guessMode(jsonData)

	let dict = {}
	let listened = {}

	for (elt of jsonData) {
		channelName = elt[modes[mode]["channelName"]]
		trackName = elt[modes[mode]["trackName"]]
		if (typeof(dict[channelName]) != "number") {
			dict[channelName] = 1
			listened[channelName] = {}
		} else {
			dict[channelName]++
		}

		if (typeof(listened[channelName][trackName]) != "number") {
			listened[channelName][trackName] = 1
		} else {
			listened[channelName][trackName]++
		}
	}

	return {
		dict: dict,
		listened: listened
	}

}

function dataextractor (uid) {

	console.log(`Starting extraction for ${uid}`)
	let jsonData = JSON.parse(fs.readFileSync(`tmp/${uid}/extracted/data.json`))
	console.log(`Finishing extraction for ${uid}`)
	return dataextractor_obj(jsonData)

}

function processor (uid) {
	let folder = `tmp/${uid}`
	let files = fs.readdirSync(folder + "/data")
	let processedFolder = `tmp/${uid}/extracted`
	let result = []
	files.forEach(file => {
		result = jsh.merger(result, JSON.parse(fs.readFileSync(folder + "/data/" + file)))
	})
	fs.writeFileSync(processedFolder + "/data.json", JSON.stringify(result))
}


/**** DATA CLEARING ****/

function deleteFile (uid) {
	fs.rmdirSync(`tmp/${uid}`, { recursive: true })
	console.log(`Deleted ${uid} folder`)
}

module.exports = {
	dataextractor: dataextractor,
	saveFile: saveFile,
	deleteFile: deleteFile,
	preprocess: preprocess,
	processor: processor
}