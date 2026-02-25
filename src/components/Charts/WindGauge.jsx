import React from 'react';
import { motion } from 'framer-motion';
import { Wind, Navigation } from 'lucide-react';

const WindGauge = ({ speed, direction = 0 }) => {
    return (
        <div className="wind-gauge-container">
            <div className="gauge-header">
                <Wind size={16} />
                <span className="mono">WIND_VECTOR</span>
            </div>

            <div className="gauge-body">
                <div className="compass-rim">
                    <span className="n">N</span>
                    <span className="e">E</span>
                    <span className="s">S</span>
                    <span className="w">W</span>

                    <motion.div
                        className="compass-arrow"
                        animate={{ rotate: direction }}
                        transition={{ type: 'spring', stiffness: 50 }}
                    >
                        <Navigation size={32} fill="var(--primary)" color="var(--primary)" />
                    </motion.div>
                </div>

                <div className="wind-info">
                    <div className="speed mono">
                        {speed}
                        <small>km/h</small>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default WindGauge;
