import mongoose from 'mongoose';

const SearchHistorySchema = new mongoose.Schema({
    locationName: { type: String, required: true },
    aqi: { type: Number, required: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('SearchHistory', SearchHistorySchema);
