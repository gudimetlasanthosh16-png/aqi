import React from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

const PieChart = ({ pollutants }) => {
    const chartData = {
        labels: ['PM2.5', 'PM10', 'CO', 'NO2', 'O3', 'SO2'],
        datasets: [
            {
                data: [
                    pollutants.pm2_5,
                    pollutants.pm10,
                    pollutants.co / 100, // Normalized
                    pollutants.no2,
                    pollutants.o3,
                    pollutants.so2
                ],
                backgroundColor: [
                    '#10b981',
                    '#0ea5e9',
                    '#f59e0b',
                    '#f43f5e',
                    '#a855f7',
                    '#ec4899'
                ],
                borderWidth: 0,
                hoverOffset: 20
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    font: { size: 10 },
                    padding: 20,
                    usePointStyle: true
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                borderRadius: 8
            }
        }
    };

    return <Pie data={chartData} options={options} />;
};

export default PieChart;
