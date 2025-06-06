import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });
const config = {
  FrontEndHostedPort: process.env.FRONT_END_HOSTED_PORT as string,
  port: process.env.PORT ? Number(process.env.PORT) : 5000,
  nodeEnv: process.env.NODE_ENV,
  mongoose_uri: process.env.MONGOOSE_URI as string,

  jwt_token_secret: process.env.JWT_TOKEN_SECRET as string,
  token_expairsIn: process.env.TOKEN_EXPAIRS_IN as string,
  jwt_refresh_Token_secret: process.env.JWT_REFRESHTOKEN_SECRET as string,
  rifresh_expairsIn: process.env.REFRESH_TOKEN_EXPAIRS_IN as string,

  CLOUDNAME: process.env.CLOUDNAME as string,
  APIkEY: process.env.APIkEY,
  APISECRET: process.env.APISECRET,



  companyGmail: process.env.COMPANY_GMAIL as string,
  GmailAppPassword: process.env.GMAIL_APP_PASSWORD as string,

  bcrypt_salt: process.env.BCRYPT_SALT as string,
  cloudinary_name: process.env.CLOUDNAME,
  cloudinary_api_key: process.env.APIkEY,
  cloudinary_api_secret: process.env.APISECRET,

  OTP_TOKEN_DURATION: process.env.OTP_TOKEN_DURATION as string,

  AI_BASE_URL:process.env.AI_BASE_URL as string
};
export default config;


