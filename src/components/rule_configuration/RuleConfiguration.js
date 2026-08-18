"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, Dialog, TextField, Typography } from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import StraightenOutlinedIcon from "@mui/icons-material/StraightenOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import RotateLeftOutlinedIcon from "@mui/icons-material/RotateLeftOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import useAuthStore from "@/stores/useAuthStore";
import {
  useGetEnterpriseAgreements,
  useGetPayCodesByEA,
  useUpdateRule,
  useRevertAllRules,
} from "@/api/hooks/useRules";
import useAlertStore from "@/stores/useAlertStore";
import { ROLES } from "@/components/common/SideBar";
import { RULES, RULE_DESCRIPTIONS } from "@/constants/rules";
import { groupPayCodesByDescription } from "@/utils/payCodeUtils";

const FONT = "'DM Sans', sans-serif";

const MIN_QUALIFY_COUNT = 1;
const MAX_QUALIFY_COUNT = 52;
const MAX_NOTES_LENGTH = 200;

const validateQualifyingCount = (value, label) => {
  const num = Number(value);
  if (value === "" || value == null || Number.isNaN(num) || !Number.isInteger(num)) {
    return `${label} must be a whole number.`;
  }
  if (num < MIN_QUALIFY_COUNT || num > MAX_QUALIFY_COUNT) {
    return `${label} must be between ${MIN_QUALIFY_COUNT} and ${MAX_QUALIFY_COUNT}.`;
  }
  return null;
};

const validateWeekendCountThresholds = (count0, count1, count2) => {
  const c0 = Number(count0);
  const c1 = Number(count1);
  const c2 = Number(count2);
  if ([c0, c1, c2].some((n) => Number.isNaN(n))) {
    return "Weekend count thresholds must be valid numbers.";
  }
  if (c0 > c1 || c1 > c2) {
    return "Weekend count thresholds must satisfy count0 ≤ count1 ≤ count2.";
  }
  return null;
};

const validateCoreHourCountEquality = (count1, count2) => {
  const c1 = Number(count1);
  const c2 = Number(count2);
  if (Number.isNaN(c1) || Number.isNaN(c2)) {
    return "Outside ordinary hours shift counts must be valid numbers.";
  }
  if (c1 !== c2) {
    return "Outside ordinary hours shift counts must be equal.";
  }
  return null;
};

const WEEKEND_RULE_FIELDS = [
  "min_hrs",
  "min_weekends",
  "count0",
  "count1",
  "count2",
  "notes",
];

const CORE_HOUR_RULE_FIELDS = [
  "start",
  "end",
  "min_weeks",
  "count1",
  "count2",
  "notes",
];

const normalizeRuleField = (value) => {
  if (value == null || value === "") return "";
  return String(value);
};

const hasRuleFieldChanges = (currentRule, savedRule, fields) => {
  if (!currentRule || !savedRule) return false;

  return fields.some(
    (field) =>
      normalizeRuleField(currentRule[field]) !==
      normalizeRuleField(savedRule[field])
  );
};

const DEFAULTS = {
  rule1: { minHrs: "4", minWk: "10" },
  rule2: { start: "06:00", end: "18:00", minWk: "30", keyword: "Nurse" },
  assump1: { zero: "4", one: "7", two: "8", maxCount: "2", floor: "4" },
  assump2: { one: "8", two: "8" },
  assump3: { threshold: "30" },
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    fontSize: 13,
    fontFamily: FONT,
    borderRadius: "8px",
    bgcolor: "#F4F6FA",
    "& fieldset": { borderColor: "#CDD3E3" },
    "&:hover fieldset": { borderColor: "#CDD3E3" },
    "&.Mui-focused fieldset": { borderColor: "#1A56DB" },
    "&.Mui-disabled": { bgcolor: "#F4F6FA" },
  },
  "& .MuiOutlinedInput-input": { py: "8px", px: "11px" },
  "& .MuiOutlinedInput-input.Mui-disabled": {
    WebkitTextFillColor: "#8A9ABB",
  },
};

const outlineBtnSx = {
  fontSize: 12,
  fontFamily: FONT,
  textTransform: "none",
  borderRadius: "9px",
  px: "14px",
  py: "8px",
  color: "#18243E",
  borderColor: "#CDD3E3",
  bgcolor: "#FFFFFF",
  boxShadow: "none",
  "&:hover": { bgcolor: "#F4F6FA", borderColor: "#CDD3E3", boxShadow: "none" },
};

const primaryBtnSx = {
  fontSize: 12,
  fontFamily: FONT,
  fontWeight: 500,
  textTransform: "none",
  borderRadius: "9px",
  px: "14px",
  py: "8px",
  bgcolor: "#1A56DB",
  color: "#fff",
  boxShadow: "none",
  "&:hover": { bgcolor: "#1145B5", boxShadow: "none" },
  "&.Mui-disabled": { bgcolor: "#B8D0F7", color: "#fff" },
};

