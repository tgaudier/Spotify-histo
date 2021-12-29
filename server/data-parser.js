/**
 * Parses a json file + $uid or a zip file + $uid.
 * Prefix folder ($P) is /tmp/$uid
 * If zip file : 
 * Step 0 : Save file to $P/zipped/filename.zip
 * Step 1 : Extract and merge contained json file into one, and saving it to $P/given/hisory.json
 * If JSON file :
 * Step 1 : Save file to $P/given/history.json
 * In all cases, we now have only one JSON file in $P/given/history.json containing all given information.
 * Step 2 : Process $P/given/history.json to have an homogeneous representation. Example files are in /data/examples/vX/history.json. Result is saved in $P/data/history.json
 * On request of a specific page, these steps will be performed :
 * Step 3 : Process $P/data/history.json to $P/data/songlist.json. Example file is in /data/examples/vX/songlist.json.
 * Step 4 : Process $P/data/history.json to $P/data/artistdiscoveries.json. Example file is in /data/examples/vX/artistdiscoveries.json.
 * Step 5 : Process $P/data/history.json to $P/data/artistdetails.json. Example file is in /data/examples/vX/artistdetails.json.
 * **/
 








 module.exports = {
 	storeData = storeData,
 	preprocessData = preprocessData,
 	processes = {
 		"songlist": process_songlist,
 		"artistdiscoveries": process_artistdiscoveries,
 		"artistdetails": process_artistdetails
 	}
 }