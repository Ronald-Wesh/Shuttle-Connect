import type { Request, Response } from "express";
import { bookingRepository } from "../repositories/booking.repository";
import { bookingService } from "../services/booking.service";
import type { DarajaCallbackBody } from "../services/mpesa.service";
import { asyncHandler } from "../utils/asyncHandler";
import { logger } from "../utils/logger";
import { sendSuccess } from "../utils/response";

const extractMpesaReceipt = (callback: DarajaCallbackBody["Body"]["stkCallback"]) => {
  const receipt = callback.CallbackMetadata?.Item.find(
    (item) => item.Name === "MpesaReceiptNumber"
  )?.Value;

  return receipt === undefined ? undefined : String(receipt);
};

export class MpesaController {
  pay = asyncHandler(async (req: Request, res: Response) => {
    const { bookingId } = req.body as { bookingId: string };

    await bookingService.getById(bookingId, req.user!);
    await bookingService.initiatePayment(bookingId);

    return sendSuccess(
      res,
      200,
      "STK Push sent. Enter your M-Pesa PIN."
    );
  });

  callback = async (req: Request, res: Response) => {
    try {
      const callbackBody = req.body as DarajaCallbackBody;
      const stkCallback = callbackBody.Body?.stkCallback;

      if (!stkCallback?.CheckoutRequestID) {
        logger.warn("Daraja callback missing CheckoutRequestID", callbackBody);
        return res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
      }

      const booking = await bookingRepository.findByCheckoutRequestId(
        stkCallback.CheckoutRequestID
      );

      if (!booking) {
        logger.warn("Daraja callback booking not found", {
          checkoutRequestId: stkCallback.CheckoutRequestID,
          resultCode: stkCallback.ResultCode,
          resultDesc: stkCallback.ResultDesc
        });
        return res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
      }

      if (stkCallback.ResultCode === 0) {
        const mpesaReceipt = extractMpesaReceipt(stkCallback);

        if (!mpesaReceipt) {
          throw new Error("Daraja success callback missing MpesaReceiptNumber");
        }

        await bookingService.confirmBooking(booking.id, mpesaReceipt);
        logger.info("Daraja payment confirmed", {
          bookingId: booking.id,
          checkoutRequestId: stkCallback.CheckoutRequestID,
          mpesaReceipt
        });
      } else {
        await bookingService.failBooking(booking.id, stkCallback.ResultDesc);
        logger.warn("Daraja payment failed", {
          bookingId: booking.id,
          checkoutRequestId: stkCallback.CheckoutRequestID,
          resultCode: stkCallback.ResultCode,
          resultDesc: stkCallback.ResultDesc
        });
      }
    } catch (error) {
      logger.error("Daraja callback processing failed", {
        message: error instanceof Error ? error.message : String(error)
      });
    }

    return res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
  };
}

export const mpesaController = new MpesaController();