const fixBtnSx = {
  fontSize: 11,
  fontFamily: FONT,
  textTransform: "none",
  borderRadius: "9px",
  px: "12px",
  py: "6px",
  bgcolor: "#3C4A6B",
  color: "#fff",
  borderColor: "#3C4A6B",
  boxShadow: "none",
  "&:hover": { bgcolor: "#0A2358", boxShadow: "none" },
};

const dangerBtnSx = {
  fontSize: 12,
  fontFamily: FONT,
  fontWeight: 500,
  textTransform: "none",
  borderRadius: "9px",
  px: "14px",
  py: "8px",
  bgcolor: "#DC2626",
  color: "#fff",
  boxShadow: "none",
  "&:hover": { bgcolor: "#B91C1C", boxShadow: "none" },
  "&.Mui-disabled": { bgcolor: "#FCA5A5", color: "#fff" },
};

const FieldLabel = ({ children }) => (
  <Typography
    component="label"
    sx={{
      fontSize: 11,
      fontWeight: 500,
      color: "#5A6A8A",
      display: "block",
      mb: "5px",
    }}
  >
    {children}
  </Typography>
);

const FieldHint = ({ children }) => (
  <Typography sx={{ fontSize: 10, color: "#8A9ABB", mt: "3px" }}>
    {children}
  </Typography>
);

const NotesField = ({ value = "", disabled, onChange }) => (
  <Box sx={{ mt: 1.5 }}>
    <FieldLabel>Notes</FieldLabel>
    <TextField
      fullWidth
      multiline
      // Fixed `rows` renders a plain <textarea> (no ResizeObserver autosize),
      // which avoids the "Maximum update depth exceeded" loop inside a
      // scrollable container.
      rows={3}
      disabled={disabled}
      placeholder="Add notes for this change..."
      value={value}
      onChange={(e) => onChange(e.target.value.slice(0, MAX_NOTES_LENGTH))}
      slotProps={{ htmlInput: { maxLength: MAX_NOTES_LENGTH } }}
      sx={inputSx}
    />
    <Typography
      sx={{
        fontSize: 10,
        color: value.length >= MAX_NOTES_LENGTH ? "#DC2626" : "#8A9ABB",
        mt: "3px",
        textAlign: "right",
      }}
    >
      {value.length}/{MAX_NOTES_LENGTH}
    </Typography>
  </Box>
);

const PayCode = ({ code, label }) => (
  <Box
    component="span"
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 0.5,
      bgcolor: "#F4F6FA",
      border: "1px solid #CDD3E3",
      borderRadius: "6px",
      px: "9px",
      py: "3px",
      fontSize: 11,
      fontFamily: "'DM Mono', monospace",
      fontWeight: 500,
    }}
  >
    {code}
    <Box
      component="span"
      sx={{ fontSize: 9, fontWeight: 400, color: "#8A9ABB", fontFamily: FONT }}
    >
      {label}
    </Box>
  </Box>
);

const CohortBadge = ({ variant, children }) => {
  const isAll = variant === "all";
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        mt: "6px",
        px: "8px",
        py: "2px",
        borderRadius: "20px",
        fontSize: 10,
        fontWeight: 600,
        bgcolor: isAll ? "#E0ECFF" : "#FEF3E2",
        color: isAll ? "#1145B5" : "#864A00",
        border: `1px solid ${isAll ? "#B8D0F7" : "#F5C675"}`,
      }}
    >
      {isAll ? (
        <GroupsOutlinedIcon sx={{ fontSize: 10 }} />
      ) : (
        <PersonOffOutlinedIcon sx={{ fontSize: 10 }} />
      )}
      {children}
    </Box>
  );
};

