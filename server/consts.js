module.exports = {
	// Server pararmeters
	port: 8080,

	// File parameters
	accepted_mime_types: ["application/json", "application/x-zip-compressed"],

	// Preprocessing parameters
	data_format: "1.0",
	modes: {
		"basic": {
			"artist_name": "artistName",
			"song_name": "trackName",
			"play_date": "endTime"
		},
		"extended": {
			"artist_name": "master_metadata_album_artist_name",
			"song_name": "master_metadata_track_name",
			"play_date": "ts"
		}
	}


}