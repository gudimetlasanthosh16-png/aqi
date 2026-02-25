import React from 'react';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

const RadarChart = ({ pollutants }) => {
    const chartData = {
        labels: ['PM2.5', 'PM10', 'CO', 'NO2', 'O3', 'SO2'],
        datasets: [
            {
                label: 'Atmospheric Composition',
                data: [
                    pollutants.pm2_5,
                    pollutants.pm10,
                    pollutants.co / 100, // Scaling for visual balance
                    pollutants.no2,
                    pollutants.o3,
                    pollutants.so2
                ],
                backgroundColor: 'rgba(0, 242, 254, 0.2)',
                borderColor: '#00f2fe',
                borderWidth: 2,
                pointBackgroundColor: '#00f2fe',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#00f2fe',
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                angleLines: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                pointLabels: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    font: {
                        size: 10,
                        family: 'Outfit'
                    }
                },
                ticks: {
                    display: false,
                    stepSize: 20
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                borderRadius: 8,
                titleFont: { family: 'Outfit', size: 14 },
                bodyFont: { family: 'Outfit', size: 12 }
            }
        }
    };

    return <Radar data={chartData} options={options} />;
};

export default RadarChart;
