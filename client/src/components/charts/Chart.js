import React, { Component } from 'react';
import CanvasJSReact from '../../../src/canvasjs.react';

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

class Chart extends Component {
    render() {
        const options = {
            animationEnabled: true,
            title: {
                text: this.props.title
            },
            axisY: {
                title: this.props.yTitle
            },
            toolTip: {
                shared: true
            },
            data: [{
                type: "spline",
                name: this.props.name,
                showInLegend: false,
                dataPoints: this.props.data
            }]
        }
        return (
            <div>
                <CanvasJSChart options={options} />
            </div>
        );
    }
}

export default Chart
