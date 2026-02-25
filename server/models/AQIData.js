import mongoose from 'mongoose';

const AQIDataSchema = new mongoose.Schema({
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    locationName: { type: String },
    aqi: { type: Number, required: true },
    pollutants: {
        pm2_5: { type: Number },
        pm10: { type: Number },
        co: { type: Number },
        no2: { type: Number },
        o3: { type: Number },
        so2: { type: Number }
    },
    temperature: { type: Number },
    humidity: { type: Number },
    precipitation: { type: Number },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('AQIData', AQIDataSchema);
