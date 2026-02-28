import mongoose from 'mongoose';

const UserLocationSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, index: true },
    locationName: { type: String },
    aqi: { type: Number },
    temperature: { type: Number },
    humidity: { type: Number },
    lat: { type: Number },
    lon: { type: Number },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('UserLocation', UserLocationSchema);
