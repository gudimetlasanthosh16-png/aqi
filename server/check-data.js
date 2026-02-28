import mongoose from 'mongoose';
import SearchHistory from './models/SearchHistory.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
const MONGODB_URI = process.env.MONGODB_URI;

async function checkData() {
    try {
        await mongoose.connect(MONGODB_URI);
        const searchHistory = await SearchHistory.find().limit(5);
        console.log('--- Search History ---');
        console.log(JSON.stringify(searchHistory, null, 2));

        const db = mongoose.connection.db;
        const colNames = (await db.listCollections().toArray()).map(c => c.name);
        console.log('--- Collections ---');
        console.log(colNames.join(', '));

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}

checkData();
