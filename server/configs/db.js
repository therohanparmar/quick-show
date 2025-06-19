import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log('Database Successfully Connected'))
        await mongoose.connect(`${process.env.MONGODB_URI}/quick-show`);
    } catch (error) {
        console.log(error.message);
    }
}

export default connectDB;