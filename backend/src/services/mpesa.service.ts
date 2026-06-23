import { env } from "../config/env";
import { DARAJA_URLS } from "../constants/darajaUrls";
import { badRequest } from "../utils/httpError";

export interface STKPushParams {
  phone: string;
  amount: number;
  bookingId: string;
  description: string;
}

export interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface DarajaCallbackMetadataItem {
  Name: "Amount" | "MpesaReceiptNumber" | "Balance" | "TransactionDate" | "PhoneNumber" | string;
  Value?: string | number;
}

export interface DarajaCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: DarajaCallbackMetadataItem[];
      };
    };
  };
}

interface AccessTokenResponse {
  access_token?: string;
  expires_in?: string;
  error?: string;
  errorMessage?: string;
  requestId?: string;
}

interface DarajaErrorResponse {
  error?: string;
  errorCode?: string;
  errorMessage?: string;
  requestId?: string;
  ResponseCode?: string;
  ResponseDescription?: string;
  CustomerMessage?: string;
}

const pad = (value: number) => value.toString().padStart(2, "0");

const formatTimestamp = (date: Date) =>
  [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join("");

const normalizePhone = (phone: string) => {
  const compact = phone.trim().replace(/[\s-]/g, "");
  let normalized = compact;

  if (normalized.startsWith("+")) {
    normalized = normalized.slice(1);
  }

  if (normalized.startsWith("0")) {
    normalized = `254${normalized.slice(1)}`;
  }

  if (/^[17]\d{8}$/.test(normalized)) {
    normalized = `254${normalized}`;
  }

  if (!/^254\d{9}$/.test(normalized)) {
    throw badRequest("Invalid M-Pesa phone number");
  }

  return normalized;
};

const parseJson = async <T>(response: Response): Promise<T> => {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
};

export class MpesaService {
  private readonly urls = DARAJA_URLS[env.DARAJA_ENV];

  private requireConfig(keys: Array<keyof typeof env>) {
    const missing = keys.filter((key) => !env[key]);

    if (missing.length > 0) {
      throw badRequest(`Missing Daraja configuration: ${missing.join(", ")}`);
    }
  }

  async getAccessToken(): Promise<string> {
    this.requireConfig(["DARAJA_CONSUMER_KEY", "DARAJA_CONSUMER_SECRET"]);

    const credentials = Buffer.from(
      `${env.DARAJA_CONSUMER_KEY}:${env.DARAJA_CONSUMER_SECRET}`
    ).toString("base64");

    const response = await fetch(
      `${this.urls.auth}?grant_type=client_credentials`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${credentials}`,
          Accept: "application/json"
        }
      }
    );
    const body = await parseJson<AccessTokenResponse>(response);

    if (!response.ok || !body.access_token) {
      throw badRequest(
        body.errorMessage ?? body.error ?? "Failed to get Daraja access token",
        {
          status: response.status,
          requestId: body.requestId
        }
      );
    }

    return body.access_token;
  }

  async initiateSTKPush(params: STKPushParams): Promise<STKPushResponse> {
    this.requireConfig([
      "DARAJA_SHORTCODE",
      "DARAJA_PASSKEY",
      "DARAJA_CALLBACK_URL"
    ]);

    const accessToken = await this.getAccessToken();
    const timestamp = formatTimestamp(new Date());
    const amount = Math.round(params.amount);
    const phone = normalizePhone(params.phone);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw badRequest("M-Pesa amount must be a positive whole number");
    }

    const password = Buffer.from(
      `${env.DARAJA_SHORTCODE}${env.DARAJA_PASSKEY}${timestamp}`
    ).toString("base64");

    const payload = {
      BusinessShortCode: env.DARAJA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: env.DARAJA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: env.DARAJA_CALLBACK_URL,
      AccountReference: params.bookingId,
      TransactionDesc: params.description
    };

    const response = await fetch(this.urls.stkPush, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const body = await parseJson<STKPushResponse & DarajaErrorResponse>(
      response
    );

    if (!response.ok || body.ResponseCode !== "0") {
      throw badRequest(
        body.errorMessage ??
          body.ResponseDescription ??
          body.CustomerMessage ??
          "Failed to initiate M-Pesa STK Push",
        {
          status: response.status,
          errorCode: body.errorCode,
          requestId: body.requestId
        }
      );
    }

    return body;
  }
}

export const mpesaService = new MpesaService();
