import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import formatNumberWithCommas from '../../../../util/NumberComma';

const Legend = ({ data, color, colorCenter, totalValue }) => {
    return (
        <div className="flex justify-between w-100%">
            <div className="mt-1">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center m-2">
                        <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: color(index) }}></div>
                        <div>{item.name}: {Math.round(item.value).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}</div>
                    </div>
                ))}

            </div>
            <div className="ml-4 flex items-center">
                <div className="w-3 h-3 m-2 rounded-full" style={{ backgroundColor: color(colorCenter) }}></div>
                <span className="font-semibold">Total Interest: </span> {`=  ${totalValue}`}
            </div>
        </div>

    );
};

const DiePieChart = ({ width, height, data }) => {
    const svgRef = useRef();
    const [hoveredData, setHoveredData] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('Total');
    const [totalValue, setTotalValue] = useState('0');
    const colorCenter = "#00f4d4";
    const selectedData = data[selectedPeriod] || [];

    const mounted = () => {
        const svg = d3.select(svgRef.current);
        const radius = Math.min(width, height) / 3;
        const innerRadius = radius / 2;
        const color = d3.scaleOrdinal(d3.schemeCategory10);
        const padding = 10;

        const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(radius);

        const hoverArc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(radius * 1.1 + padding);

        const pie = d3.pie()
            .sort(null)
            .value(d => d.value);


        const total = parseFloat(selectedData[0]?.value || 0) + parseFloat(selectedData[1]?.value || 0);

        setTotalValue(isNaN(total) ? 0 : total.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }));


        const arcs = pie(selectedData);

        svg.selectAll("*").remove();
        svg.append("circle")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("r", innerRadius)
            .attr("fill", colorCenter);
        const pieGroup = svg.append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        pieGroup.selectAll("path")
            .data(arcs)
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", (d, i) => color(i))
            .on("mouseover", function (event, d) {
                setHoveredData({ ...d, percentage: Math.round(d.value / parseFloat(total) * 100).toFixed(2) });
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("d", hoverArc);
            })
            .on("mouseout", function () {
                setHoveredData(null);
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("d", arc);
            })
            .append("title")
            .text(d => `${d.data.name} =  ${(d.value / parseFloat(total) * 100).toFixed(2)}%`);

        const totalValueText = svg.append("text")
            .text(formatNumberWithCommas(total))
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .style("font-size", "1em")
            .style("fill", "black");
    }

    useEffect(() => {
        mounted();
    }, [])
    useEffect(() => {
        mounted();
    }, [selectedData, width, height]);


    const handlePeriodChange = (period) => {
        setSelectedPeriod(period);
    };

    return (
        <div className="relative">
            <div className="flex justify-center space-x-4 transition-opacity duration-300">
                {Object.keys(data).map(period => (
                    <button
                        key={period}
                        className={`px-4 py-2 rounded-full focus:outline-none ${selectedPeriod === period ? 'bg-green-200 font-semibold ' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => handlePeriodChange(period)}
                    >
                        {period}
                    </button>
                ))}
            </div>
            <div className="font-semibold text-lg text-center mt-4">How much Interest has not been Paid...?</div>
            <svg className='block mx-auto transition-opacity duration-500' ref={svgRef} width={width} height={height}></svg>

            {!hoveredData || hoveredData.data !== selectedData ? (
                <div className="absolute left-0 ml-6 mb-6 transition-opacity duration-500">
                    <Legend data={selectedData} totalValue={totalValue} colorCenter={colorCenter} color={d3.scaleOrdinal(d3.schemeCategory10)} />
                </div>
            ) : null}
        </div>
    );
};

export default DiePieChart;