import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log('🔗 Attempting to connect to MongoDB...');
    
    // ✅ DEBUG: Check if environment variable is loaded
    console.log('🔍 Environment variable check:');
    console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
    console.log('PORT exists:', !!process.env.PORT);
    console.log('FRONTEND_URL exists:', !!process.env.FRONTEND_URL);
    
    if (!process.env.MONGO_URI) {
      console.log('❌ MONGO_URI is not defined in environment variables');
      console.log('💡 Available environment variables:');
      console.log(Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('URI')));
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    console.log('📡 Connecting to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('💡 Troubleshooting tips:');
    console.log('1. Check if MongoDB Atlas cluster is running');
    console.log('2. Verify your IP is whitelisted in MongoDB Atlas');
    console.log('3. Check your internet connection');
    console.log('4. Verify the MongoDB connection string is correct');
    process.exit(1);
  }
};

export default connectDB;