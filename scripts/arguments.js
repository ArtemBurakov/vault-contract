import * as dotenv from "dotenv";
dotenv.config();

const OWNER_INCOME_PERCENTAGE = process.env.OWNER_INCOME_PERCENTAGE;

module.exports = [OWNER_INCOME_PERCENTAGE];
