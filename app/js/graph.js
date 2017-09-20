'use strict'

const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json'
$.getJSON(url, (json, textStatus) => {
	const baseTemperature = json.baseTemperature
	const data = json.monthlyVariance
	const numberOfElements = data.length
	const months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	]
	const firstYear = d3.min(data, (d) => d.year),
				lastYear  = d3.max(data, (d) => d.year)
	const formatTime = d3.timeFormat('%B')

	const margins = {top: 20, right: 20, bottom: 60, left: 120}
	const chartHeight = 600 - margins.top - margins.bottom
	const chartWidth = 1000 - margins.left - margins.right
	const barWidth = chartWidth / numberOfElements

	// x scale (years):
	const x = d3.scaleLinear()
							.domain([firstYear, lastYear])
							.range([0, chartWidth])

	// y scale (months):
	const y = d3.scaleTime()
							.domain([new Date(2001, 0, 1), new Date(2000, 0, 1)]) // use 13 months to have extra space
							.range([chartHeight, 0])

	// svg chart:
	const svgchart = d3.select('#svgchart') // select the svg element
										.attr("width", chartWidth + margins.left + margins.right) // set the width of the chart
										.attr("height", chartHeight + margins.top + margins.bottom) // set the height of the chart
										.append("g") // add this g to set left and top margins
    									.attr("transform", "translate(" + margins.left + "," + margins.top + ")")

  // tooltip div:
  const tooltip = d3.select('#mainContainer').append("div")
  									.classed("tooltip", true)
  									.style("opacity", 0) // start invisible

  // heat points (rects):
  const heatPointHeight = chartHeight / 12
  const heatPoint = svgchart.selectAll("g")
  	.data(data)
  .enter().append("rect")
  	.classed("heatPoint", true)
  	.attr("width", 10)
	  .attr("height", heatPointHeight)
	  .attr("x", (d) => x(d.year))
	  .attr("y", (d) => (d.month - 1) * heatPointHeight)
  	// .attr("r", 4) // circle radius
  	// .attr("cx", (d) => x(parseTimeToDate(d.Time))) // circle x coord
   //  .attr("cy", (d) => y(d.Place)) // circle y coord
   //  .attr("class", (d) => d.Doping ? "doped" : "clean")
    // .on("mouseover", function(d) {
    // 	d3.select(this).classed("overed", true) // add "overed" class to the rect
    // 	tooltip.transition()
    // 		.duration(300)
    // 		.style("opacity", 1) // show the tooltip
    // 	let tooltipContent = d.Name + 
    // 											"<br><span class='smallText'>Year: " + d.Year + " - Time: " + d.Time +"</span>" + 
    // 											"<br><span class='smallText'>Rank: " + d.Place + " - Nationality: " + d.Nationality + "</span>"
    //   if (d.Doping) tooltipContent += "<hr><span class='smallText'>" + d.Doping + "</span>"
    // 	tooltip.html(tooltipContent)
    //    .style("left", (d3.event.pageX - d3.select('.tooltip').node().offsetWidth - 5) + "px")
    //    .style("top", (d3.event.pageY - d3.select('.tooltip').node().offsetHeight) + "px");
    // })
    // .on("mouseleave", function(d) {
    // 	d3.select(this).classed("overed", false)
    // 	tooltip.transition()
    // 		.duration(300)
    // 		.style("opacity", 0)
    // 	tooltip.html("")
    // })

	//x axis line:
	const xAxis = svgchart.append('g')
									.classed("x-axis", true)
							    .attr("transform", "translate(0," + chartHeight + ")") // put the g on the bottom
							    .call(d3.axisBottom(x).tickValues(x.ticks()).tickFormat(d3.format("")))
  // x axis label:							    
	xAxis.append("text")
		.classed("axisLabel", true)
		.text("Year")
		.attr("dx", "20em") // x offset
		.attr("dy", "2.5em") // y offset
  xAxis.selectAll("text").style("text-anchor", "middle") // center x axis ticks' text
	
	//y axis line:
	const yAxis = svgchart.append('g')
									.classed("y-axis", true)
								 	.call(d3.axisLeft(y).tickFormat(formatTime))
  yAxis.selectAll("g.tick:first-of-type text").html("") // remove the extra month tick text
  yAxis.selectAll("g.tick text").attr("dy", "2em") // center every month's name in between ticks
  // y axis label:
	yAxis.append("text")
 		.attr("id", "yAxisLabel")
 		.classed("axisLabel", true)
 		.text("Month")
 		.attr("dx", "-13em") // x offset
 		.attr("dy", "-4.9em") // y offset
 		.attr("transform", "rotate(-90)") // rotate the label vertically
  xAxis.selectAll("text").style("text-anchor", "middle")

 	// legend:
 // 	d3.select('#svgchart')
 // 		.append("circle")
 // 			.attr("r", 4)
 // 			.attr("cx", "10em")
 // 			.attr("cy", "2em")
 // 			.classed("clean", true)
	// d3.select('#svgchart')
	// 	.append('text')
	// 	.text("No doping allegations")
	// 	.attr("dx", "10.5em")
	// 	.attr("dy", "2.25em")
	// d3.select('#svgchart')
 // 		.append("circle")
 // 			.attr("r", 4)
 // 			.attr("cx", "10em")
 // 			.attr("cy", "4em")
 // 			.classed("doped", true)
	// d3.select('#svgchart')
	// 	.append('text')
	// 	.text("Has doping allegations")
	// 	.attr("dx", "10.5em")
	// 	.attr("dy", "4.25em")
})
