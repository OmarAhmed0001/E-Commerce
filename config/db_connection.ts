import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

export default function db_connection(): void {
  mongoose
    .connect(MONGO_URI, { dbName: process.env.DB_NAME })
    .then(() => {
      console.log('MongoDB connected successfully'.green);
    })
    .catch((error) => {
      console.log('MongoDB connection failed'.red.bold);
      console.error(`${error.message}`.red);
      process.exit(1);
      // restart the server
    });
}
