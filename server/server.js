
// Import of external modules
const express = require('express')
const path = require('path')
const ejs = require('ejs')
const fs = require('fs')
const cookieParser = require('cookie-parser')
const cors = require('cors')
var fileupload = require("express-fileupload");

// Import of local modules
const CONSTS = require('./consts.js')
const dp = require('./data-parser.js')
const ids = require('./ids.js')
const jsh = require('./json-helper.js')

// App creation and setup
const app = express()
const port = CONSTS.port

app.use(fileupload())
app.use(cors())
app.use(cookieParser())

app.use(express.static('public'))

// Routes

app.get('/', (req, res) => {

	if (req.cookies != undefined && req.cookies.uid != undefined) {
		res.redirect('/songlist')
	} else {
		res.redirect('/upload')
	}
})

app.get('/upload', (req, res) => {
	res.render("upload.ejs")
})

app.get('/songlist', (req, res) => {
	if (req.cookies != undefined && req.cookies.uid != undefined) {
		res.render("songlist.ejs", {data: dp.processes["songlist"](req.cookies.uid)})
	} else {
		console.log(`Unknown cookie : ${req.cookies}`)
		res.redirect('/upload')
	}
})

app.get('/artistdiscoveries', (req, res) => {
	if (req.cookies != undefined && req.cookies.uid != undefined) {
		res.render("artistdiscoveries.ejs", {data: dp.processes["artistdiscoveries"](req.cookies.uid)})
	} else {
		console.log(`Unknown cookie : ${req.cookies}`)
		res.redirect('/upload')
	}
})

app.get('/artistdetails', (req, res) => {
	if (req.cookies != undefined && req.cookies.uid != undefined) {
		res.render("artistdetails.ejs", {data: dp.processes["artistdetails"](req.cookies.uid)})
	} else {
		console.log(`Unknown cookie : ${req.cookies}`)
		res.redirect('/upload')
	}
})

app.post('/loadfile', (req, res) => {
	const uid = ids.getId()

	const file = req.files.spothistory

	if (CONSTS.accepted_mime_types.includes(file.mimetype)) {
		dp.storeData(uid, req.files.spothistory)
		dp.preprocessData(uid)

		res.cookie("uid", uid)
		res.redirect('/songlist')
	} else {
		console.log(req.files.spothistory.mimetype)
		res.redirect('/upload')
	}
})

app.get('/delete', (req, res) => {
	if (req.cookies != undefined && req.cookies.uid != undefined) {
		dp.deleteFolder(req.cookies.uid)
	}

	res.clearCookie("uid")
	res.redirect('/')
})

/*
app.get('/data', (req, res) => {
	let uid = req.query.uid
	let processed = req.query.processed

	console.log(`Requested data for ${uid}`)

	if (processed == 'true') {
		res.json(dp.dataextractor(uid))
	} else {
		res.header("Content-Type",'application/json');
    	res.sendFile(path.join(__dirname, `tmp/${uid}/extracted/data.json`))
	}
})
*/

app.get('/favicon.ico', (req, res) => {
	res.status(204).end()
})

// Server start

app.listen(port, () => {
	console.log(`Server started at http://localhost:${port}`)
})