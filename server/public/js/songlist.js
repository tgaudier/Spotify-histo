
let datepicker_start, datepicker_end


function request_data (start_date, end_date) {
		fetch(`/data?start_date=${start_date}&end_date=${end_date}`)
			.then(response => response.json())
			.then(response => process_response(response))
}

function set_limit_dates (response) {

	datepicker_start.value = (new Date(response["min"])).toISOString().substring(0, 10)
	datepicker_end.value = (new Date(response["max"])).toISOString().substring(0, 10)

}

function process_response (response) {
		set_limit_dates(response)

		d3.select("table").selectAll('tbody').remove()
		data_l = Object.entries(response["d"])

		let tbody =  d3.select("table")
					.selectAll("tbody")
		  			.data(data_l)
		  			.enter()
		  			.append("tbody")

		let row_hea = tbody.append("tr")
		let cel_hea = row_hea.attr("class", "subhead_row")
							 .selectAll("th")
							 .data(function(d, i) { return d })
							 .enter()
							 .append("th")
							 .attr("class", "subhead")
							 .text(function (d, i) { 
							 	if (typeof d == "object")
							 		return d["occurences"]
							 	else
							 		return d
							 })

		let row_bod =  tbody.selectAll("tr:not(.subhead_row)")
							.data(function(d, i) { return Object.entries(d[1].songs) })
							.enter()
							.append("tr")

		let cel_bod = row_bod.selectAll("td")
							 .data(function (d, i) { return d})
							 .enter()
							 .append("td")
							 .text(function (d, i) { return d})


		row_bod.sort((a, b) => { return d3.descending(a[1], b[1]) })
		tbody.sort((a, b) => { return d3.descending(a[1]["occurences"], b[1]["occurences"]) })
}

window.onload = async function () {

	datepicker_start = document.getElementById("start_date")
	datepicker_end = document.getElementById("end_date")
	datepicker_start.value = ""
	datepicker_end.value = ""

	filterform = document.getElementById("filterform")
	
	filterform.addEventListener("submit", (e) => {
		e.preventDefault()
		if (filterform.checkValidity()) {
			request_data(Date.parse(start_date.value), Date.parse(end_date.value))
		} else {
			console.log("invalid form")
		}
	})

	const response = await request_data(-1, -1)

	datepicker_start.min = datepicker_start.value
	datepicker_start.max = datepicker_end.value

	datepicker_end.min = datepicker_start.value
	datepicker_end.max = datepicker_end.value



}