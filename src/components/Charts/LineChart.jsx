import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const LineChart = ({ data, color }) => {
    const chartData = {
        labels: data.map(d => new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
        datasets: [
            {
                label: 'AQI Value',
                data: data.map(d => d.aqi),
                borderColor: color || '#10b981',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, `${color}66` || '#10b98166');
                    gradient.addColorStop(1, 'transparent');
                    return gradient;
                },
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
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
                titleFont: { size: 14 },
                bodyFont: { size: 14 },
                borderRadius: 8,
                displayColors: false
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
                    color: 'rgba(255, 255, 255, 0.5)',
                    stepSize: 1
                },
                min: 0,
                max: 6
            }
        }
    };

    return <Line data={chartData} options={options} />;
};

export default LineChart;
