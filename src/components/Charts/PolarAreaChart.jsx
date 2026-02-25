import React from 'react';
import {
    Chart as ChartJS,
    RadialLinearScale,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import { PolarArea } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

const PolarAreaChart = ({ pollutants }) => {
    const chartData = {
        labels: ['PM2.5', 'PM10', 'CO', 'NO2', 'O3', 'SO2'],
        datasets: [
            {
                label: 'Distribution',
                data: [
                    pollutants.pm2_5,
                    pollutants.pm10,
                    pollutants.co / 100,
                    pollutants.no2,
                    pollutants.o3,
                    pollutants.so2
                ],
                backgroundColor: [
                    'rgba(0, 242, 254, 0.5)',
                    'rgba(79, 172, 254, 0.5)',
                    'rgba(192, 132, 252, 0.5)',
                    'rgba(244, 63, 94, 0.5)',
                    'rgba(245, 158, 11, 0.5)',
                    'rgba(16, 185, 129, 0.5)'
                ],
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                },
                angleLines: {
                    color: 'rgba(255, 255, 255, 0.05)'
                },
                ticks: {
                    display: false
                }
            }
        },
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: 'rgba(255, 255, 255, 0.6)',
                    font: {
                        size: 10,
                        family: 'Outfit'
                    }
                }
            }
        }
    };

    return <PolarArea data={chartData} options={options} />;
};

export default PolarAreaChart;
