import React, { Component } from 'react';
import CanvasJSReact from '../../canvasjs.react';

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

class ChartBar extends Component {
    render() {
        const options = {
            animationEnabled: true,
            exportEnabled: true,
            theme: "light2",
            title: {
                text: this.props.title
            },
            axisY: {
                title: this.props.yTitle,
                includeZero: false
            },
            data: [{
                type: "column",
                indexLabel: "{y}",
                indexLabelFontColor: "#5A5757",
                indexLabelPlacement: "outside",
                dataPoints: this.props.data
            }]
        }
        return (
            <div>
                <CanvasJSChart options={options} />
            </div>
        )
    }
}

export default ChartBar
