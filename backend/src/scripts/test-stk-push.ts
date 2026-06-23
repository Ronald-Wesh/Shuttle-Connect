import { mpesaService } from "../services/mpesa.service";
import { v4 as uuidv4 } from "uuid";

async function main() {
  const phone = "254703215383";
  const amount = 1;
  const description = "Daraja test";
  const bookingId = `TEST-${uuidv4().slice(0, 8)}`;

  console.log(`Initiating STK Push for ${phone}...`);
  console.log(`Amount: ${amount}`);
  console.log(`Description: ${description}`);
  console.log(`Booking ID (Reference): ${bookingId}`);

  try {
    const response = await mpesaService.initiateSTKPush({
      phone,
      amount,
      description,
      bookingId
    });

    console.log("\n✅ STK Push Initiated Successfully!");
    console.log("Response:", JSON.stringify(response, null, 2));
  } catch (error: any) {
    console.error("\n❌ STK Push Failed!");
    console.error("Error:", error.message);
    if (error.details) {
      console.error("Details:", JSON.stringify(error.details, null, 2));
    }
    process.exit(1);
  }
}

main();
