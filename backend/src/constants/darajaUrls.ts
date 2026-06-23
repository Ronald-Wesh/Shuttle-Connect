export const DARAJA_URLS = {
  sandbox: {
    auth: "https://sandbox.safaricom.co.ke/oauth/v1/generate",
    stkPush: "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
  },
  production: {
    auth: "https://api.safaricom.co.ke/oauth/v1/generate",
    stkPush: "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
  }
} as const;
