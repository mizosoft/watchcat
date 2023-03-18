import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema({
    checkId: String,
    status: String,
    availability: Number,
    outages: Number,
    uptimeSeconds: Number,
    downtimeSeconds: Number,
    averageResponseTimeMillis: Number,
});

const Report = mongoose.model('Event', reportSchema);

export default { 
    create(data) {
        const check = new Report(data);
        return check.save();
    },
    
    list() {
        return Report.find();
    }
}
