import mongoose from 'mongoose'

const statusSchema = new mongoose.Schema({
  checkId: {
    type: String,
    index: true,
  },
  status: String,
  reason: String,
  when: Date,
  responseTimeMillis: Number,
}, {
  statics: {
    ok(checkId, responseTime) {
      return new Status({
        checkId: checkId,
        status: 'ok',
        reason: '',
        when: Date.now(),
        responseTime: responseTime
      })
    },

    invalid(checkId, reason, responseTime) {
      return new Status({
        checkId: checkId,
        status: 'invalid',
        reason: reason,
        when: Date.now(),
        responseTime: responseTime
      })
    },

    error(checkId, err) {
      return new Status({
        checkId: checkId,
        status: 'error',
        reason: err.message,
        when: Date.now(),
        responseTime: -1
      })
    }
  }
});

export const Status = mongoose.model('Status', statusSchema);
