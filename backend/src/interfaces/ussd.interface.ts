export interface UssdSession {
  sessionId: string;
  phoneNumber: string;
  state: string;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UssdRequest {
  sessionId: string;
  phoneNumber: string;
  networkCode: string;
  serviceCode: string;
  text: string;
}
