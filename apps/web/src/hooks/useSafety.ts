import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { safetyApi } from "../lib/api/safety.api";

export function useFindRoute() {
  return useMutation({
    mutationFn: ({ origin, destination }: { origin: { lat: number, lng: number }, destination: { lat: number, lng: number } }) => 
      safetyApi.findRoute(origin, destination),
  });
}

export function useTriggerSOS() {
  return useMutation({
    mutationFn: ({ lat, lng }: { lat: number, lng: number }) => safetyApi.triggerSOS(lat, lng),
  });
}

export function useContacts() {
  return useQuery({
    queryKey: ["sos-contacts"],
    queryFn: safetyApi.getContacts,
  });
}

export function useAddContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: safetyApi.addContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sos-contacts"] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: safetyApi.deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sos-contacts"] });
    },
  });
}
