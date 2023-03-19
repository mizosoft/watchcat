import mongoose, { ObjectId } from 'mongoose'

const reportSchema = new mongoose.Schema({
    checkId: String,
    status: String,
    availability: Number,
    outages: Number,
    uptimeSeconds: Number,
    downtimeSeconds: Number,
    averageResponseTimeMillis: Number,
    lastEventId: ObjectId,
});

const Report = mongoose.model('Report', reportSchema);
