import mongoose from 'mongoose'

const checkSchema = new mongoose.Schema({
    name: String,
    url: String,
    method: {
        type: String,
        default: 'GET'
    },
    headers: {
        type: Array,
        default: {}
    },
    // protocol: String,
    // port: Number,
    // webhook: String,
    timeoutSeconds: {
        type: Number,
        default: 5
    },
    delaySeconds: {
        type: Number,
        default: 0
    },
    intervalSeconds: {
        type: Number,
        default: 2
    },
    threshold: {
        type: Number,
        default: 1
    },
    // retries: {
    //     type: Number,
    //     default: 0
    // },
    // retryDelaySeconds: {
    //     type: Number,
    //     default: 2
    // },
    validation: {
        status: {
            type: Number,
            default: 200
        }
    },
    // ignoreSsl: Boolean, 
    // tags: Array,
});

const Check = mongoose.model('Check', checkSchema);

export default { 
    create(body) {
        const check = new Check(body);
        return check.save();
    },
    
    list() {
        return Check.find();
    },

    clear() {
        return Check.deleteMany();
    }
}
