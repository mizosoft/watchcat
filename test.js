import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  o: {
    a: {
      type: String,
      required: true
    }
  }
}, {
  methods: {
    ok() { return 'ok'; }
  }
});
mongoose.connect("mongodb://localhost:55554");

const User = mongoose.model('Test', schema);

const u = new User({ o: { a: 1 } });
console.log(u.ok());
console.log(u.toObject({virtuals: true}).ok());
