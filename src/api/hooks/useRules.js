import { useMutation, useQuery } from "@tanstack/react-query";
import { ruleService } from "../services/ruleService";
import { ruleQueries } from "../queries/ruleQueries";
import { auditLogQueries } from "../queries/auditLogQueries";
import { queryClient } from "@/lib/queryClient";
import { RULES } from "@/constants/rules";

const invalidatePayCodesAndAuditLog = (eaId) => {
  if (eaId) {
    queryClient.invalidateQueries({ queryKey: ruleQueries.payCodes(eaId) });
  }
  queryClient.invalidateQueries({ queryKey: auditLogQueries.lists() });
};

export const useGetEnterpriseAgreements = (orgId, options = {}) =>
  useQuery({
    queryKey: ruleQueries.enterpriseAgreements(orgId),
    queryFn: () => ruleService.getEnterpriseAgreements(orgId),
    enabled: !!orgId,
    ...options,
  });

export const useGetPayCodesByEA = (eaId, options = {}) =>
  useQuery({
    queryKey: ruleQueries.payCodes(eaId),
    queryFn: () => ruleService.getPayCodesByEA(eaId),
    enabled: !!eaId,
    ...options,
  });

export const useGetAllPayCodes = (options = {}) =>
  useQuery({
    queryKey: ruleQueries.allPayCodes(),
    queryFn: ruleService.getAllPayCodes,
    ...options,
  });

export const useUpdatePayCode = (eaId) =>
  useMutation({
    mutationFn: ({ payCode, userValue, updatedBy, reason }) =>
      ruleService.updatePayCode({
        payCode,
        userValue,
        updatedBy,
        reason,
      }),
    onSuccess: () => {
      invalidatePayCodesAndAuditLog(eaId);
    },
  });

export const useUpdateRule = (eaId) =>
  useMutation({
    mutationFn: ({ ruleId, userValue, updatedBy, reason }) =>
      ruleService.updateRule({
        ruleId,
        eaId,
        userValue,
        updatedBy,
        reason,
      }),
    onSuccess: () => {
      invalidatePayCodesAndAuditLog(eaId);
    },
  });

export const useResetPayCode = (eaId) =>
  useMutation({
    mutationFn: ({ payCode, updatedBy }) =>
      ruleService.resetPayCode({ payCode, updatedBy }),
    onSuccess: () => {
      invalidatePayCodesAndAuditLog(eaId);
    },
  });

export const useResetRule = (eaId) =>
  useMutation({
    mutationFn: ({ ruleId, updatedBy }) =>
      ruleService.resetRule({ ruleId, eaId, updatedBy }),
    onSuccess: () => {
      invalidatePayCodesAndAuditLog(eaId);
    },
  });

export const useRevertAllRules = (eaId) =>
  useMutation({
    mutationFn: async (updatedBy) => {
      const ruleIds = [RULES.WEEKEND, RULES.CORE_HOUR];

      const results = await Promise.allSettled(
        ruleIds.map((ruleId) =>
          ruleService.resetRule({ ruleId, eaId, updatedBy })
        )
      );

      const failed = results.filter((result) => result.status === "rejected");
      if (failed.length > 0) {
        throw new Error(
          `Failed to reset ${failed.length} of ${ruleIds.length} rule(s)`
        );
      }

      return { resetCount: ruleIds.length };
    },
    onSuccess: () => {
      invalidatePayCodesAndAuditLog(eaId);
    },
  });
