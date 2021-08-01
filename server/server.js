const express = require('express')
const path = require('path')
const ejs = require('ejs')
const fs = require('fs')
const dp = require('./data-processor.js')
const ids = require('./ids.js')

const cors = require('cors')

const jsh = require('./json-helper.js')

const app = express()
const port = 8080

var fileupload = require("express-fileupload");
app.use(fileupload())
app.use(cors())

app.use(express.static('public'))


app.post('/loadfile', (req, res) => {
	
	let uid = ids.getId()

	let file = req.files.spothistory
	dp.saveFile(file, uid)
	dp.preprocess(uid)
	dp.processor(uid)

	res.redirect(`/app?uid=${uid}`)
})

app.get('/delete', (req, res) => {
	let uid = req.query.uid

	dp.deleteFile(uid)

	res.redirect('/')
})

app.get('/', (req, res) => {
	res.render("upload.ejs")
})

app.get('/app', (req, res) => {

	let uid = req.query.uid
	res.render("main.ejs", {uid: uid})

})

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

app.get('/favicon.ico', (req, res) => {
	res.status(204).end()
})

app.listen(port, () => {
	console.log(`Server started at http://localhost:${port}`)
})