import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "../endpoints/auth.endpoints";
import { clearAuthSession, isAuthSessionMarked } from "@/utils/auth-session";

/**
 * Query key factory for auth
 */
export const authKeys = {
  all: ["auth"] as const,
  lists: () => [...authKeys.all, "list"] as const,
  list: (params?: any) => [...authKeys.lists(), params] as const,
  details: () => [...authKeys.all, "detail"] as const,
  detail: (id: string) => [...authKeys.details(), id] as const,
};

/**
 * Login
 */
export const useLogin = () => {
  return useMutation<any, Error, any>({
    mutationFn: (params: any) => authAPI.login(params),
  });
};

/**
 * Validate User to Editor
 */
export const useValidateUserToEditor = () => {
  return useMutation<any, Error, any>({
    mutationFn: () => authAPI.validateUserToEditor(),
  });
};

/**
 * Resend OTP
 */
export const useResendOtp = () => {
  return useMutation<any, Error, any>({
    mutationFn: (params: any) => authAPI.resendOtp(params),
  });
};

/**
 * Verify Bridge
 */
export const useConsumeBridge = () => {
  return useMutation<any, Error, any>({
    mutationFn: (params: any) => authAPI.consumeBridge(params),
  });
};

/**
 * Dev Login
 */
export const useDevLogin = () => {
  return useMutation<any, Error, any>({
    mutationFn: (params: any) => authAPI.devLogin(params),
  });
};

/**
 * Validate Phone
 */
export const useValidatePhone = () => {
  return useMutation<any, Error, any>({
    mutationFn: (params: any) => authAPI.validatePhone(params),
  });
};

/**
 * Dev Verify
 */
export const useDevVerify = () => {
  return useMutation<any, Error, any>({
    mutationFn: (params: any) => authAPI.devVerify(params),
  });
};

/**
 * Verify
 */
export const useVerify = () => {
  return useMutation<any, Error, any>({
    mutationFn: (params: any) => authAPI.verify(params),
  });
};

/**
 * Me
 */
export const useMe = () => {
  return useQuery<any, Error, any>({
    queryKey: authKeys.all,
    queryFn: () => authAPI.me(),
    enabled: isAuthSessionMarked(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Dev Me
 */
export const useDevMe = () => {
  return useQuery<any, Error, any>({
    queryKey: authKeys.all,
    queryFn: () => authAPI.devMe(),
  });
};

/**
 * Logout
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, any>({
    mutationFn: () => authAPI.logout(),
    onSettled: () => {
      clearAuthSession(queryClient);
    },
  });
};

/**
 * Me
 */
export const useRefresh = () => {
  return useQuery<any, Error, any>({
    queryKey: [...authKeys.all, "refresh"] as const,
    queryFn: () => authAPI.refresh(),
    enabled: isAuthSessionMarked(),
    retry: false,
  });
};

/**
 * Update Profile
 */
export const useUpdateProfile = () => {
  return useMutation<any, Error, any>({
    mutationFn: (params: any) => authAPI.updateProfile(params),
  });
};
