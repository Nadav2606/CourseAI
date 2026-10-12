import mongoose from "mongoose";

const globalForMongoose = global;

export default async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is not set");
  }

  if (globalForMongoose.__mongooseConnection) {
    console.log("MongoDB already connected to:", mongoose.connection.name);

    return globalForMongoose.__mongooseConnection;
  }

  globalForMongoose.__mongooseConnection = await mongoose.connect(uri);

  const databaseName = globalForMongoose.__mongooseConnection.connection?.name;
  if (databaseName) {
    console.log("MongoDB connected to:", databaseName);
  }

  return globalForMongoose.__mongooseConnection;
}
