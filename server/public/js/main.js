window.onload = function () {

	data_l = Object.entries(data)
	listened_l = Object.entries(listened)

	console.log(data_l)
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
						 .text(function (d, i) { return d })

	let row_bod =  tbody.selectAll("tr:not(.subhead_row)")
						.data(function(d, i) { return Object.entries(listened[d[0]]) })
						.enter()
						.append("tr")

	let cel_bod = row_bod.selectAll("td")
						 .data(function (d, i) { return d})
						 .enter()
						 .append("td")
						 .text(function (d, i) { return "\t" + d})


	row_bod.sort((a, b) => { return d3.ascending(b[1], a[1])})
	tbody.sort((a, b) => {return d3.ascending(b[1], a[1]) })



}