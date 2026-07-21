import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../lib/api/auth.api";
import { useAuthStore } from "../state/auth.store";
import { useRouter } from "next/navigation";

export function useLogin() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data, variables) => {
      // Decode user from token or fetch /me? Let's fetch /me to get the User object.
      // Wait, we need to set the token in the store first so the request interceptor works
      useAuthStore.getState().setAuth(data.access_token, data.refresh_token, {
        id: "", // Will be updated by getMe
        email: variables.email,
        name: "",
      });
      
      try {
        const user = await authApi.getMe();
        setAuth(data.access_token, data.refresh_token, user);
      } catch (err) {
        console.error("Failed to fetch user details after login");
      }
      
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.push("/dashboard");
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: async (data, variables) => {
      useAuthStore.getState().setAuth(data.access_token, data.refresh_token, {
        id: "",
        email: variables.email,
        name: variables.name,
      });

      try {
        const user = await authApi.getMe();
        setAuth(data.access_token, data.refresh_token, user);
      } catch (err) {}

      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.push("/dashboard");
    },
  });
}

export function useCurrentUser() {
  const { accessToken, user, setUser } = useAuthStore();
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const data = await authApi.getMe();
      setUser(data);
      return data;
    },
    enabled: !!accessToken,
    initialData: user, // Fallback to store
  });
}

export function useLogout() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return () => {
    logout();
    queryClient.clear();
    router.push("/login");
  };
}
