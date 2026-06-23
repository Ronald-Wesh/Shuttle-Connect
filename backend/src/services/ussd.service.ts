import { UssdRequest } from "../interfaces/ussd.interface";
import { UssdRepository } from "../repositories/ussd.repository";
import { passengerRepository } from "../repositories/passenger.repository";
import { bookingRepository } from "../repositories/booking.repository";
import { smsService } from "./sms.service";
import { supabase } from "../config/supabase";
import { generateBookingReference } from "../utils/generateReference";
import { BOOKING_STATUS, PAYMENT_STATUS } from "../constants/bookingStatus";

export class UssdService {
  private ussdRepository: UssdRepository;

  constructor() {
    this.ussdRepository = new UssdRepository();
  }

  async handleUssd(request: UssdRequest): Promise<string> {
    const { sessionId, phoneNumber, text } = request;

    const inputs = text.split("*").filter(Boolean);
    const lastInput = inputs.length > 0 ? inputs[inputs.length - 1] : "";

    let session = await this.ussdRepository.getSession(sessionId);

    if (!session || text === "") {
      if (session) await this.ussdRepository.deleteSession(sessionId);
      session = await this.ussdRepository.createSession({
        sessionId,
        phoneNumber,
        state: "MAIN_MENU",
        data: {}
      });
      return this.handleMainMenu(session);
    }

    // Global navigation
    if (lastInput === "00") {
      session.state = "MAIN_MENU";
      session.data = {};
      await this.ussdRepository.updateSession(sessionId, session.state, session.data);
      return this.handleMainMenu(session);
    }

    switch (session.state) {
      case "MAIN_MENU":
        return this.handleMainMenuSelection(session, lastInput);
      case "AWAITING_SACCO":
        return this.handleSaccoSelection(session, lastInput);
      case "AWAITING_ROUTE":
        return this.handleRouteSelection(session, lastInput);
      case "AWAITING_TRIP":
        return this.handleTripSelection(session, lastInput);
      case "AWAITING_CONFIRMATION":
        return this.handleConfirmation(session, lastInput);
      case "VIEW_BOOKINGS":
        return this.handleViewBookings(session, lastInput);
      default:
        return "END Invalid session state. Please try again.";
    }
  }

  private async handleMainMenu(session: any): Promise<string> {
    const response = "CON Welcome to ShuttleConnect\n1. Book a Trip\n2. My Bookings\n\n00. Home";
    await this.ussdRepository.updateSession(session.sessionId, "MAIN_MENU", session.data);
    return response;
  }

  private async handleMainMenuSelection(session: any, input: string): Promise<string> {
    if (input === "1") {
      return this.showSaccos(session);
    } else if (input === "2") {
      return this.showBookings(session);
    } else {
      return "CON Invalid selection.\n1. Book a Trip\n2. My Bookings\n00. Home";
    }
  }

  private async showSaccos(session: any): Promise<string> {
    const { data } = await supabase.from("companies").select("id, name").eq("is_active", true).limit(5);
    
    if (!data || data.length === 0) {
      return "END No active Saccos found.";
    }

    let response = "CON Select Sacco:\n";
    session.data.saccos = data;
    
    data.forEach((sacco: any, index: number) => {
      response += `${index + 1}. ${sacco.name}\n`;
    });

    response += "\n0. Back\n00. Home";
    await this.ussdRepository.updateSession(session.sessionId, "AWAITING_SACCO", session.data);
    return response;
  }

  private async handleSaccoSelection(session: any, input: string): Promise<string> {
    if (input === "0") return this.handleMainMenu(session);

    const index = parseInt(input) - 1;
    const saccos = session.data.saccos;

    if (isNaN(index) || !saccos || index < 0 || index >= saccos.length) {
      return "CON Invalid selection. Select Sacco:\n" + this.formatList(saccos, "name") + "\n0. Back\n00. Home";
    }

    const selectedSacco = saccos[index];
    session.data.companyId = selectedSacco.id;
    session.data.companyName = selectedSacco.name;

    return this.showRoutes(session);
  }

  private async showRoutes(session: any): Promise<string> {
    const { data } = await supabase
      .from("routes")
      .select("id, origin, destination")
      .eq("company_id", session.data.companyId)
      .eq("is_active", true)
      .limit(5);

    if (!data || data.length === 0) {
      return "CON No active routes found.\n0. Back\n00. Home";
    }

    let response = `CON ${session.data.companyName} Routes:\n`;
    session.data.routes = data;
    
    data.forEach((route: any, i: number) => {
      response += `${i + 1}. ${route.origin} to ${route.destination}\n`;
    });

    response += "\n0. Back\n00. Home";
    await this.ussdRepository.updateSession(session.sessionId, "AWAITING_ROUTE", session.data);
    return response;
  }

  private async handleRouteSelection(session: any, input: string): Promise<string> {
    if (input === "0") return this.showSaccos(session);

    const index = parseInt(input) - 1;
    const routes = session.data.routes;

    if (isNaN(index) || !routes || index < 0 || index >= routes.length) {
      return "CON Invalid Route:\n" + this.formatRoutesList(routes) + "\n0. Back\n00. Home";
    }

    const selectedRoute = routes[index];
    session.data.routeId = selectedRoute.id;
    session.data.routeName = `${selectedRoute.origin} to ${selectedRoute.destination}`;

    return this.showTrips(session);
  }

