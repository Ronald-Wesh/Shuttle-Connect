export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "ShuttleConnect Backend API",
    version: "0.1.0",
    description:
      "Express, TypeScript, and Supabase API for multi-company shuttle booking."
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local development"
    }
  ],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Companies" },
    { name: "Routes" },
    { name: "Vehicles" },
    { name: "Trips" },
    { name: "Passengers" },
    { name: "Bookings" },
    { name: "Notifications" },
    { name: "Audit Logs" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "Supabase JWT"
      }
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
          details: { type: "object", nullable: true }
        }
      },
      ApiMeta: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 20 },
          total: { type: "integer", example: 42 },
          totalPages: { type: "integer", example: 3 }
        }
      },
      Profile: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string", nullable: true },
          phone: { type: "string", nullable: true },
          fullName: { type: "string", nullable: true },
          role: {
            type: "string",
            enum: [
              "super_admin",
              "company_owner",
              "manager",
              "agent",
              "driver",
              "customer"
            ]
          },
          companyId: { type: "string", format: "uuid", nullable: true }
        }
      },
      Company: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          registrationNumber: { type: "string", nullable: true },
          phone: { type: "string", nullable: true },
          email: { type: "string", nullable: true },
          ownerId: { type: "string", format: "uuid", nullable: true },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      ShuttleRoute: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          companyId: { type: "string", format: "uuid" },
          origin: { type: "string" },
          destination: { type: "string" },
          distanceKm: { type: "number", nullable: true },
          estimatedDurationMinutes: { type: "integer", nullable: true },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      Vehicle: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          companyId: { type: "string", format: "uuid" },
          name: { type: "string", example: "Executive Shuttle" },
          plateNumber: { type: "string", example: "KDA 001S" },
          model: { type: "string", nullable: true, example: "Toyota Hiace" },
          seatCapacity: { type: "integer", example: 14 },
          status: {
            type: "string",
            enum: ["active", "maintenance", "inactive"]
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      Trip: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          companyId: { type: "string", format: "uuid" },
          routeId: { type: "string", format: "uuid" },
          vehicleId: { type: "string", format: "uuid" },
          vehicleName: { type: "string", nullable: true },
          vehicleRegistration: { type: "string", nullable: true },
          departureTime: { type: "string", format: "date-time" },
          arrivalTime: { type: "string", format: "date-time", nullable: true },
          fareAmount: { type: "number" },
          totalSeats: { type: "integer" },
          availableSeats: { type: "integer" },
          status: {
            type: "string",
            enum: ["scheduled", "boarding", "departed", "completed", "cancelled"]
          },
          route: { "$ref": "#/components/schemas/ShuttleRoute" },
          vehicle: { "$ref": "#/components/schemas/Vehicle" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      Passenger: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          companyId: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid", nullable: true },
          fullName: { type: "string" },
          phone: { type: "string" },
          email: { type: "string", nullable: true },
          nationalId: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      Booking: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          companyId: { type: "string", format: "uuid" },
          tripId: { type: "string", format: "uuid" },
          passengerId: { type: "string", format: "uuid" },
          bookingReference: { type: "string", example: "SC-A1B2C3D4E5" },
          seatCount: { type: "integer" },
          totalAmount: { type: "number" },
          status: {
            type: "string",
            enum: ["pending", "confirmed", "cancelled", "expired"]
          },
          paymentStatus: {
            type: "string",
            enum: ["pending", "paid", "failed", "refunded"]
          },
          trip: { "$ref": "#/components/schemas/Trip" },
          passenger: { "$ref": "#/components/schemas/Passenger" },
          confirmedAt: { type: "string", format: "date-time", nullable: true },
          cancelledAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      Notification: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          companyId: { type: "string", format: "uuid" },
          recipientUserId: { type: "string", format: "uuid", nullable: true },
          recipientPhone: { type: "string", nullable: true },
          title: { type: "string" },
          message: { type: "string" },
          channel: { type: "string", enum: ["in_app", "sms", "email", "whatsapp"] },
          metadata: { type: "object" },
          readAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      AuditLog: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          companyId: { type: "string", format: "uuid", nullable: true },
          actorId: { type: "string", format: "uuid", nullable: true },
          action: { type: "string", example: "booking.created" },
          entityType: { type: "string", example: "booking" },
          entityId: { type: "string", format: "uuid", nullable: true },
          metadata: { type: "object" },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      CreateCompanyRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string" },
          registrationNumber: { type: "string" },
          phone: { type: "string" },
          email: { type: "string", format: "email" }
        }
      },
      AuthSignInRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 1 }
        }
      },
      AuthSignUpRequest: {
        type: "object",
        required: ["fullName", "email", "password"],
        properties: {
          fullName: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 1 }
        }
      },
      AuthSessionUser: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string", nullable: true },
          phone: { type: "string", nullable: true }
        }
      },
      AuthPayload: {
        type: "object",
        properties: {
          session: {
            type: "object",
            nullable: true,
            properties: {
              accessToken: { type: "string", nullable: true },
              refreshToken: { type: "string", nullable: true },
              expiresIn: { type: "integer", nullable: true },
              tokenType: { type: "string", nullable: true },
              user: { "$ref": "#/components/schemas/AuthSessionUser" }
            }
          },
          user: { "$ref": "#/components/schemas/AuthSessionUser" }
        }
      },
      CreateRouteRequest: {
        type: "object",
        required: ["origin", "destination"],
        properties: {
          companyId: {
            type: "string",
            format: "uuid",
            description: "Only required when the caller is super_admin."
          },
          origin: { type: "string", example: "Nairobi" },
          destination: { type: "string", example: "Mombasa" },
          distanceKm: { type: "number", example: 482 },
          estimatedDurationMinutes: { type: "integer", example: 510 }
        }
      },
      CreateVehicleRequest: {
        type: "object",
        required: ["name", "plateNumber", "seatCapacity"],
        properties: {
          companyId: {
            type: "string",
            format: "uuid",
            description: "Only required when the caller is super_admin."
          },
          name: { type: "string", example: "Executive Shuttle" },
          plateNumber: { type: "string", example: "KDA 001S" },
          model: { type: "string", example: "Toyota Hiace" },
          seatCapacity: { type: "integer", example: 14 },
          status: {
            type: "string",
            enum: ["active", "maintenance", "inactive"]
          }
        }
      },
      CreateTripRequest: {
        type: "object",
        required: ["routeId", "vehicleId", "departureTime", "fareAmount"],
        properties: {
          companyId: {
            type: "string",
            format: "uuid",
            description: "Only required when the caller is super_admin."
          },
          routeId: { type: "string", format: "uuid" },
          vehicleId: { type: "string", format: "uuid" },
          vehicleName: { type: "string" },
          vehicleRegistration: { type: "string" },
          departureTime: { type: "string", format: "date-time" },
          arrivalTime: { type: "string", format: "date-time" },
          fareAmount: { type: "number" },
          totalSeats: {
            type: "integer",
            description: "Optional. Defaults to the selected vehicle seatCapacity."
          }
        }
      },
      CreatePassengerRequest: {
        type: "object",
        required: ["fullName", "phone"],
        properties: {
          companyId: {
            type: "string",
            format: "uuid",
            description: "Only required when the caller is super_admin."
          },
          fullName: { type: "string" },
          phone: { type: "string" },
          email: { type: "string", format: "email" },
          nationalId: { type: "string" }
        }
      },
      CreateBookingRequest: {
        type: "object",
        required: ["tripId", "seatCount"],
        properties: {
          tripId: { type: "string", format: "uuid" },
          passengerId: {
            type: "string",
            format: "uuid",
            description: "Use this for an existing passenger."
          },
          passenger: {
            type: "object",
            description:
              "Use this instead of passengerId to create a passenger while booking.",
            properties: {
              fullName: { type: "string" },
              phone: { type: "string" },
              email: { type: "string", format: "email" },
              nationalId: { type: "string" }
            }
          },
          seatCount: { type: "integer", minimum: 1, maximum: 20 }
        }
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        security: [],
        summary: "Check API health",
        responses: { "200": { description: "API is healthy" } }
      }
    },
    "/api/auth/sign-in": {
      post: {
        tags: ["Auth"],
        security: [],
        summary: "Sign in with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { "$ref": "#/components/schemas/AuthSignInRequest" }
            }
          }
        },
        responses: { "200": { description: "Signed in successfully" } }
      }
    },
    "/api/auth/sign-up": {
      post: {
        tags: ["Auth"],
        security: [],
        summary: "Create a new customer account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { "$ref": "#/components/schemas/AuthSignUpRequest" }
            }
          }
        },
        responses: { "201": { description: "Account created" } }
      }
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get the current Supabase-authenticated user",
        responses: { "200": { description: "Current user profile" } }
      }
    },
    "/api/companies": {
      post: {
        tags: ["Companies"],
        summary: "Create a company and make the caller company_owner",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { "$ref": "#/components/schemas/CreateCompanyRequest" }
            }
          }
        },
        responses: { "201": { description: "Company created" } }
      }
    },
    "/api/companies/{id}": {
      get: {
        tags: ["Companies"],
        summary: "Get a company by id",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Company loaded" } }
      },
      patch: {
        tags: ["Companies"],
        summary: "Update a company",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { "$ref": "#/components/schemas/CreateCompanyRequest" }
            }
          }
        },
        responses: { "200": { description: "Company updated" } }
      }
    },
    "/api/routes": {
      get: {
        tags: ["Routes"],
        summary: "List routes scoped to the caller's company",
        parameters: [
          { name: "companyId", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "active", in: "query", schema: { type: "boolean" } },
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } }
        ],
        responses: { "200": { description: "Routes loaded" } }
      },
      post: {
        tags: ["Routes"],
        summary: "Create a route",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { "$ref": "#/components/schemas/CreateRouteRequest" } } }
        },
        responses: { "201": { description: "Route created" } }
      }
    },
    "/api/routes/{id}": {
      get: {
        tags: ["Routes"],
        summary: "Get a route by id",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Route loaded" } }
      },
      patch: {
        tags: ["Routes"],
        summary: "Update a route",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { "$ref": "#/components/schemas/CreateRouteRequest" } } }
        },
        responses: { "200": { description: "Route updated" } }
      },
      delete: {
        tags: ["Routes"],
        summary: "Soft-delete a route by marking it inactive",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Route deleted" } }
      }
    },
    "/api/vehicles": {
      get: {
        tags: ["Vehicles"],
        summary: "List vehicles/cars scoped to the caller's Sacco",
        parameters: [
          { name: "companyId", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string", enum: ["active", "maintenance", "inactive"] } },
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } }
        ],
        responses: { "200": { description: "Vehicles loaded" } }
      },
      post: {
        tags: ["Vehicles"],
        summary: "Create a Sacco-owned vehicle/car",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { "$ref": "#/components/schemas/CreateVehicleRequest" } } }
        },
        responses: { "201": { description: "Vehicle created" } }
      }
    },
    "/api/vehicles/{id}": {
      get: {
        tags: ["Vehicles"],
        summary: "Get a vehicle by id",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Vehicle loaded" } }
      },
      patch: {
        tags: ["Vehicles"],
        summary: "Update a vehicle",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { "$ref": "#/components/schemas/CreateVehicleRequest" } } }
        },
        responses: { "200": { description: "Vehicle updated" } }
      },
      delete: {
        tags: ["Vehicles"],
        summary: "Deactivate a vehicle",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Vehicle deleted" } }
      }
    },
    "/api/trips": {
      get: {
        tags: ["Trips"],
        summary: "Search trips",
        parameters: [
          { name: "companyId", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "vehicleId", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "origin", in: "query", schema: { type: "string" } },
          { name: "destination", in: "query", schema: { type: "string" } },
          { name: "departureDate", in: "query", schema: { type: "string", example: "2026-06-01" } },
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } }
        ],
        responses: { "200": { description: "Trips loaded" } }
      },
      post: {
        tags: ["Trips"],
        summary: "Create a trip",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { "$ref": "#/components/schemas/CreateTripRequest" } } }
        },
        responses: { "201": { description: "Trip created" } }
      }
    },
    "/api/trips/{id}": {
      get: {
        tags: ["Trips"],
        summary: "Get a trip by id",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Trip loaded" } }
      },
      patch: {
        tags: ["Trips"],
        summary: "Update a trip",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { "$ref": "#/components/schemas/CreateTripRequest" } } }
        },
        responses: { "200": { description: "Trip updated" } }
      }
    },
    "/api/trips/{id}/cancel": {
      patch: {
        tags: ["Trips"],
        summary: "Cancel a trip",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Trip cancelled" } }
      }
    },
    "/api/passengers": {
      get: {
        tags: ["Passengers"],
        summary: "List passengers in the caller's company",
        responses: { "200": { description: "Passengers loaded" } }
      },
      post: {
        tags: ["Passengers"],
        summary: "Create a passenger",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { "$ref": "#/components/schemas/CreatePassengerRequest" } } }
        },
        responses: { "201": { description: "Passenger created" } }
      }
    },
    "/api/passengers/{id}": {
      get: {
        tags: ["Passengers"],
        summary: "Get a passenger by id",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Passenger loaded" } }
      },
      patch: {
        tags: ["Passengers"],
        summary: "Update a passenger",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { "$ref": "#/components/schemas/CreatePassengerRequest" } } }
        },
        responses: { "200": { description: "Passenger updated" } }
      }
    },
    "/api/bookings": {
      get: {
        tags: ["Bookings"],
        summary: "List company bookings or the caller's own bookings",
        parameters: [
          { name: "companyId", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "passengerId", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "tripId", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "status", in: "query", schema: { type: "string" } }
        ],
        responses: { "200": { description: "Bookings loaded" } }
      },
      post: {
        tags: ["Bookings"],
        summary: "Create a pending booking",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { "$ref": "#/components/schemas/CreateBookingRequest" } } }
        },
        responses: { "201": { description: "Booking created" } }
      }
    },
    "/api/bookings/{id}": {
      get: {
        tags: ["Bookings"],
        summary: "Get a company booking or the caller's own booking by id",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Booking loaded" } }
      }
    },
    "/api/bookings/{id}/confirm": {
      patch: {
        tags: ["Bookings"],
        summary: "Confirm booking and atomically reduce available seats",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Booking confirmed" } }
      }
    },
    "/api/bookings/{id}/cancel": {
      patch: {
        tags: ["Bookings"],
        summary: "Cancel booking and restore seats when already confirmed",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { reason: { type: "string" } }
              }
            }
          }
        },
        responses: { "200": { description: "Booking cancelled" } }
      }
    },
    "/api/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "List company notifications",
        responses: { "200": { description: "Notifications loaded" } }
      }
    },
    "/api/audit-logs": {
      get: {
        tags: ["Audit Logs"],
        summary: "List tenant-scoped audit logs",
        parameters: [
          { name: "companyId", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "action", in: "query", schema: { type: "string" } },
          { name: "entityType", in: "query", schema: { type: "string" } },
          { name: "actorId", in: "query", schema: { type: "string", format: "uuid" } }
        ],
        responses: { "200": { description: "Audit logs loaded" } }
      }
    }
  }
} as const;
