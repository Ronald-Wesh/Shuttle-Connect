/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { useApi } from "../context/ApiContext";
import { useTrips, useBookings, useCreateBooking } from "../hooks/useApi";
import { Trip, Booking } from "../types";

/**
 * Example component showing how to use the API services
 * This is a reference implementation that can be adapted for your needs
 */
export function ApiExample() {
  const { user, isAuthenticated, logout } = useApi();
  const { trips, loading: tripsLoading, error: tripsError, fetch: fetchTrips } = useTrips();
  const { bookings, loading: bookingsLoading } = useBookings();
  const { create: createBooking, loading: creating } = useCreateBooking();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTrips();
    }
  }, [isAuthenticated, fetchTrips]);

  const handleCreateBooking = async () => {
    if (!selectedTrip || !user) return;

    try {
      await createBooking({
        tripId: selectedTrip.id,
        passengerId: user.id,
        seats: [1, 2],
        totalAmount: selectedTrip.fare * 2,
        paymentMethod: "card",
        paymentStatus: "pending",
        status: "pending",
      } as any);
      alert("Booking created successfully!");
      setSelectedTrip(null);
    } catch (error) {
      alert("Failed to create booking: " + (error as any).message);
    }
  };

  if (!isAuthenticated) {
    return <div className="alert alert-warning">Please log in to continue</div>;
  }

  return (
    <div className="container mt-4">
      <div className="row">
        {/* User Profile Section */}
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Profile</h5>
              {user && (
                <>
                  <p>
                    <strong>Name:</strong> {user.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {user.role}
                  </p>
                </>
              )}
              <button className="btn btn-danger btn-sm" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Trips Section */}
        <div className="col-md-5">
          <div className="card">
            <div className="card-header">
              <h5>Available Trips</h5>
            </div>
            <div className="card-body">
              {tripsLoading && <p className="text-muted">Loading trips...</p>}
              {tripsError && (
                <p className="text-danger">Error: {tripsError.message}</p>
              )}
              {trips.length === 0 && !tripsLoading && (
                <p className="text-muted">No trips available</p>
              )}
              <div className="list-group">
                {trips.map((trip) => (
                  <button
                    key={trip.id}
                    type="button"
                    className={`list-group-item list-group-item-action text-start ${
                      selectedTrip?.id === trip.id ? "active" : ""
                    }`}
                    onClick={() => setSelectedTrip(trip)}
                  >
                    <div>
                      <strong>{trip.id}</strong>
                      <br />
                      <small>Fare: ${trip.fare}</small>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>Create Booking</h5>
            </div>
            <div className="card-body">
              {selectedTrip ? (
                <>
                  <p>
                    <strong>Selected Trip:</strong> {selectedTrip.id}
                  </p>
                  <p>
                    <strong>Fare:</strong> ${selectedTrip.fare}
                  </p>
                  <button
                    className="btn btn-primary w-100"
                    onClick={handleCreateBooking}
                    disabled={creating}
                  >
                    {creating ? "Creating..." : "Create Booking"}
                  </button>
                </>
              ) : (
                <p className="text-muted">Select a trip to book</p>
              )}

              <hr />
              <h6>Your Bookings ({bookings.length})</h6>
              {bookingsLoading && <p className="text-muted">Loading...</p>}
                  <div className="list-group list-group-sm">
                {bookings.map((booking: Booking) => (
                  <div
                    key={booking.id}
                    className="list-group-item list-group-item-sm text-sm"
                  >
                    <small>
                      <strong>{booking.id}</strong>
                      <br />
                      Status: {booking.paymentStatus}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
