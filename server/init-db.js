import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/airsense';

async function initializeMongoDB() {
    try {
        console.log(`📡 Connecting to MongoDB: ${MONGODB_URI}...`);
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;

        console.log('✅ Connected. Initializing separate collections in AirSense database context...');

        const collections = ['users', 'searchhistories', 'userlocations', 'aqidatas'];
        const existingCollections = await db.listCollections().toArray();
        const existingNames = existingCollections.map(c => c.name);

        for (const col of collections) {
            if (!existingNames.includes(col)) {
                await db.createCollection(col);
                console.log(`   - Collection [${col}] created successfully.`);
            } else {
                console.log(`   - Collection [${col}] already exists.`);
            }
        }

        console.log('\n🚀 AirSense MongoDB structure is now fully live.');
        console.log('   - [users]: Stores private user details.');
        console.log('   - [searchhistories]: Stores area search logs with AQI/Temp/Humidity.');
        console.log('   - [userlocations]: Tracks real-time user node mapping.');

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Database Initialization Error:', err.message);
        process.exit(1);
    }
}

initializeMongoDB();
