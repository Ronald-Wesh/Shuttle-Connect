import { Request, Response } from "express";
import { UssdRequest } from "../interfaces/ussd.interface";
import { ussdService } from "../services/ussd.service";
import { logger } from "../utils/logger";

export class UssdController {
  async handleRequest(req: Request, res: Response) {
    try {
      const { sessionId, phoneNumber, networkCode, serviceCode, text } = req.body;

      const ussdRequest: UssdRequest = {
        sessionId,
        phoneNumber,
        networkCode,
        serviceCode,
        text: text || ""
      };

      const response = await ussdService.handleUssd(ussdRequest);
      
      res.set("Content-Type", "text/plain");
      res.send(response);
    } catch (error) {
      logger.error(`USSD Error: ${error}`);
      res.set("Content-Type", "text/plain");
      res.send("END An error occurred. Please try again.");
    }
  }
}

export const ussdController = new UssdController();
