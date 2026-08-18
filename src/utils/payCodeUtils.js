import { RULES } from "@/constants/rules";

export const getEffectiveValue = (payCode) =>
  payCode.user_value ?? payCode.default_value;

export const isModified = (payCode) =>
  payCode.user_value != null && payCode.user_value !== payCode.default_value;

export const parsePayCodeConfig = (payCode) => {
  const raw = getEffectiveValue(payCode);

  if (raw == null || raw === "") {
    return {};
  }

  if (typeof raw === "object") {
    return raw;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Invalid pay code JSON:", raw);
    return {};
  }
};

export const findPayCodeByDescription = (payCodes, description) => {
  if (!Array.isArray(payCodes) || !description) return undefined;
  return payCodes.find((item) => item.description === description);
};

export const getRuleConfigByDescription = (payCodes, description) => {
  const payCode = findPayCodeByDescription(payCodes, description);
  return payCode ? parsePayCodeConfig(payCode) : {};
};

export const groupPayCodesByDescription = (payCodes) => {
  if (!Array.isArray(payCodes)) return [];

  return Object.values(
    payCodes.reduce((acc, item) => {
      const key = item.description;
      if (!acc[key]) acc[key] = { description: item.description, rules: [] };

      acc[key].rules.push({
        payCode: item.pay_code,
        config: parsePayCodeConfig(item),
      });
      return acc;
    }, {})
  );
};

export const isWeekendAuditRow = (row) => {
  if (row?.rule_id != null) return Number(row.rule_id) === RULES.WEEKEND;

  const payCodeList = String(row?.pay_code ?? "")
    .split(",")
    .map((code) => code.trim());

  return payCodeList.some((code) => code === "P07" || code === "P08");
};

export const isCoreHourAuditRow = (row) => {
  if (row?.rule_id != null) return Number(row.rule_id) === RULES.CORE_HOUR;

  const payCodeList = String(row?.pay_code ?? "")
    .split(",")
    .map((code) => code.trim());

  return payCodeList.some((code) => code === "P19");
};