const RuleCard = ({
  number,
  title,
  subtitle,
  cohort,
  children,
  footerNote,
  onFix,
  fixLabel = "Fix changes",
  fixDisabled,
  fixLocked = false,
}) => (
  <Box
    sx={{
      bgcolor: "#FFFFFF",
      border: "1px solid #CDD3E3",
      borderRadius: "10px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <Box sx={{ p: "14px 18px 12px", borderBottom: "1px solid #E2E6F0" }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            bgcolor: "#3C4A6B",
            color: "#fff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11.5,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {number}
        </Box>
        <Box>
          <Typography
            sx={{ fontSize: 13.5, fontWeight: 600, color: "#18243E" }}
          >
            {title}
          </Typography>
          <Typography
            sx={{ fontSize: 11, color: "#5A6A8A", mt: "5px", lineHeight: 1.5 }}
          >
            {subtitle}
          </Typography>
          {cohort}
        </Box>
      </Box>
    </Box>

    <Box sx={{ p: "14px 18px", flex: 1 }}>{children}</Box>

    <Box
      sx={{
        p: "12px 18px",
        borderTop: "1px solid #E2E6F0",
        bgcolor: "#F4F6FA",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 1,
        flexWrap: "wrap",
      }}
    >
      <Typography sx={{ fontSize: 10.5, color: "#8A9ABB" }}>
        {footerNote}
      </Typography>
      <Button
        variant="contained"
        size="small"
        disabled={fixDisabled}
        startIcon={
          fixLocked ? (
            <LockOutlinedIcon sx={{ fontSize: 13 }} />
          ) : (
            <SaveOutlinedIcon sx={{ fontSize: 13 }} />
          )
        }
        onClick={onFix}
        sx={{
          ...fixBtnSx,
          ...(fixDisabled && { opacity: 0.5, cursor: "not-allowed" }),
        }}
      >
        {fixLabel}
      </Button>
    </Box>
  </Box>
);

const SubTabBar = ({ activeTab, onChange }) => {
  const tabs = [
    {
      id: "rules",
      label: "Classification rules",
      icon: StraightenOutlinedIcon,
    },
    { id: "assump", label: "Data assumptions", icon: ChecklistOutlinedIcon },
  ];

  return (
    <Box
      sx={{
        flexShrink: 0,
        bgcolor: "#FFFFFF",
        border: "1px solid #CDD3E3",
        borderRadius: "9px",
        display: "flex",
        p: "4px",
        gap: "4px",
        mb: 1.5,
      }}
    >
      {tabs.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id;
        return (
          <Button
            key={id}
            onClick={() => onChange(id)}
            startIcon={<Icon sx={{ fontSize: 15 }} />}
            sx={{
              flex: 1,
              py: "9px",
              fontSize: 13,
              fontFamily: FONT,
              textTransform: "none",
              borderRadius: "9px",
              color: active ? "#1A56DB" : "#5A6A8A",
              fontWeight: active ? 600 : 400,
              bgcolor: active ? "#E0ECFF" : "transparent",
              border: active ? "1px solid #B8D0F7" : "1px solid transparent",
              boxShadow: "none",
              "&:hover": {
                bgcolor: active ? "#E0ECFF" : "#F4F6FA",
                boxShadow: "none",
              },
            }}
          >
            {label}
          </Button>
        );
      })}
    </Box>
  );
};