  private async showTrips(session: any): Promise<string> {
    const { data } = await supabase
      .from("trips")
      .select("id, departure_time, fare_amount, available_seats")
      .eq("company_id", session.data.companyId)
      .eq("route_id", session.data.routeId)
      .in("status", ["scheduled", "boarding"])
      .gte("departure_time", new Date().toISOString())
      .order("departure_time", { ascending: true })
      .limit(5);

    if (!data || data.length === 0) {
      return "CON No upcoming trips found.\n0. Back\n00. Home";
    }

    let response = `CON Trips for ${session.data.routeName}:\n`;
    session.data.trips = data;
    
    data.forEach((trip: any, i: number) => {
      const time = new Date(trip.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      response += `${i + 1}. ${time} - KES ${trip.fare_amount} (${trip.available_seats})\n`;
    });

    response += "\n0. Back\n00. Home";
    await this.ussdRepository.updateSession(session.sessionId, "AWAITING_TRIP", session.data);
    return response;
  }

  private async handleTripSelection(session: any, input: string): Promise<string> {
    if (input === "0") return this.showRoutes(session);

    const index = parseInt(input) - 1;
    const trips = session.data.trips;

    if (isNaN(index) || !trips || index < 0 || index >= trips.length) {
      return "CON Invalid Trip:\n" + this.formatTripsList(trips) + "\n0. Back\n00. Home";
    }

    const selectedTrip = trips[index];
    if (selectedTrip.available_seats < 1) {
      return "CON Sorry, full. Select another:\n" + this.formatTripsList(trips) + "\n0. Back\n00. Home";
    }

    session.data.tripId = selectedTrip.id;
    session.data.fareAmount = selectedTrip.fare_amount;
    session.data.departureTime = selectedTrip.departure_time;

    const time = new Date(selectedTrip.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const response = `CON Confirm Booking\n${session.data.companyName}\n${session.data.routeName}\nTime: ${time}\nFare: KES ${selectedTrip.fare_amount}\n1. Confirm\n0. Back\n00. Home`;

    await this.ussdRepository.updateSession(session.sessionId, "AWAITING_CONFIRMATION", session.data);
    return response;
  }

  private async handleConfirmation(session: any, input: string): Promise<string> {
    if (input === "0") return this.showTrips(session);
    if (input !== "1") return this.handleMainMenu(session);

    try {
      const { data: passengers } = await supabase
        .from("passengers")
        .select("id")
        .eq("company_id", session.data.companyId)
        .eq("phone", session.phoneNumber)
        .limit(1);

      let passengerId = passengers && passengers.length > 0 ? passengers[0].id : null;

      if (!passengerId) {
        const newPassenger = await passengerRepository.create({
          company_id: session.data.companyId,
          user_id: null,
          full_name: "USSD Customer",
          phone: session.phoneNumber
        });
        passengerId = newPassenger.id;
      }

      const bookingReference = generateBookingReference();
      await bookingRepository.create({
        company_id: session.data.companyId,
        trip_id: session.data.tripId,
        passenger_id: passengerId,
        booking_reference: bookingReference,
        seat_count: 1,
        total_amount: session.data.fareAmount,
        status: BOOKING_STATUS.PENDING,
        payment_status: PAYMENT_STATUS.PENDING
      });

      const time = new Date(session.data.departureTime).toLocaleString();
      const smsMessage = `Ticket: ${bookingReference}\n${session.data.companyName}\n${session.data.routeName}\n${time}\nSeat: 1\nFare: KES ${session.data.fareAmount}`;
      await smsService.sendSms(session.phoneNumber, smsMessage);

      await this.ussdRepository.deleteSession(session.sessionId);
      return `END Booking successful! Ref: ${bookingReference}. You will receive an SMS.`;
    } catch (error) {
      console.error("USSD Error:", error);
      return "END Error occurred. Please try again.";
    }
  }

  private async showBookings(session: any): Promise<string> {
    // Find passenger profiles for this phone number across all companies
    const { data: passengers } = await supabase
      .from("passengers")
      .select("id, company:companies(name)")
      .eq("phone", session.phoneNumber);

    if (!passengers || passengers.length === 0) {
      return "CON No bookings found for this number.\n00. Home";
    }

    const passengerIds = passengers.map(p => p.id);
    const { data: bookings } = await supabase
      .from("bookings")
      .select("booking_reference, total_amount, trip:trips(departure_time, route:routes(origin, destination)), company_id")
      .in("passenger_id", passengerIds)
      .order("created_at", { ascending: false })
      .limit(3);

    if (!bookings || bookings.length === 0) {
      return "CON No bookings found.\n00. Home";
    }

    let response = "CON Your Last 3 Bookings:\n";
    bookings.forEach((b: any, i: number) => {
      const bComp = passengers.find(p => p.id === passengers[i]?.id)?.company as any;
      const compName = bComp?.name || "Sacco";
      const time = new Date(b.trip.departure_time).toLocaleDateString();
      response += `${i + 1}. ${b.booking_reference} - ${b.trip.route.origin} to ${b.trip.route.destination} (${time})\n`;
    });

    response += "\n00. Home";
    await this.ussdRepository.updateSession(session.sessionId, "VIEW_BOOKINGS", session.data);
    return response;
  }

  private async handleViewBookings(session: any, input: string): Promise<string> {
    // Just return home for any input or back
    return this.handleMainMenu(session);
  }

  private formatList(items: any[], key: string): string {
    return items.map((item, i) => `${i + 1}. ${item[key]}`).join("\n");
  }

  private formatRoutesList(routes: any[]): string {
    return routes.map((r, i) => `${i + 1}. ${r.origin} to ${r.destination}`).join("\n");
  }

  private formatTripsList(trips: any[]): string {
    return trips.map((t, i) => {
      const time = new Date(t.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${i + 1}. ${time} - KES ${t.fare_amount}`;
    }).join("\n");
  }
}

export const ussdService = new UssdService();
