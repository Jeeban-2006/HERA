import { useQuery } from '@tanstack/react-query';
import { getRecentActivity } from '@/lib/api/user.api';

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['recentActivity'],
    queryFn: getRecentActivity,
  });
};
