import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log("URI:", process.env.MONGO_URI);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      family: 4,
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB connected:", conn.connection.host);
  } catch (err) {
    console.log("============== ERROR ==============");
    console.log("Name:", err.name);
    console.log("Message:", err.message);
    console.log("Code:", err.code);
    console.log("Cause:", err.cause);
    console.dir(err, { depth: null });
    console.log("===================================");
  }
};