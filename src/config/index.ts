import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env"), quiet: true });

export default {
  port: process.env.PORT!,
  app_url: process.env.APP_URL!,
  database_url: process.env.DATABASE_URL!,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS!,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN!,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN!,
  node_env: process.env.NODE_ENV!,
  stripe_secret_key: process.env.STRIPE_SECRET_KEY!,
  stripe_webhook_secret_key: process.env.STRIPE_WEBHOOK_SECRET_KEY!,
};