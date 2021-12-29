/**
 * Parses a json file + $uid or a zip file + $uid.
 * Prefix folder ($P) is /tmp/$uid
 * If zip file : 
 * Step 0 : Save file to $P/zipped/filename.zip
 * Step 1 : Extract and merge contained json file into one, and saving it to $P/given/hisory.json
 * If JSON file :
 * Step 1 : Save file to $P/given/history.json
 * In all cases, we now have only one JSON file in $P/given/history.json containing all given information.
 * Step 2 : Pre-process $P/given/history.json to have an homogeneous representation. Example files are in /data/examples/vX/history.json. Result is saved in $P/data/history.json
 * On request of a specific page, these steps will be performed. Data is returned by the different functions according to example files.
 * Step 3 : Process $P/data/history.json for listing songs occurences. Example file is in /data/examples/vX/songlist.json.
 * Step 4 : Process $P/data/history.json for listing first artists occurences. Example file is in /data/examples/vX/artistdiscoveries.json.
 * Step 5 : Process $P/data/history.json for listing detailed history for each artist. Example file is in /data/examples/vX/artistdetails.json.
 * **/
 
const fs = require('fs')
const zipper = require('adm-zip')
const path = require('path')
const jsh = require('./json-helper.js')
const CONSTS = require('./consts.js')

const assert = require('assert')

/** ZIP CASE **/

// Step 0 :

// Saves the given zip file to $P/zipped/history.zip
function saveZip (uid, file) {
	fs.mkdirSync(`tmp/${uid}/zipped`)
	fs.writeFileSync(`tmp/${uid}/zipped/history.zip`, file.data)
}

// Step 1 :

// Extracts the zip file from $P/zipped/history.zip to $P/zipped/extract/*
function extract (uid) {
	fs.mkdirSync(`tmp/${uid}/zipped`)
	fs.mkdirSync(`tmp/${uid}/zipped/extract`)
	const zip = new zipper(`tmp/${uid}/zipped/history.zip`)
	zip.getEntries().forEach(zipEntry => {
		fs.writeFileSync(`tmp/${uid}/zipped/extract/${zipEntry.entryName}`, zipEntry.getData().toString('utf8'))
	})
}

// Merges the JSON files from $P/zipped/extract/* to $P/given/history.json
function merge (uid) {
	const extract_folder = `tmp/${uid}/zipped/extract`
	const files = fs.readdirSync(extract_folder)
	result = {}
	files.forEach(file => {
		if (file.split('.')[1] == ".json")
		result = jsh.merger(result, JSON.parse(fs.readFileSync(`${extract_folder}/${file}`)))
	})
	fs.writeFileSync(`tmp/${uid}/given/history.json`, JSON.stringify(result))
	fs.rmSync(`tmp/${uid}/zipped/extract`)
}

/** JSON CASE **/

// STEP 1 :

// Saves the provided file to $P/given/history.json
function saveJson (uid, file) {
	fs.writeFileSync(`tmp/${uid}/given/history.json`, file.data)
}

/** GENERAL CASE **/

// Entry point for saving a file, using JSON or ZIP depending on the MIME type of the provided file
function storeData (uid, file) {

	fs.mkdirSync(`tmp/${uid}`)
	fs.mkdirSync(`tmp/${uid}/given`)

	if (file.mimetype == "application/x-zip-compressed") {
		saveZip (uid, file)
		extract(uid)
		merge(uid)
	} else if (file.mimetype == "application/json") {
		saveJson (uid, file)
	}
}

// STEP 2 :

// Entry point for preprocessing the data present in $P/given/history.json to generate $P/data/history.json
function preprocessData (uid) {
	if (CONSTS.data_format == "1.0") {
		fs.mkdirSync(`tmp/${uid}/data`)
		full_data = JSON.parse(fs.readFileSync(`tmp/${uid}/given/history.json`))
		fs.writeFileSync(`tmp/${uid}/data/history.json`, JSON.stringify(preprocessJSON_1_0 (full_data)))
	}
}

// Guesses the data storage usage according to one entry. The correspondance between general fields and specific fields must be given in consts.js according to examples.
function guessMode (elem) {
	if (elem[CONSTS.modes["basic"]["artist_name"]] != undefined) {
		return "basic"
	}
	if (elem[CONSTS.modes["extended"]["artist_name"]] != undefined) {
		return "extended"
	}
	console.log(`Unable to guess data format with ${uid}`)
	return undefined
}

// Turns a Date object to a string in "YYYY-MM-DD HH:MM" format
function date_readable (timestamp) {
	date = new Date(timestamp)
	const m = date.getMonth() + 1
	const d = date.getDate()
	const h = date.getHours()
	const n = date.getMinutes()

	return [[
		date.getFullYear(),
		(m > 9 ? '' : '0') + m,
		(d > 9 ? '' : '0') + d
		].join('-'),
		[
		(h > 9 ? '' : '0') + h,
		(n > 9 ? '' : '0') + n
		].join(':')
	].join(' ')
}

/** V1.0 SPECIFIC **/
// Preprocesses the data present in $P/given/history.json to generate $P/data/history.json according to V1.0 history data format
function preprocessJSON_1_0 (data) {
	played = []

	mode = guessMode(data[0])

	if (mode != undefined) {
		for (elem of data) {
			played.push(preprocessJSON_1_0_single(elem, mode))
		}
	}
	return {
		"version": "1.0",
		"played": played
	}
}

// Turns one specific history entry in one general entry using a mode guessed previously.
function preprocessJSON_1_0_single (elem, mode) {
	attr = CONSTS.modes[mode]
	return {
		"song": elem[attr["song_name"]],
		"artist": elem[attr["artist_name"]],
		"date": date_readable(Date.parse(elem[attr["play_date"]]))
	}
}



// STEP 3 :

function process_songlist (uid) {

	data = JSON.parse(fs.readFileSync(`tmp/${uid}/data/history.json`))
	assert.equal(data.version, CONSTS.data_format)
	result = {}

	for (elem of data.played) {

		song_name = elem.song
		artist_name = elem.artist

		if (result[artist_name] == undefined) {
			result[artist_name] = {
				"occurences": 0,
				"songs": {
				}
			}
		} 
		result[artist_name]["occurences"]++
		if (result[artist_name]["songs"][song_name] == undefined) {
			result[artist_name]["songs"][song_name] = 0
		}
		result[artist_name]["songs"][song_name]++
	}

	return result
}

// STEP 4 :

function process_artistdiscoveries (uid) {
	data = JSON.parse(fs.readFileSync(`tmp/${uid}/data/history.json`))
	assert.equal(data.version, CONSTS.data_format)
}

// STEP 5 :

function process_artistdetails (uid) {
	data = JSON.parse(fs.readFileSync(`tmp/${uid}/data/history.json`))
	assert.equal(data.version, CONSTS.data_format)
}

/** END OF V1.0 SPECIFIC **/

 module.exports = {
 	storeData: storeData,
 	preprocessData: preprocessData,
 	processes: {
 		"songlist": process_songlist,
 		"artistdiscoveries": process_artistdiscoveries,
 		"artistdetails": process_artistdetails
 	}
 }