import * as dotenv from 'dotenv';

dotenv.config();

export function fromEnv() {
  return {
    port: process.env.APP_PORT || 8080,
    jwtSecret: process.env.JWT_SECRET || 'vErY sEcURe',
    mongodbUrl: `mongodb://${process.env.MONGODB_HOST || 'localhost'}:${process.env.MONGODB_PORT || 27017}`,
    mongooseOptions: {}
  }
}
