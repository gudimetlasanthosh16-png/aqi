import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
const MONGODB_URI = process.env.MONGODB_URI;

async function testConn() {
    try {
        console.log('📡 Env path:', path.join(__dirname, '.env'));
        console.log('📡 Attempting connection with URI:', MONGODB_URI);
        if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined in .env');

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Success! Mongoose connected to MongoDB.');
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    }
}

testConn();
