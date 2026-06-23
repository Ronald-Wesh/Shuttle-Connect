import africastalking from "africastalking";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const credentials = {
  apiKey: env.AFRICASTALKING_API_KEY || "",
  username: env.AFRICASTALKING_USERNAME || "sandbox"
};

const at = africastalking(credentials);

export class SmsService {
  async sendSms(to: string, message: string): Promise<boolean> {
    try {
      const options: any = {
        to: [to],
        message: message,
      };
      
      if (env.AFRICASTALKING_SENDER_ID) {
        options.from = env.AFRICASTALKING_SENDER_ID;
      }

      logger.info(`Sending SMS to ${to}: ${message}`);
      
      const response = await at.SMS.send(options);
      logger.info(`SMS sent successfully: ${JSON.stringify(response)}`);
      
      return true;
    } catch (error) {
      logger.error(`Error sending SMS: ${error}`);
      return false;
    }
  }
}

export const smsService = new SmsService();
