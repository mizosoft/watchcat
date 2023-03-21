import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  checkId: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    default: 'unknown'
  },
  reason: {
    type: String,
    deafult: '' 
  },
  availability: {
    type: Number,
    default: 0
  },
  outages: {
    type: Number,
    default: 0
  },
  uptimeSeconds: {
    type: Number,
    default: 0
  },
  downtimeSeconds: {
    type: Number,
    default: 0
  },
  averageResponseTimeMillis: {
    type: Number,
    default: -1
  },
  when: {
    type: Date,
    default: null
  }
}, {
  methods: {
    ok() {
      return this.status == 'ok';
    },

    /* Populates this report from a series of statuses. */
    populate(statuses) {
      for (const status of statuses) {
        if ((status.ok() != this.ok()) && !status.ok()) {
          this.outages++;
        }

        this.status = status.status;
        this.reason = status.reason;
        if (status.responseTimeMillis >= 0) {
          this.averageResponseTimeMillis += status.responseTimeMillis;
        }

        if (this.when) {
          const time = status.when - this.when; // Convert to seconds later.
          if (status.ok()) {
            this.uptimeSeconds += time;
          } else {
            this.downtimeSeconds += time;
          }
        }
        this.when = status.when;
      }

      this.uptimeSeconds = Math.round(this.uptimeSeconds / 1000);
      this.downtimeSeconds = Math.round(this.downtimeSeconds / 1000);
      this.availability = Math.round(100 * this.uptimeSeconds / (this.uptimeSeconds + this.downtimeSeconds)) / 100;
    }
  }
});

export const Report = mongoose.model('Report', reportSchema);
