import mongoose from 'mongoose';

const checkSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  protocol: String,
  path: String,
  port: {
    type: Number,
    default: -1
  },
  method: {
    type: String,
    default: 'GET'
  },
  headers: {
    type: Map,
    of: String,
    default: {}
  },
  webhook: String,
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
  authentication: new mongoose.Schema({
    username: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
  }, { _id: false }),
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
      default: 200 // TODO better to make this a range (200-299) & perhaps use include/exclude rules.
    }
  },
  ignoreSsl: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    default: []
  }
}, {
  methods: {
    resolveUrl() {
      const url = new URL(this.url);
      if (this.protocol) {
        url.protocol = this.protocol;
      }
      if (this.path) {
        url.pathname = this.path;
      }
      if (this.port >= 0) {
        url.port = this.port;
      }
      if (!['http:', 'https:'].includes(url.protocol?.toLowerCase())) {
        throw new Error('Invalid URL');
      }
      return url.toString();
    }
  }
});

export const Check = mongoose.model('Check', checkSchema);
