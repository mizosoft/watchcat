import mongoose from 'mongoose'

const checkSchema = new mongoose.Schema({
    name: String,
    url: String,
    // path: {
    //     type: String,
    //     default: ''
    // },
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
    intervalSeconds: {
        type: Number,
        default: 2
    },
    threshold: {
        type: Number,
        default: 1
    },
    retries: {
        type: Number,
        default: 0
    },
    retryDelaySeconds: {
        type: Number,
        default: 1
    },
    validation: {
        status: {
            type: Number,
            default: 200
        }
    },
    // ignoreSsl: Boolean, 
    // tags: Array,
});

export const Check = mongoose.model('Check', checkSchema);
