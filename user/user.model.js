import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    // username: {
    //     type: String,
    //     required: true,
    //     unique: true,
    // },
    name: {
        type: String,
        default: null,
    },
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

// userSchema.pre('save', function(next) {
//     if (this.name == null) {
//         this.name = this.username;
//     }
//     next();
// });

export const User = mongoose.model('User', userSchema);
