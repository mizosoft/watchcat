import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  // username: {
  //     type: String,
  //     required: true,
  //     unique: true,
  // },
  name: String,
  email: {
    type: String,
    unqiue: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  }
});

export const User = mongoose.model('User', userSchema);
