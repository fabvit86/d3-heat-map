'use strict'

// return the heat color for a specific temperature variance:
function getHeatColor (tempVariance, heatArray) {
	return colors[heatArray.findIndex(t => t > tempVariance)]
}

// return a month's name:
function getMonthName (month) {
	return months[month-1]
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const colors = [
	"rgb(0, 84, 35)",
	"rgb(0, 104, 55)",
	"rgb(26, 152, 80)",
	"rgb(102, 189, 99)",
	"rgb(166, 217, 106)",
	"rgb(217, 239, 139)",
	"rgb(254, 224, 139)",
	"rgb(253, 174, 97)",
	"rgb(244, 109, 67)",
	"rgb(215, 48, 39)",
	"rgb(165, 0, 38)"
]

const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json'
$.getJSON(url, (json, textStatus) => {
	const baseTemperature = json.baseTemperature
	const data = json.monthlyVariance
	const numberOfElements = data.length
	
	const firstYear = d3.min(data, (d) => d.year),
				lastYear  = d3.max(data, (d) => d.year)
	const formatTime = d3.timeFormat('%B')
	const maxTempDiff = d3.max(data, (d) => d.variance),
	      minTempDiff = d3.min(data, (d) => d.variance)
	const heatSteps = colors.length - 1 // number of heat steps
	// temperature step between each heat color, based on the difference between the highest and lowest temperature variance:
	const tempStep = +(d3.format(".2f")((Math.abs(minTempDiff) + Math.abs(maxTempDiff)) / heatSteps))
	// heat steps array, every element is the max temperature for the corresponding heat color:
	let heatArray = [], currTemp = minTempDiff
	while (currTemp < maxTempDiff) {
		currTemp += tempStep
		heatArray.push(currTemp)
	}

	const margins = {top: 100, right: 20, bottom: 60, left: 120}
	const chartHeight = 600 - margins.top - margins.bottom
	const chartWidth = 1300 - margins.left - margins.right
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

  // subtitle:
  d3.select('#svgchart')
 		.append("text")
 			.classed("subtitle", true)
 			.text("Reference absolute temperature is 8.66 °C. Estimated Jan 1951-Dec 1980.")
 			.attr("x", "300px")
 			.attr("y", "30px")

  // legend (g element containing the heat colors as rect elements):
  const legendSquareWidth = 50,
  		  legendSquareHeight = 20
	d3.select('#svgchart')
 		.append("g")
 			.classed("legend", true)
 		.selectAll(".legendPoint")
 			.data(colors)
 		.enter()
 			.append("rect")
 				.classed("legendPoint", true)
 				.attr("fill", (d) => d)
 				.attr("width", legendSquareWidth)
	  		.attr("height", legendSquareHeight)
	  		.attr("x", (d, i) => (i + 6) * legendSquareWidth)
	  		.attr("y", "45px")
	  		.append("text")
	  			.classed("legendPointText", true)
 					.text((d, i) => heatArray[i])
 	// legend points text:
 	d3.select('#svgchart')
 		.append("g")				
 			.classed("legend", true)
 		.selectAll(".legendPointText")
 			.data(heatArray)
 		.enter()
 			.append("text")
 				.classed("legendPointText", true)
 				.text((d) => "<" + d3.format(".3f")(d) + " °C")
 				.attr("y", "75px")
 				.attr("x", (d, i) => (i + 6) * (legendSquareWidth+0.5))

  // tooltip div:
  const tooltip = d3.select('#mainContainer').append("div")
  									.classed("tooltip", true)
  									.style("opacity", 0) // start invisible

  // heat points (rects):
  const heatPointHeight = chartHeight / 12
  const heatPointWidth = chartWidth / (lastYear - firstYear)
  const heatPoint = svgchart.selectAll("g")
  	.data(data)
  .enter().append("rect")
  	.classed("heatPoint", true)
  	.attr("width", heatPointWidth)
	  .attr("height", heatPointHeight)
	  .attr("x", (d) => x(d.year))
	  .attr("y", (d) => (d.month - 1) * heatPointHeight)
	  .attr("fill", (d) => getHeatColor(d.variance, heatArray))
    .on("mouseover", function(d) {
    	const temperature = d3.format(".3f")(baseTemperature + d.variance) // absolute temperature of this month and year
    	d3.select(this).classed("overed", true) // add "overed" class to the rect
    	tooltip.transition()
    		.duration(300)
    		.style("opacity", 1) // show the tooltip
    	let tooltipContent = getMonthName(d.month) + " " + d.year +
    											"<br> Temperature: " + temperature + " °C" +
    											"<br> Variance: " + d.variance + " °C"
    	tooltip.html(tooltipContent)
       .style("left", (d3.event.pageX - d3.select('.tooltip').node().offsetWidth - 5) + "px")
       .style("top", (d3.event.pageY - d3.select('.tooltip').node().offsetHeight) + "px");
    })
    .on("mouseleave", function(d) {
    	d3.select(this).classed("overed", false)
    	tooltip.transition()
    		.duration(300)
    		.style("opacity", 0)
    	tooltip.html("")
    })

	//x axis line:
	const xAxis = svgchart.append('g')
									.classed("x-axis", true)
							    .attr("transform", "translate(0," + chartHeight + ")") // put the g on the bottom
							    .call(d3.axisBottom(x).tickValues(x.ticks()).tickFormat(d3.format("")))
  // x axis label:							    
	xAxis.append("text")
		.classed("axisLabel", true)
		.text("Year")
		.attr("dx", chartWidth / 2) // x offset
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
 		.attr("dx", -(chartHeight - 50) / 2) // x offset
 		.attr("dy", "-4.9em") // y offset
 		.attr("transform", "rotate(-90)") // rotate the label vertically
  xAxis.selectAll("text").style("text-anchor", "middle")
})