const StatementCard = ({ number, title, children }) => (
  <Box
    sx={{
      bgcolor: "#FFFFFF",
      border: "1px solid #CDD3E3",
      borderRadius: "10px",
      overflow: "hidden",
    }}
  >
    <Box
      sx={{
        bgcolor: "#F4F6FA",
        p: "11px 18px",
        borderBottom: "1px solid #E2E6F0",
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          bgcolor: "#8A9ABB",
          color: "#fff",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {number}
      </Box>
      <Typography sx={{ fontSize: 12.5, fontWeight: 500, color: "#5A6A8A" }}>
        {title}
      </Typography>
    </Box>
    <Box sx={{ p: "14px 18px" }}>{children}</Box>
  </Box>
);

const ReadOnlyRule = ({ children }) => (
  <Box
    sx={{
      bgcolor: "#F4F6FA",
      borderRadius: "9px",
      p: "11px 14px",
      fontSize: 12,

      color: "#5A6A8A",
      lineHeight: 1.6,
      "& strong": { color: "#18243E", fontWeight: 500 },
    }}
  >
    {children}
  </Box>
);



const RuleConfiguration = () => {
  const { setAlert } = useAlertStore();
  const currentRoleId = useAuthStore((state) => state.currentRoleId);
  const isViewOnly = Number(currentRoleId) === ROLES.USER;
  const [activeTab, setActiveTab] = useState("rules");
  const [showSaved, setShowSaved] = useState(false);
  const [revertModalOpen, setRevertModalOpen] = useState(false);

  const [weekendRule, setWeekendRule] = useState(null);
  const [coreHourRule, setCoreHourRule] = useState(null);
  const [eaId, setEaId] = useState(null);

  const [values, setValues] = useState({
    rules: {
      [RULE_DESCRIPTIONS.WEEKEND]: [{}],
      [RULE_DESCRIPTIONS.CORE_HOUR]: [{}],
    },
  });
  const [savedValues, setSavedValues] = useState({
    rules: {
      [RULE_DESCRIPTIONS.WEEKEND]: [{}],
      [RULE_DESCRIPTIONS.CORE_HOUR]: [{}],
    },
  });

  const orgId = useAuthStore((state) => state.currentOrganisationId?.org_id);

  // Fetch enterprise agreements via tanstack query
  const { data: eaData } = useGetEnterpriseAgreements(orgId);

  // Derive eaId from the first agreement when data arrives
  useEffect(() => {
    const firstEaId = eaData?.[0]?.ea_id;
    if (firstEaId && firstEaId !== eaId) {
      setEaId(firstEaId);
    }
  }, [eaData]);

  // Fetch pay codes for the resolved EA id via tanstack query
  const { data: payCodesData } = useGetPayCodesByEA(eaId);
  const updateRuleMutation = useUpdateRule(eaId);
  const revertAllRulesMutation = useRevertAllRules(eaId);
  const reverting = revertAllRulesMutation.isPending;

  // Process pay codes into component values whenever data arrives
  useEffect(() => {
    if (!payCodesData?.length) return;

    const formattedData = groupPayCodesByDescription(payCodesData);

    const weekendRuleData = formattedData.find(
      (item) => item.description === RULE_DESCRIPTIONS.WEEKEND
    );
    setWeekendRule(weekendRuleData);

    const coreHourRuleData = formattedData.find(
      (item) => item.description === RULE_DESCRIPTIONS.CORE_HOUR
    );
    setCoreHourRule(coreHourRuleData);

    setValues((prev) => ({
      ...prev,
      rules: formattedData.reduce((acc, item) => {
        acc[item.description] = item.rules.map((r) => ({
          payCode: r.payCode,
          ...r.config,
        }));
        return acc;
      }, {}),
    }));

    const nextSavedRules = formattedData.reduce((acc, item) => {
      acc[item.description] = item.rules.map((r) => ({
        payCode: r.payCode,
        ...r.config,
      }));
      return acc;
    }, {});

    setSavedValues({ rules: nextSavedRules });
  }, [payCodesData]);

  const hasWeekendChanges = useMemo(
    () =>
      hasRuleFieldChanges(
        values.rules?.[RULE_DESCRIPTIONS.WEEKEND]?.[0],
        savedValues.rules?.[RULE_DESCRIPTIONS.WEEKEND]?.[0],
        WEEKEND_RULE_FIELDS
      ),
    [values.rules, savedValues.rules]
  );

  const hasCoreHourChanges = useMemo(
    () =>
      hasRuleFieldChanges(
        values.rules?.[RULE_DESCRIPTIONS.CORE_HOUR]?.[0],
        savedValues.rules?.[RULE_DESCRIPTIONS.CORE_HOUR]?.[0],
        CORE_HOUR_RULE_FIELDS
      ),
    [values.rules, savedValues.rules]
  );

  const hasAnyChanges = hasWeekendChanges || hasCoreHourChanges;

  const syncSavedRule = (ruleName) => {
    setSavedValues((prev) => ({
      ...prev,
      rules: {
        ...prev.rules,
        [ruleName]: structuredClone(values.rules[ruleName]),
      },
    }));
  };



  const handleFixRule2 = async (isBulk = false) => {
    if (isViewOnly) return false;

    try {
      const rule = values.rules?.[RULE_DESCRIPTIONS.CORE_HOUR]?.[0];
      if (!rule) return false;

      const minWeeksError = validateQualifyingCount(
        rule.min_weeks,
        "Minimum weeks per anniversary year"
      );
      if (minWeeksError) {
        setAlert({ severity: "error", message: minWeeksError });
        return false;
      }

      const countError = validateCoreHourCountEquality(rule.count1, rule.count2);
      if (countError) {
        setAlert({ severity: "error", message: countError });
        return false;
      }

      const user_id = useAuthStore.getState().user.user_id;

      const userValue = {
        start: rule.start,
        end: rule.end,
        min_weeks: Number(rule.min_weeks),
        count1: Number(rule.count1),
        count2: Number(rule.count2),
      };

      await updateRuleMutation.mutateAsync({
        ruleId: RULES.CORE_HOUR,
        userValue,
        updatedBy: user_id,
        reason: rule.notes,
      });

      if (!isBulk) {
        setAlert({ severity: "success", message: "Rule 2 updated successfully." });
      }
      syncSavedRule(RULE_DESCRIPTIONS.CORE_HOUR);
      return true;
    } catch (err) {
      console.error("Failed to update Rule 2:", err);
      if (!isBulk) setAlert({ severity: "error", message: "Update failed. Please try again." });
      return false;
    }
  };

 

  const handleFixWeekendRule = async (isBulk = false) => {
    if (isViewOnly) return false;

    const user_id = useAuthStore.getState().user.user_id;
    const rule = values.rules?.[RULE_DESCRIPTIONS.WEEKEND]?.[0];
    if (!rule) return false;

    const minWeekendsError = validateQualifyingCount(
      rule.min_weekends,
      "Minimum weekends per anniversary year"
    );
    if (minWeekendsError) {
      setAlert({ severity: "error", message: minWeekendsError });
      return false;
    }

    const thresholdError = validateWeekendCountThresholds(
      rule.count0,
      rule.count1,
      rule.count2
    );
    if (thresholdError) {
      setAlert({ severity: "error", message: thresholdError });
      return false;
    }

    const userValue = {
      min_hrs: Number(rule.min_hrs),
      min_weekends: Number(rule.min_weekends),
      count0: Number(rule.count0),
      count1: Number(rule.count1),
      count2: Number(rule.count2),
    };

    try {
      await updateRuleMutation.mutateAsync({
        ruleId: RULES.WEEKEND,
        userValue,
        updatedBy: user_id,
        reason: rule.notes || "",
      });

      if (!isBulk) {
        setAlert({ severity: "success", message: "Rule 1 saved successfully." });
      }
      syncSavedRule(RULE_DESCRIPTIONS.WEEKEND);
      return true;
    } catch (err) {
      console.error("Failed to update weekend rule:", err);
      if (!isBulk) setAlert({ severity: "error", message: "Update failed. Please try again." });
      return false;
    }
  };
  const updateRule = (ruleName, field, value) => {
    setValues((prev) => ({
      ...prev,
      rules: {
        ...prev.rules,
        [ruleName]: [
          {
            ...prev.rules?.[ruleName]?.[0],
            [field]: value,
          },
        ],
      },
    }));
  };
  const handleRevertAll = async () => {
    if (isViewOnly || !eaId) return;

    try {
      const user_id = useAuthStore.getState().user.user_id;
      await revertAllRulesMutation.mutateAsync(user_id);

      setAlert({
        severity: "success",
        message: "Reverted all rules to their signed-off defaults.",
      });
      setRevertModalOpen(false);
    } catch (error) {
      console.error("Bulk revert failed:", error);
      setAlert({
        severity: "error",
        message: error.message || "Failed to revert rules. Please try again.",
      });
    }
  };

  const handleSaveAll = async () => {
    if (isViewOnly) return;

    try {
      const weekendOk = await handleFixWeekendRule(true);
      if (!weekendOk) return;

      const rule2Ok = await handleFixRule2(true);
      if (!rule2Ok) return;

      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3500);
    } catch (error) {
      console.error(error);
      setAlert({ severity: "error", message: "Save all failed. Please try again." });
    }
  };
  return (
      <Box
        sx={{
          fontFamily: FONT,
          height: "100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1.5,
            flexWrap: "wrap",
            gap: 1.25,
          }}
        >
          <Box>
            <Typography
              component="h1"
              sx={{ fontSize: 20, fontWeight: 600, color: "#18243E" }}
            >
              Rule configuration
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            {showSaved && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  bgcolor: "#E3F5EB",
                  color: "#0D6E3B",
                  border: "1px solid #9EDCB8",
                  borderRadius: "7px",
                  px: "11px",
                  py: "6px",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                <CheckCircleOutlinedIcon sx={{ fontSize: 14 }} />
                All changes saved
              </Box>
            )}
            {!isViewOnly && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<RotateLeftOutlinedIcon sx={{ fontSize: 13 }} />}
                  onClick={() => setRevertModalOpen(true)}
                  sx={outlineBtnSx}
                >
                  Revert to default
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveOutlinedIcon sx={{ fontSize: 13 }} />}
                  onClick={handleSaveAll}
                  disabled={!hasAnyChanges}
                  sx={primaryBtnSx}
                >
                  Save all changes
                </Button>
              </>
            )}
          </Box>
        </Box>

        <SubTabBar activeTab={activeTab} onChange={setActiveTab} />

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            scrollbarGutter: "stable",
            pr: { xs: 0, sm: 0.5 },
          }}
        >
        {activeTab === "rules" && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: 1.75,
              mb: 1,
            }}
          >
            <RuleCard

              number={1}

              title="Weekend work"

              subtitle="An employee is classified as a shift worker if they work for at least the specified minimum hours on a defined number of weekends per year."

              cohort={
                <CohortBadge variant="all">Applies to: All employees</CohortBadge>

              }

              // footerNote="Last changed: 09 Feb 2026 by Arjun Patel"

              onFix={() => handleFixWeekendRule()}
              fixDisabled={isViewOnly || !hasWeekendChanges}
              fixLocked={isViewOnly}
              fixLabel={isViewOnly ? "View only" : "Fix changes"}
            >
              <Box sx={{ mb: "11px" }}>
                <FieldLabel>Minimum hours per weekend day to count</FieldLabel>
                <TextField

                  fullWidth

                  type="number"
                  disabled={isViewOnly}

                  value={values.rules?.[RULE_DESCRIPTIONS.WEEKEND]?.[0]?.min_hrs ?? ""}
                  onChange={(e) =>
                    updateRule(RULE_DESCRIPTIONS.WEEKEND, "min_hrs", e.target.value)}

                  sx={inputSx}

                />
                <FieldHint>

                  Days with hours below this value = count 0
                </FieldHint>
              </Box>

              <Box sx={{ mb: "11px" }}>
                <FieldLabel>

                  Minimum weekends per anniversary year to qualify
                </FieldLabel>
                <TextField

                  fullWidth

                  type="number"
                  disabled={isViewOnly}
                  inputprops={{ min: MIN_QUALIFY_COUNT, max: MAX_QUALIFY_COUNT }}

                  value={values.rules?.[RULE_DESCRIPTIONS.WEEKEND]?.[0]?.min_weekends ?? ""}

                  onChange={(e) => updateRule(RULE_DESCRIPTIONS.WEEKEND, "min_weekends", e.target.value)}

                  sx={inputSx}

                />
                {/* <FieldHint>
                  Employee qualifies under Rule 1 if weekend count reaches this (1–52)
                </FieldHint> */}
              </Box>

              <Box sx={{ mt: 1.5 }}>
                <FieldLabel>

                  Pay codes used{" "}
                  <Box

                    component="span"

                    sx={{ fontSize: 9, color: "#8A9ABB", ml: 0.5 }}
                  >

                    READ-ONLY
                  </Box>
                </FieldLabel>

                <Box sx={{ display: "flex", gap: 1, mt: 0.75 }}>

                  {weekendRule?.rules?.map((rule) => (
                    <PayCode

                      key={rule.payCode}

                      code={rule.payCode}

                      label={rule.payCode === "P07" ? "Saturday" : "Sunday"}

                    />

                  ))}
                </Box>
              </Box>
              <NotesField
                value={values.rules?.[RULE_DESCRIPTIONS.WEEKEND]?.[0]?.notes ?? ""}
                disabled={isViewOnly}
                onChange={(val) =>
                  updateRule(RULE_DESCRIPTIONS.WEEKEND, "notes", val)
                }
              />
            </RuleCard>


            <RuleCard
              number={2}
              title="Regularly working outside core hours"
              subtitle="An employee is classified as a shift worker if they regularly work outside the defined core hours specified below (Monday to Friday only)."
              cohort={
                <CohortBadge variant="non">
                  Applies to: Non-nurses only
                </CohortBadge>
              }
              // footerNote="Last changed: 05 Feb 2026 by Arjun Patel"
              onFix={() => handleFixRule2()}
              fixDisabled={isViewOnly || !hasCoreHourChanges}
              fixLocked={isViewOnly}
              fixLabel={isViewOnly ? "View only" : "Fix changes"}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1.25,
                  mb: "11px",
                }}
              >
                <Box>
                  <FieldLabel>Core hours start</FieldLabel>
                  <TextField
                    fullWidth
                    type="time"
                    disabled={true}
                    value={values.rules?.[RULE_DESCRIPTIONS.CORE_HOUR]?.[0]?.start ?? ""}
                    onChange={(e) =>
                      updateRule(RULE_DESCRIPTIONS.CORE_HOUR, "start", e.target.value)
                    }
                    sx={inputSx}
                  />
                  <FieldHint>Monday to Friday</FieldHint>
                </Box>
                <Box>
                  <FieldLabel>Core hours end</FieldLabel>
                  <TextField
                    fullWidth
                    type="time"
                    disabled={true}
                    value={values.rules?.[RULE_DESCRIPTIONS.CORE_HOUR]?.[0]?.end ?? ""}
                    onChange={(e) =>
                      updateRule(RULE_DESCRIPTIONS.CORE_HOUR, "end", e.target.value)
                    }
                    sx={inputSx}
                  />
                  <FieldHint>Monday to Friday</FieldHint>
                </Box>
              </Box>
              <Box sx={{ mb: "11px" }}>
                <FieldLabel>
                  Minimum weeks per anniversary year to qualify
                </FieldLabel>
                <TextField
                  fullWidth
                  type="number"
                  disabled={isViewOnly}
                  inputprops={{ min: MIN_QUALIFY_COUNT, max: MAX_QUALIFY_COUNT }}
                  value={values.rules?.[RULE_DESCRIPTIONS.CORE_HOUR]?.[0]?.min_weeks ?? ""}
                  onChange={(e) =>
                    updateRule(RULE_DESCRIPTIONS.CORE_HOUR, "min_weeks", e.target.value)
                  }
                  
                  sx={inputSx}
                />
                {/* <FieldHint>Weeks do not need to be consecutive (1–52)</FieldHint> */}
              </Box>
              
              <Box sx={{ mt: 1.5 }}>
                <FieldLabel>
                  Pay code used{" "}
                  <Box
                    component="span"
                    sx={{ fontSize: 9, color: "#8A9ABB", ml: 0.5 }}
                  >
                    READ-ONLY
                  </Box>
                </FieldLabel>
                <Box sx={{ mt: 0.75 }}>
                  {coreHourRule?.rules?.map((rule) => (
                    <PayCode
                      key={rule.payCode}
                      code={rule.payCode}
                      label="Night shift"
                    />
                  ))}
                </Box>
              </Box>
              <NotesField
                value={values.rules?.[RULE_DESCRIPTIONS.CORE_HOUR]?.[0]?.notes ?? ""}
                disabled={isViewOnly}
                onChange={(val) =>
                  updateRule(RULE_DESCRIPTIONS.CORE_HOUR, "notes", val)
                }
              />
            </RuleCard>

            <RuleCard
              number={3}
              title="Time window"
              subtitle="Defines the 12-month evaluation period used for both Rule 1 and Rule 2 classification. Anchored to each employee's anniversary date."
              cohort={
                <CohortBadge variant="all">Applies to: All employees</CohortBadge>
              }
              fixLabel="Locked"
              fixDisabled
              onFix={() =>
                setAlert({
                  severity: "info",
                  isPopUp: true,
                  title: "Rule 3 — Locked",
                  message: "Rule 3 period is locked per signed assumptions and cannot be modified.",
                })
              }
            >
              <ReadOnlyRule>
                <strong>Anniversary date</strong> = first day of permanent
                employment.
                <br />
                <br />
                <strong>Block length:</strong> 12-month blocks, starting from each
                employee&apos;s anniversary date.
                <br />
                <br />
                <strong>Count reset:</strong> All Rule 1 and Rule 2 counts reset
                on the anniversary date of permanent employment each year.
                <br />
                <br />
                <strong>Boundary years:</strong> Partial anniversary years at the
                start or end of the recalculation period are excluded from scope.
              </ReadOnlyRule>

            </RuleCard>
          </Box>
        )}

        {activeTab === "assump" && (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                gap: 1.75,
                mb: 3,
              }}
            >
              <RuleCard
                number={1}
                title="Weekend counts"
                subtitle={
                  <>
                    Covers how weekend hours are accumulated, how per-day pay
                    codes (P07/P08) translate into counts, and the minimum total
                    hours floor. Weekend hours are counted{" "}
                    <strong>per fortnight</strong>, not by week.
                  </>
                }
                // footerNote="Last changed: 09 Feb 2026 by Arjun Patel"
                onFix={() => handleFixWeekendRule()}
                fixDisabled={isViewOnly || !hasWeekendChanges}
                fixLocked={isViewOnly}
                fixLabel={isViewOnly ? "View only" : "Fix changes"}
              >
                <Typography
                  sx={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: "#8A9ABB",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    mb: 1.25,
                  }}
                >
                  Per-day thresholds — P07 (Saturday) &amp; P08 (Sunday)
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 1.25,
                    mb: "11px",
                  }}
                >
                  <Box>
                    <FieldLabel>Hours below this → count 0</FieldLabel>
                    <TextField
                      fullWidth
                      type="number"
                      disabled={isViewOnly}
                      value={values.rules?.[RULE_DESCRIPTIONS.WEEKEND]?.[0]?.count0}
                      onChange={(e) => updateRule(RULE_DESCRIPTIONS.WEEKEND, "count0", e.target.value)}
                      sx={inputSx}
                    />
                    <FieldHint>e.g. 3 hrs on Saturday = count 0</FieldHint>
                  </Box>
                  <Box>
                    <FieldLabel>Hours below this value → count 1</FieldLabel>
                    <TextField
                      fullWidth
                      type="number"
                      disabled={isViewOnly}
                      value={values.rules?.[RULE_DESCRIPTIONS.WEEKEND]?.[0]?.count1}
                      onChange={(e) => updateRule(RULE_DESCRIPTIONS.WEEKEND, "count1", e.target.value)}
                      sx={inputSx}
                    />
                    <FieldHint>e.g. 6 hrs on Saturday = count 1</FieldHint>
                  </Box>
                </Box>
                <Box sx={{ mb: "11px" }}>
                  <FieldLabel>Hours equal to or above this → count 2</FieldLabel>
                  <TextField
                    fullWidth
                    type="number"
                    disabled={isViewOnly}
                    value={values.rules?.[RULE_DESCRIPTIONS.WEEKEND]?.[0]?.count2}
                    onChange={(e) => updateRule(RULE_DESCRIPTIONS.WEEKEND, "count2", e.target.value)}
                    sx={inputSx}
                  />
                  <FieldHint>e.g. 9 hrs on Saturday = count 2</FieldHint>
                </Box>
                <Box sx={{ borderTop: "1px solid #E2E6F0", my: 1.5 }} />
              
                <Box sx={{ mt: 1.25 }}>
                  <FieldLabel>
                    Pay codes{" "}
                    <Box
                      component="span"
                      sx={{ fontSize: 9, color: "#8A9ABB", ml: 0.5 }}
                    >
                      READ-ONLY
                    </Box>
                  </FieldLabel>
                  <Box sx={{ display: "flex", gap: 1, mt: 0.75 }}>
                    {weekendRule?.rules?.map((rule) => (
                      <PayCode

                        key={rule.payCode}

                        code={rule.payCode}

                        label={rule.payCode === "P07" ? "Saturday" : "Sunday"}

                      />

                    ))}
                  </Box>
                </Box>
              </RuleCard>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
                <RuleCard
                  number={2}
                  title="Outside ordinary hours shift counts"
                  subtitle={`How night shift hours (${coreHourRule?.rules?.[0]?.payCode ?? ""}) translate into outside-core-hours instance counts used in Rule 2.`}
                  // footerNote="Last changed: 02 Feb 2026 by Rohit Desai"
                  onFix={() => handleFixRule2()}
                  fixDisabled={isViewOnly || !hasCoreHourChanges}
                  fixLocked={isViewOnly}
                  fixLabel={isViewOnly ? "View only" : "Fix changes"}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 1.25,
                      mb: "11px",
                    }}
                  >
                    <Box>
                      <FieldLabel>
                        {coreHourRule?.rules?.[0]?.payCode} hours below this → 1 count
                      </FieldLabel>
                      <TextField
                        fullWidth
                        type="number"
                        disabled={isViewOnly}
                        value={values.rules?.[RULE_DESCRIPTIONS.CORE_HOUR]?.[0]?.count1 ?? ""}
                        onChange={(e) => updateRule(RULE_DESCRIPTIONS.CORE_HOUR, "count1", e.target.value)}
                        sx={inputSx}
                      />
                      <FieldHint>
                        e.g. 6 hrs {coreHourRule?.rules?.[0]?.payCode} = 1 count
                      </FieldHint>
                    </Box>
                    <Box>
                      <FieldLabel>
                        {coreHourRule?.rules?.[0]?.payCode} hours equal to or above this → 2 counts
                      </FieldLabel>
                      <TextField
                        fullWidth
                        type="number"
                        disabled={isViewOnly}
                        value={values.rules?.[RULE_DESCRIPTIONS.CORE_HOUR]?.[0]?.count2 ?? ""}
                        onChange={(e) => updateRule(RULE_DESCRIPTIONS.CORE_HOUR, "count2", e.target.value)}
                        sx={inputSx}
                      />
                      <FieldHint>
                        e.g. 10 hrs {coreHourRule?.rules?.[0]?.payCode} = 2 counts
                      </FieldHint>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 1.25 }}>
                    <FieldLabel>
                      Pay code{" "}
                      <Box
                        component="span"
                        sx={{ fontSize: 9, color: "#8A9ABB", ml: 0.5 }}
                      >
                        READ-ONLY
                      </Box>
                    </FieldLabel>
                    <Box sx={{ mt: 0.75 }}>
                      {coreHourRule?.rules?.map((rule) => (
                        <PayCode
                          key={rule.payCode}
                          code={rule.payCode}
                          label="Night shift"
                        />
                      ))}
                    </Box>
                  </Box>
                </RuleCard>

                {/* <RuleCard
                  number={3}
                  title="Shift worker qualification threshold"
                  subtitle="The count value that, when reached within an anniversary year, classifies an employee as a shift worker."
                  footerNote="Last changed: 09 Feb 2026 by Arjun Patel"
                  onFix={() => handleFixAssump(3)}
                >
                  <Box>
                    <FieldLabel>
                      Count threshold to qualify as shift worker / year
                    </FieldLabel>
                    <TextField
                      fullWidth
                      type="number"
                      value={values.rules?.[RULE_DESCRIPTIONS.CORE_HOUR]?.[0]?.min_weeks ?? ""}
                      onChange={(e) =>
                        update("assump3", "threshold", e.target.value)
                      }
                      sx={inputSx}
                    />
                    <FieldHint>
                      When the employee&apos;s count reaches this value within the
                      anniversary year, they qualify as a shift worker for that
                      year
                    </FieldHint>
                  </Box>
                </RuleCard> */}
              </Box>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 1.75,
                mb: 3,
              }}
            >
              {/* <StatementCard number={4} title="Out-of-cycle pay exclusion">
                <ReadOnlyRule>
                  Out of cycle pays are <strong>excluded</strong> from qualifying
                  for shift worker. Only regular scheduled pay periods are counted
                  toward Rule 1 and Rule 2 thresholds.
                </ReadOnlyRule>
              </StatementCard>
              <StatementCard
                number={5}
                title="Partial anniversary year exclusion"
              >
                <ReadOnlyRule>
                  Partial anniversary year hours — both <strong>pre</strong> and{" "}
                  <strong>post</strong> the recalculation period (July 2018 – June
                  2025) — are <strong>not part of this scope</strong> and are
                  excluded from all calculations.
                </ReadOnlyRule>
              </StatementCard> */}
            </Box>
          </>
        )}
        </Box>

        <Dialog
          open={revertModalOpen}
          onClose={() => !reverting && setRevertModalOpen(false)}
          maxWidth="xs"
          slotProps={{
            backdrop: { sx: { bgcolor: "rgba(7, 22, 56, 0.55)" } },
            paper: {
              sx: {
                borderRadius: "12px",
                p: 3,
                textAlign: "center",
                boxShadow: "0 8px 32px rgba(7, 22, 56, 0.18)",
              },
            },
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              bgcolor: "#FEF3C7",
              border: "2px solid #F59E0B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
              color: "#D97706",
            }}
          >
            <WarningAmberRoundedIcon sx={{ fontSize: 24 }} />
          </Box>

          <Typography
            sx={{ fontSize: 16, fontWeight: 600, color: "#18243E", mb: 1 }}
          >
            Revert to defaults?
          </Typography>

          <Typography sx={{ fontSize: 12.5, color: "#5A6A8A", mb: 1.5 }}>
            Revert all rules and assumptions to their signed-off default values.
            This action cannot be undone.
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5 }}>
            <Button
              onClick={() => setRevertModalOpen(false)}
              disabled={reverting}
              sx={outlineBtnSx}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRevertAll}
              disabled={reverting}
              sx={dangerBtnSx}
              variant="contained"
            >
              {reverting ? "Reverting…" : "Revert all"}
            </Button>
          </Box>
        </Dialog>
      </Box>
  );
};

export default RuleConfiguration;
