import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const abbreviateNumber = (value) => {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + "M";
    } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + "K";
    } else {
        return value.toString();
    }
};

const DieBarChart = ({ data, width, height }) => {
    const svgRef = useRef();
    const tooltipRef = useRef();
    const [selectedData, setSelectedData] = useState("monthlyData");

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const tooltip = d3.select(tooltipRef.current);

        const margin = { top: 20, right: 50, bottom: 30, left: 50 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const selectedDataset = data[selectedData];
        let labels;
        if (selectedData === "monthlyData") {
            labels = selectedDataset.map(d => d.month);
        } else if (selectedData === "weeklyData") {
            labels = selectedDataset.map(d => d.week);
        } else if (selectedData === "yearlyData") {
            labels = selectedDataset.map(d => d.year);
        }


        const totalLendValues = selectedDataset.map(d => d.totalLend);
        const totalInterestValues = selectedDataset.map(d => d.totalInterest);

        const x = d3.scaleBand()
            .domain(labels)
            .range([0, chartWidth])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max([...totalLendValues, ...totalLendValues])])
            .nice()
            .range([chartHeight, 0]);

        const xAxis = d3.axisBottom(x).tickSizeOuter(0);
        const yAxis = d3.axisLeft(y)
            .tickFormat(abbreviateNumber);

        svg.selectAll("*").remove();

        const chart = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        chart.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${chartHeight})`)
            .call(xAxis);

        chart.append("g")
            .attr("class", "y-axis")
            .call(yAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("transform", "rotate(-45)");

        const numGroups = labels.length;
        const barWidth = x.bandwidth() / 2;

        chart.selectAll(".group")
            .data(selectedDataset)
            .enter()
            .append("g")
            .attr("class", "group")
            .attr("transform", d => `translate(${x(selectedData === "monthlyData" ? d.month : (selectedData === "weeklyData" ? d.week : d.year))}, 0)`)
            .each(function (d) {
                const group = d3.select(this);

                group.append("rect")
                    .attr("class", "totalLend-bar")
                    .attr("x", 0)
                    .attr("y", y(d.totalLend))
                    .attr("width", barWidth)
                    .attr("height", !totalLendValues.every(value => value === 0) ? chartHeight - y(d.totalLend) : 0)
                    .attr("fill", "steelblue")
                    .on("mouseover", function () {
                        d3.select(this).attr("fill", "lightsteelblue");
                        showTooltip(d);
                    })
                    .on("mouseout", function () {
                        d3.select(this).attr("fill", "steelblue");
                        if (currentData) {
                            showTooltip(currentData);
                        }
                    });

                group.append("rect")
                    .attr("class", "totalInterest-bar")
                    .attr("x", barWidth)
                    .attr("y", y(d.totalInterest))
                    .attr("width", barWidth)
                    .attr("height", !totalInterestValues.every(value => value === 0) ? chartHeight - y(d.totalInterest) : 0)
                    .attr("fill", "orange")
                    .on("mouseover", function () {
                        d3.select(this).attr("fill", "lightsalmon");
                        showTooltip(d);
                    })
                    .on("mouseout", function () {
                        d3.select(this).attr("fill", "orange");
                        if (currentData) {
                            showTooltip(currentData);
                        }
                    });
            });

        function showTooltip(d) {
            const [x, y] = d3.pointer(d);
            let monthrange = `Within " ${d.month} `;
            let weekrange = `From ${d.range}`;
            let yearrange = `${d.year}`;
            if (selectedData === "monthlyData") {
                const [month,] = d.month.split(', ');
                const currentMonth = currentDate.getMonth();
                const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                shortMonths[month] = shortMonths[currentMonth]
                if (currentMonth === shortMonths.indexOf(month)) {
                    monthrange = `THIS MONTH   ${d.month} `
                }
            } else if (selectedData === "weeklyData") {
                const [startMonthDay, endMonthDay] = d.range.split(' to ');
                const startDate = new Date(startMonthDay + ", " + currentDate.getFullYear());
                const endDate = new Date(endMonthDay + ", " + currentDate.getFullYear());


                if (currentDate >= startDate && currentDate <= endDate) {
                    weekrange = `THIS WEEK    from ${d.range} `
                };
            } else {
                if (d.year == currentDate.getFullYear()) {
                    yearrange = `THIS YEAR  ${d.year} `
                };
            }
            const dateLabel = selectedData === "monthlyData" ? monthrange : (selectedData === "weeklyData" ? weekrange : yearrange);
            const lendAmount = d.totalLend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const interestAmount = d.totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            const content = `
                <div style="
                    position: relative;
                    background: rgba(200, 200, 200, 0.1);
                    border: 2px solid #ccc;
                    border-radius: 4px;
                    padding: 8px 26px 8px 26px;
                    margin: 8px 50px 8px 50px;
                    font-family: Arial, sans-serif;
                    box-shadow: 0 2px 4px rgba(196, 220, 100, 0.5);
                    width: 430px;
                    max-width: 500px;
                    left: ${x}px;
                    top: ${y}px;
                ">
                    <strong>${dateLabel}</strong><br/>
                    <div style="
                    padding: 0px 0px 0px 26px; ">&bull; Total Lend:  ${lendAmount}</div>
                    <div style="
                    padding: 0px 0px 0px 26px;"> &bull; Total Interest: ${interestAmount}</div>
                </div>
            `;

            tooltip
                .style("opacity", 1)
                .html(content);
        }


        function hideTooltip() {
            tooltip.style("opacity", 0);
        }
        const currentDate = new Date();

        const currentData = selectedDataset.find(d => {
            const rangeParts = d.range.split(' to ');
            const startDate = new Date(rangeParts[0]);
            const endDate = new Date(rangeParts[1]);

            if (selectedData === "monthlyData") {
                return currentDate >= startDate && currentDate <= endDate;
            } else if (selectedData === "weeklyData") {
                const weekStartDate = new Date(startDate);
                const weekEndDate = new Date(startDate);
                weekEndDate.setDate(weekEndDate.getDate() + 6);
                return currentDate >= weekStartDate && currentDate <= weekEndDate;
            } else if (selectedData === "yearlyData") {
                return currentDate.getFullYear() === startDate.getFullYear();
            }
        });
        if (currentData) {
            showTooltip(currentData);
        }
    }, [selectedData, width, height]);


    const handleDataChange = (event) => {
        setSelectedData(event.target.value);
    };

    return (
        <div className="p-4 mx-auto">
            <div className="flex">
                <select
                    className="appearance-none bg-transparent border rounded-xl border-gray-300 text-gray-700 py-2 px-4 pr-8  border-xl leading-tight focus:outline-none  focus:border-gray-500 "
                    value={selectedData}
                    onChange={handleDataChange}
                >
                    <option value="monthlyData">Monthly</option>
                    <option value="weeklyData">Weekly</option>
                    <option value="yearlyData">Yearly</option>
                </select>

                <div className='ml-20 text-lg font-semibold'>Compare lending and interest with in a time.</div>


            </div>
            <svg className={`mb-${tooltipRef.current ? '0' : '32'}`} ref={svgRef} width={width} height={height}></svg>
            <div ref={tooltipRef} className="tooltip"></div>
        </div>
    );
};

export default DieBarChart;