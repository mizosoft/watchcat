import mongoose from 'mongoose'

const statusSchema = new mongoose.Schema({
  checkId: {
    type: String,
    index: true
  },
  status: String,
  reason: String,
  responseTimeMillis: Number,
}, {
  timestamps: {
    createdAt: 'when',
    updatedAt: false // Statuses are never updated.
  },
  // timeseries: {
  //   timeField: 'when',
  //   metaField: 'checkId',
  //   granularity: 'seconds'
  // },
  statics: {
    ok(checkId, responseTimeMillis) {
      return new Status({
        checkId: checkId,
        status: 'ok',
        reason: '',
        responseTimeMillis: responseTimeMillis
      });
    },

    invalid(checkId, reason, responsetimeMillis) {
      return new Status({
        checkId: checkId,
        status: 'invalid',
        reason: reason,
        responseTimeMillis: responsetimeMillis
      });
    },

    error(checkId, err) {
      return new Status({
        checkId: checkId,
        status: 'error',
        reason: err.message,
        responseTimeMillis: -1
      });
    }
  },
  methods: {
    ok() {
      return this.status == 'ok';
    }
  }
});

export const Status = mongoose.model('Status', statusSchema);
