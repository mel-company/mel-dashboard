import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  employeeAPI,
  type CreateEmployeePayload,
  type UpdateEmployeePayload,
} from "../endpoints/employee.endpoints";

export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (params?: unknown) => [...employeeKeys.lists(), params] as const,
  details: () => [...employeeKeys.all, "detail"] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
  stats: () => [...employeeKeys.all, "stats"] as const,
  roleTemplates: () => [...employeeKeys.all, "role-templates"] as const,
};

export const useFetchEmployees = (params?: unknown) => {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => employeeAPI.fetchAll(params as any),
  });
};

export const useFetchEmployeeStats = () => {
  return useQuery({
    queryKey: employeeKeys.stats(),
    queryFn: () => employeeAPI.fetchStats(),
  });
};

export const useFetchEmployeeRoleTemplates = (enabled = true) => {
  return useQuery({
    queryKey: employeeKeys.roleTemplates(),
    queryFn: () => employeeAPI.fetchRoleTemplates(),
    enabled,
  });
};

export const useFetchEmployee = (id: string, enabled = true) => {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => employeeAPI.fetchOne(id),
    enabled: enabled && !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employee: CreateEmployeePayload) =>
      employeeAPI.create(employee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      queryClient.invalidateQueries({ queryKey: ["employee"] });
      queryClient.invalidateQueries({ queryKey: ["employee/cursor"] });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeePayload }) =>
      employeeAPI.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      queryClient.invalidateQueries({ queryKey: ["employee"] });
      queryClient.invalidateQueries({ queryKey: ["employee/cursor"] });
      if (data?.id) {
        queryClient.setQueryData(employeeKeys.detail(data.id), data);
      }
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeeAPI.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      queryClient.invalidateQueries({ queryKey: ["employee"] });
      queryClient.invalidateQueries({ queryKey: ["employee/cursor"] });
      queryClient.removeQueries({ queryKey: employeeKeys.detail(deletedId) });
    },
  });
};
