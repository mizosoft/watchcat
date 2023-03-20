import * as dotenv from 'dotenv';

dotenv.config();

export function fromEnv() {
  return {
    port: process.env.PORT || 45678,
    jwtSecret: process.env.JWT_SECRET || 'vErY sEcURe',
    mongodbUrl: process.env.MONGODB_URL,
    mongooseOptions: {}
  }
}
