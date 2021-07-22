const express = require('express')
const fs = require('fs')
const ejs = require('ejs')

const app = express()
const port = 8080

app.use(express.static('public'))

var data = fs.readFileSync('data/history.json')
data = JSON.parse(data)

dict = {}
listened = {}

for (elt of data) {
	channelName = elt["artistName"]
	trackName = elt["trackName"]
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

console.log(listened)

app.get('/', (req, res) => {
//	console.log(json_data)
	res.render("main.ejs", {channels: dict, listened: listened})
})

app.get('/favicon.ico', (req, res) => {
	res.status(204).end()
})

app.listen(port, () => {
	console.log(`Server started at http://localhost:${port}`)
})