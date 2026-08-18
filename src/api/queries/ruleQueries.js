export const ruleQueries = {
  enterpriseAgreements: (orgId) => ["rules", "ea", orgId],
  payCodes: (eaId) => ["rules", "payCodes", eaId],
  allPayCodes: () => ["rules", "payCodes", "all"],
};
