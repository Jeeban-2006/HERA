import apiClient from "./client";
import { transformRouteResponse } from "./transformers";
import { RouteResult, EmergencyContact } from "@/types/safety.types";

export const safetyApi = {
  findRoute: async (origin: { lat: number, lng: number }, destination: { lat: number, lng: number }): Promise<RouteResult> => {
    const res = await apiClient.post("/safety/route", { origin, destination });
    return transformRouteResponse(res.data);
  },
  triggerSOS: async (lat: number, lng: number) => {
    const res = await apiClient.post("/safety/sos", { lat, lng });
    return res.data;
  },
  getContacts: async (): Promise<EmergencyContact[]> => {
    const res = await apiClient.get("/safety/contacts");
    return res.data;
  },
  addContact: async (data: any) => {
    const res = await apiClient.post("/safety/contacts", data);
    return res.data;
  },
  deleteContact: async (id: string) => {
    const res = await apiClient.delete(`/safety/contacts/${id}`);
    return res.data;
  }
};
