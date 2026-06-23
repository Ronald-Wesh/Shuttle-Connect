/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Operator, Departure, Booking, Transaction, RouteStats } from "./types";

export const INITIAL_OPERATORS: Operator[] = [
  {
    id: "mololine",
    name: "Mololine Shuttle",
    subName: "Fleet Management",
    tagline: "Reliable & Established Premium Operator",
    contactPhone: "0738836122",
    bgGradient: "from-[#005344] to-[#00382E]",
    stats: {
      dailyRevenue: 142500,
      revenueGrowth: 12,
      totalPassengers: 1248,
      utilization: 88,
      totalVehicles: 24,
    }
  },
  {
    id: "north-rift",
    name: "North Rift Shuttle",
    subName: "Express Services Hub",
    tagline: "High-performance Elite Travel Network",
    contactPhone: "0722000000",
    bgGradient: "from-[#115C89] to-[#0A3D5C]",
    stats: {
      dailyRevenue: 98400,
      revenueGrowth: 8,
      totalPassengers: 842,
      utilization: 75,
      totalVehicles: 18,
    }
  },
  {
    id: "sharks",
    name: "Sharks Premium",
    subName: "Executive Travel",
    tagline: "Comfort First Executive Transport Service",
    contactPhone: "0711999888",
    bgGradient: "from-[#a63b00] to-[#7f2b00]",
    stats: {
      dailyRevenue: 64200,
      revenueGrowth: 5,
      totalPassengers: 410,
      utilization: 62,
      totalVehicles: 10,
    }
  }
];

