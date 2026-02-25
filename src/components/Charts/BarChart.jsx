import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const BarChart = ({ pollutants }) => {
    const chartData = {
        labels: ['PM2.5', 'PM10', 'CO', 'NO2', 'O3', 'SO2'],
        datasets: [
            {
                label: 'Concentration (µg/m³)',
                data: [
                    pollutants.pm2_5,
                    pollutants.pm10,
                    pollutants.co / 100, // Normalized for better scale
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
                borderRadius: 8,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                borderRadius: 8
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.5)'
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.5)'
                }
            }
        }
    };

    return <Bar data={chartData} options={options} />;
};

export default BarChart;
