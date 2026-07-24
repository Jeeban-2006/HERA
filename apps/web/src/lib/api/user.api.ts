import apiClient from "./client";

export interface UserActivity {
  id: string;
  module: string;
  title: string;
  description: string;
  timestamp: string;
  icon_name: string;
}

export const getRecentActivity = async (): Promise<UserActivity[]> => {
  const { data } = await apiClient.get("/users/me/activity");
  return data;
};