export const INITIAL_DEPARTURES: Departure[] = [
  // Mololine Shuttle
  {
    id: "molo-dep-1",
    operatorId: "mololine",
    departTime: "6:00 AM",
    date: "2026-06-01",
    from: "Nairobi",
    to: "Eldoret",
    fare: 1500,
    vehiclePlate: "KCQ 482A",
    vehicleType: "14-Seater",
    capacity: 14,
    occupiedSeats: [1, 2, 3, 4, 7, 8, 12, 13, 14], // 5 left
    status: "LIVE",
    driverName: "Francis Kamau"
  },
  {
    id: "molo-dep-2",
    operatorId: "mololine",
    departTime: "8:00 AM",
    date: "2026-06-01",
    from: "Nairobi",
    to: "Eldoret",
    fare: 1500,
    vehiclePlate: "KCV 109G",
    vehicleType: "14-Seater",
    capacity: 14,
    occupiedSeats: [2, 5, 9, 10], // 10 left
    status: "BOARDING",
    driverName: "Joseph Mwangi"
  },
  {
    id: "molo-dep-3",
    operatorId: "mololine",
    departTime: "7:30 AM",
    date: "2026-06-01",
    from: "Nairobi",
    to: "Nakuru",
    fare: 800,
    vehiclePlate: "KCQ 333F",
    vehicleType: "14-Seater",
    capacity: 14,
    occupiedSeats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // 12 filled, 2 left (12/50 left ratio normalized)
    status: "LIVE",
    driverName: "Peter Ndwiga"
  },
  {
    id: "molo-dep-4",
    operatorId: "mololine",
    departTime: "10:00 AM",
    date: "2026-06-01",
    from: "Nairobi",
    to: "Nakuru",
    fare: 800,
    vehiclePlate: "KDG 122M",
    vehicleType: "14-Seater",
    capacity: 14,
    occupiedSeats: [1, 4], // 12 left
    status: "SCHEDULED",
    driverName: "John Kiarie"
  },
  // North Rift Shuttle
  {
    id: "nr-dep-1",
    operatorId: "north-rift",
    departTime: "7:00 AM",
    date: "2026-06-01",
    from: "Nairobi",
    to: "Eldoret",
    fare: 1400,
    vehiclePlate: "KCQ 482A",
    vehicleType: "14-Seater",
    capacity: 14,
    occupiedSeats: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], // 14/14 Seats Filled
    status: "LIVE",
    driverName: "Jackson Kiprop"
  },
  {
    id: "nr-dep-2",
    operatorId: "north-rift",
    departTime: "9:00 AM",
    date: "2026-06-01",
    from: "Nairobi",
    to: "Kitale",
    fare: 1600,
    vehiclePlate: "KDM 921B",
    vehicleType: "11-Seater",
    capacity: 11,
    occupiedSeats: [1, 2, 3], // 8/11 Available implies 3 occupied, 8 available
    status: "BOARDING",
    driverName: "Daniel Chemetian"
  },
  {
    id: "nr-dep-3",
    operatorId: "north-rift",
    departTime: "1:00 PM",
    date: "2026-06-01",
    from: "Nairobi",
    to: "Eldoret",
    fare: 1400,
    vehiclePlate: "KDK 555K",
    vehicleType: "14-Seater",
    capacity: 14,
    occupiedSeats: [1, 2], // 2/14 Booked
    status: "SCHEDULED",
    driverName: "Ezekiel Kuria"
  },
  {
    id: "nr-dep-4",
    operatorId: "north-rift",
    departTime: "8:00 AM",
    date: "2026-06-01",
    from: "Nairobi",
    to: "Kisumu",
    fare: 1600,
    vehiclePlate: "KDM 843X",
    vehicleType: "20-Seater",
    capacity: 20,
    occupiedSeats: [3, 7, 8, 12, 13, 16], // Felix is booking 5 and 6, occupied are [3,7,8,12,13,16] match user's screenshot
    status: "BOARDING",
    driverName: "Timothy Rotich"
  },
  // Sharks Premium
  {
    id: "sharks-dep-1",
    operatorId: "sharks",
    departTime: "8:30 AM",
    date: "2026-06-01",
    from: "Nakuru",
    to: "Kisumu",
    fare: 1400,
    vehiclePlate: "KDD 332R",
    vehicleType: "14-Seater",
    capacity: 14,
    occupiedSeats: [1, 2, 3, 5, 8],
    status: "BOARDING",
    driverName: "Michael Opondo"
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "book-1",
    departureId: "nr-dep-4", // Nairobi to Kisumu 8:00 AM (20-seater)
    passengerName: "Felix Omondi",
    passengerPhone: "0722112233",
    seats: [5, 6],
    amount: 3200,
    paymentStatus: "SUCCESS",
    transactionId: "TLNK-2026-0601-800",
    timestamp: "2026-05-30T08:00:00Z",
    operatorId: "north-rift"
  },
  {
    id: "book-2",
    departureId: "molo-dep-1",
    passengerName: "Almina Wanjiku",
    passengerPhone: "0711445566",
    seats: [1, 2],
    amount: 3000,
    paymentStatus: "SUCCESS",
    transactionId: "TLNK-2026-0530-101",
    timestamp: "2026-05-30T09:12:00Z",
    operatorId: "mololine"
  },
  {
    id: "book-3",
    departureId: "nr-dep-1",
    passengerName: "Brian Kiprotich",
    passengerPhone: "0700998877",
    seats: [10],
    amount: 1400,
    paymentStatus: "SUCCESS",
    transactionId: "TLNK-2026-0530-221",
    timestamp: "2026-05-30T06:45:00Z",
    operatorId: "north-rift"
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "TXN-001",
    bookingId: "book-1",
    operatorId: "north-rift",
    amount: 3200,
    phone: "0722112233",
    passengerName: "Felix Omondi",
    status: "SUCCESS",
    timestamp: "2026-05-30T10:01:00Z",
    method: "M-PESA"
  },
  {
    id: "TXN-002",
    bookingId: "book-2",
    operatorId: "mololine",
    amount: 3000,
    phone: "0711445566",
    passengerName: "Almina Wanjiku",
    status: "SUCCESS",
    timestamp: "2026-05-30T09:12:00Z",
    method: "M-PESA"
  },
  {
    id: "TXN-003",
    bookingId: "book-3",
    operatorId: "north-rift",
    amount: 1400,
    phone: "0700998877",
    passengerName: "Brian Kiprotich",
    status: "SUCCESS",
    timestamp: "2026-05-30T06:45:00Z",
    method: "M-PESA"
  }
];

export const POPULAR_ROUTES: RouteStats[] = [
  {
    from: "Nairobi",
    to: "Nakuru",
    baseFare: 1200,
    operatorId: "mololine",
    popularity: 95,
    schedulesCount: 12
  },
  {
    from: "Nairobi",
    to: "Eldoret",
    baseFare: 1500,
    operatorId: "north-rift",
    popularity: 88,
    schedulesCount: 8
  },
  {
    from: "Nakuru",
    to: "Kisumu",
    baseFare: 1400,
    operatorId: "sharks",
    popularity: 76,
    schedulesCount: 4
  }
];
