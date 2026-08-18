"use client";
// Testing deployment
import { useMemo, useState, useRef, useEffect } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import {
    Box,
    Button,
    Chip,
    Dialog,
    TextField,
    Typography,
    CircularProgress,
    Autocomplete,
    Checkbox,
} from "@mui/material";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CheckIcon from "@mui/icons-material/Check";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { getRuleConfigByDescription } from "@/utils/payCodeUtils";
import { RULE_DESCRIPTIONS } from "@/constants/rules";
import useAuthStore from "@/stores/useAuthStore";
import useAlertStore from "@/stores/useAlertStore";
import {
    useViewCalResults,
    useTerminatedEmployees,
    useProcessRule,
    useDownloadCalResults,
} from "@/api/hooks/useCalculations";
import { useGetEnterpriseAgreements, useGetPayCodesByEA } from "@/api/hooks/useRules";
import { downloadFile, getFilenameFromHeaders } from "@/utils/downloadHelper";
import AgGridInfo from "@/components/common/AgGridInfo";
import AgGridPagination from "@/components/common/AgGridPagination";
import TableSkeleton from "@/components/common/TableSkeleton";
import { defaultMasterColDef } from "@/components/data/masterGridConfig";
import { useDebounce } from "@/hooks/useDebounce";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const FONT = "'DM Sans', sans-serif";
const DEFAULT_PAGE_SIZE = 20;

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const inputSx = {
    "& .MuiOutlinedInput-root": {
        fontSize: 13,
        fontFamily: FONT,
        borderRadius: "9px",
        bgcolor: "#FFFFFF",
        "& fieldset": { borderColor: "#CDD3E3" },
        "&:hover fieldset": { borderColor: "#CDD3E3" },
        "&.Mui-focused fieldset": { borderColor: "#1A56DB" },
    },
    "& .MuiOutlinedInput-input": { py: "9px", px: "13px" },
};

const labelSx = {
    fontSize: 11,
    fontWeight: 500,
    color: "#5A6A8A",
    display: "block",
    mb: "5px",
};

const calculationGridSx = {
    flex: 1,
    width: "100%",
    minHeight: 320,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    "& .ag-root-wrapper": {
        flex: 1,
        minHeight: 0,
        height: "100%",
    },
    "& .ag-root-wrapper-body": {
        flex: 1,
        minHeight: 0,
        height: "100%",
    },
    "& .ag-header": {
        position: "sticky",
        top: 0,
        zIndex: 1,
    },
    "& .ag-header-group-cell": {
        bgcolor: "#061028 !important",
        "--ag-header-background-color": "#061028",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        "&:last-child": { borderRight: "none" },
    },
    "& .ag-header-group-cell-label": {
        fontSize: 9.5,
        fontWeight: 600,
        color: "rgba(255,255,255,0.5) !important",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        fontFamily: FONT,
    },
    "& .ag-header-cell": {
        bgcolor: "#3C4A6B !important",
        "--ag-header-background-color": "#3C4A6B",
        borderRight: "1px solid rgba(255,255,255,0.09)",
        "&:last-child": { borderRight: "none" },
    },
    "& .ag-header-cell-text": {
        fontSize: 9.5,
        fontWeight: 500,
        color: "#fff !important",
        fontFamily: FONT,
    },
    "& .ag-cell": {
        fontSize: 11.5,
        color: "#18243E",
        fontFamily: FONT,
        borderRight: "1px solid #E2E6F0",
        "&:last-child": { borderRight: "none" },
    },
    "& .ag-row": {
        borderBottom: "1px solid #E2E6F0",
    },
    "& .ag-row:nth-of-type(even)": {
        bgcolor: "#F4F6FA",
    },
    "& .ag-row-hover": {
        bgcolor: "#ECF2FF !important",
    },
};

const QualificationBadge = ({ value }) => {
    if (value === true || value === "yes") {
        return (
            <Chip
                size="small"
                icon={<CheckIcon sx={{ fontSize: "12px !important" }} />}
                label="Yes"
                sx={{
                    height: "auto",
                    fontSize: 10,
                    fontWeight: 600,
                    borderRadius: "20px",
                    px: 0.5,
                    bgcolor: "#E3F5EB",
                    color: "#0D6E3B",
                    border: "1px solid #9EDCB8",
                    "& .MuiChip-icon": { ml: 0.5, color: "#0D6E3B" },
                }}
            />
        );
    }

    if (value === "na-nurse") {
        return (
            <Chip
                size="small"
                label="N/A — nurse"
                sx={{
                    height: "auto",
                    fontSize: 10,
                    fontWeight: 600,
                    borderRadius: "20px",
                    px: 0.5,
                    bgcolor: "#FEF3E2",
                    color: "#864A00",
                    border: "1px solid #F5C675",
                }}
            />
        );
    }

    return (
        <Chip
            size="small"
            label="No"
            sx={{
                height: "auto",
                fontSize: 10,
                fontWeight: 600,
                borderRadius: "20px",
                px: 0.5,
                bgcolor: "#F4F6FA",
                color: "#5A6A8A",
                border: "1px solid #CDD3E3",
            }}
        />
    );
};

const RULE2_NA_CHIP_SX = {
    height: "auto",
    fontSize: 10,
    fontWeight: 600,
    borderRadius: "20px",
    px: 0.5,
    bgcolor: "#FEF3E2",
    color: "#864A00",
    border: "1px solid #F5C675",
};

const Rule2QualifiedCell = (params) => {
    const row = params.data;
    if (
        row?.rule2_applicable === false ||
        row?.rule2_applicable === 0 ||
        row?.rule2_applicable === null
    ) {
        return <Chip size="small" label="N/A" sx={RULE2_NA_CHIP_SX} />;
    }
    return <QualificationBadge value={params.value} />;
};

const CALCULATION_COLUMN_DEFS = [
    {
        headerName: "Employee",
        groupId: "employee",
        children: [
            {
                colId: "emp_period_id",
                field: "emp_period_id",
                headerName: "Employee no.",
                minWidth: 110,
                flex: 1,
                cellStyle: { fontFamily: "'DM Mono', monospace", fontSize: 11 },
            },
            {
                colId: "anniversary_year",
                field: "year_start",
                headerName: "Anniversary year",
                minWidth: 160,
                flex: 1.2,
                valueGetter: (params) =>
                    params.data
                        ? `${params.data.year_start} to ${params.data.year_end}`
                        : "",
            },
        ],
    },
    {
        headerName: "Rule 1 — Weekend work (all employees)",
        groupId: "rule1",
        children: [
            {
                colId: "rule1_weekend_count",
                field: "rule1_weekend_count",
                headerName: "Weekend count",
                minWidth: 100,
                flex: 0.8,
            },
            {
                colId: "rule1_threshold",
                headerName: "Threshold",
                minWidth: 100,
                flex: 0.8,
                valueGetter: (params) =>
                    `≥ ${params.context?.thresholds?.minWeekends ?? 10}`,
                cellStyle: { color: "#8A9ABB" },
            },
            {
                colId: "rule1_qualified",
                field: "rule1_qualified",
                headerName: "Rule 1 qualified",
                minWidth: 100,
                flex: 1,
                cellRenderer: (params) => <QualificationBadge value={params.value} />,
            },
        ],
    },
    {
        headerName: "Rule 2 — Outside core hours (non-nurses)",
        groupId: "rule2",
        children: [
            {
                colId: "rule2_count",
                field: "rule2_count",
                headerName: "Core hrs count",
                minWidth: 120,
                flex: 0.8,
            },
            {
                colId: "rule2_threshold",
                headerName: "Threshold",
                minWidth: 110,
                flex: 0.8,
                valueGetter: (params) =>
                    `≥ ${params.context?.thresholds?.minWeeks ?? 30}`,
                cellStyle: { color: "#8A9ABB" },
            },
            {
                colId: "rule2_qualified",
                field: "rule2_qualified",
                headerName: "Rule 2 qualified",
                minWidth: 130,
                flex: 1,
                cellRenderer: Rule2QualifiedCell,
            },
        ],
    },
    {
        headerName: "Leave entitlement",
        groupId: "leave_entitlement",
        children: [
            {
                colId: "is_shift_worker",
                field: "is_shift_worker",
                headerName: "Shift worker",
                minWidth: 110,
                flex: 0.8,
                cellRenderer: (params) => <QualificationBadge value={params.value} />,
            },
            {
                colId: "qualified_hrs",
                field: "qualified_hrs",
                headerName: "Qualified hrs",
                minWidth: 110,
                flex: 0.8,
                valueFormatter: (params) => params.value || "0.00",
            },
            {
                colId: "leave_entitlement",
                field: "leave_entitlement",
                headerName: "Leave Entitlement",
                minWidth: 130,
                flex: 0.9,
                valueFormatter: (params) => params.value || "0.00",
            },
        ],
    },
];

const Page = () => {
    const { setAlert } = useAlertStore();
    const gridRef = useRef(null);
    const [calcConfirmOpen, setCalcConfirmOpen] = useState(false);

    const [startDate, setStartDate] = useState("2018-07-01");
    const [endDate, setEndDate] = useState("2025-06-30");
    const [empFilter, setEmpFilter] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    const orgId = useAuthStore((state) => state.currentOrganisationId?.org_id);
    const [appliedFilters, setAppliedFilters] = useState({
        searchQuery: "",
        empFilter: [],
        startDate: "2018-07-01",
        endDate: "2025-06-30"
    });

    const resultsParams = useMemo(() => {
        const params = {
            page,
            page_size: pageSize,
        };

        const query = debouncedSearchQuery.trim();
        if (query) {
            params.search = query;
        }

        if (appliedFilters.startDate) {
            params.start_date = appliedFilters.startDate;
        }
        if (appliedFilters.endDate) {
            params.end_date = appliedFilters.endDate;
        }
        if (appliedFilters.empFilter?.length > 0) {
            params.employee_ids = appliedFilters.empFilter
                .map((emp) => emp.employee_id)
                .join(",");
        }

        return params;
    }, [page, pageSize, debouncedSearchQuery, appliedFilters]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearchQuery]);

    const {
        data: resultsData,
        isLoading,
        error: resultsError,
    } = useViewCalResults(resultsParams);

    const { data: employeesList = [] } = useTerminatedEmployees();
    const { data: eaData } = useGetEnterpriseAgreements(orgId);
    const eaId = eaData?.[0]?.ea_id;
    const { data: payCodesData } = useGetPayCodesByEA(eaId);
    const processRuleMutation = useProcessRule();
    const downloadCalResultsMutation = useDownloadCalResults();

    const calculationRows = resultsData?.records ?? [];
    const pagination = resultsData?.pagination ?? {
        total_count: 0,
        page: 1,
        page_size: pageSize,
        total_pages: 1,
    };
    const processing = processRuleMutation.isPending;
    const errorMessage = resultsError
        ? resultsError.message || "Failed to fetch view records."
        : null;

    const thresholds = useMemo(() => {
        let minWeekends = 10;
        let minWeeks = 30;

        if (Array.isArray(payCodesData)) {
            const parsedWeekend = getRuleConfigByDescription(
                payCodesData,
                RULE_DESCRIPTIONS.WEEKEND
            );
            if (parsedWeekend.min_weekends !== undefined) {
                minWeekends = parsedWeekend.min_weekends;
            }

            const parsedCore = getRuleConfigByDescription(
                payCodesData,
                RULE_DESCRIPTIONS.CORE_HOUR
            );
            if (parsedCore.min_weeks !== undefined) {
                minWeeks = parsedCore.min_weeks;
            }
        }

        return { minWeekends, minWeeks };
    }, [payCodesData]);

    const gridContext = useMemo(() => ({ thresholds }), [thresholds]);

    useEffect(() => {
        gridRef.current?.api?.refreshCells({
            columns: ["rule1_threshold", "rule2_threshold"],
            force: true,
        });
    }, [thresholds]);

    const calculationDefaultColDef = useMemo(
        () => ({
            ...defaultMasterColDef,
            sortable: false,
        }),
        []
    );


    const getCalculationScopeLabel = () => {
        if (empFilter && empFilter.length > 0) {
            return empFilter.map((emp) => emp.employee_id).join(", ");
        }
        return "All terminated employees";
    };

    const handleTriggerCalculationClick = () => {
        if (!startDate || !endDate) {
            setAlert({ severity: "warning", message: "Please set both start and end dates." });
            return;
        }
       
        setCalcConfirmOpen(true);
    };

    const handleConfirmCalculation = async () => {
        try {
            setAppliedFilters({
                searchQuery,
                empFilter,
                startDate,
                endDate,
            });
            setPage(1);

            const activeEmployeesOnly = employeesList.filter((emp) => {
                if (!emp) return false;
                return emp.term_date !== null && emp.term_date !== undefined && String(emp.term_date).trim() !== "";
            });

            const formatToISODate = (dateVal) => {
                const d = new Date(dateVal);
                if (isNaN(d.getTime())) return dateVal;
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const day = String(d.getDate()).padStart(2, "0");
                return `${d.getFullYear()}-${month}-${day}`;
            };

            const filteredSelectionIds = (empFilter || [])
                .map((emp) => emp.employee_id)
                .filter((id) => activeEmployeesOnly.some((activeEmp) => activeEmp.employee_id === id));

            const payload = {
                startDate: formatToISODate(startDate),
                endDate: formatToISODate(endDate),
                employeeData: activeEmployeesOnly,
                payCodesData: payCodesData ?? [],
                selectedEmployeeIds: filteredSelectionIds,
                orgId: orgId,
            };

            await processRuleMutation.mutateAsync(payload);
            setCalcConfirmOpen(false);
        } catch (err) {
            setCalcConfirmOpen(false);
            setAlert({
                severity: "error",
                message: `Calculation pipeline failed: ${err.message || err}`,
            });
        }
    };

    const handleDownloadExcel = async () => {
        try {
            if (!pagination.total_count) {
                setAlert({ severity: "error", message: "No data available to export." });
                return;
            }

            const response = await downloadCalResultsMutation.mutateAsync({
                threshold_rule1: thresholds.minWeekends,
                threshold_rule2: thresholds.minWeeks,
                search: resultsParams.search,
            });

            const filename = getFilenameFromHeaders(
                response.headers,
                "Shift_Worker_Leave_Recalculation.xlsx"
            );
            downloadFile(response.data, filename);
        } catch (error) {
            console.error("Excel download breakdown:", error);
            setAlert({
                severity: "error",
                message: "An error occurred while generating the Excel spreadsheet.",
            });
        }
    };
    const formatDateDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);

        const yy = String(date.getFullYear()); // Extracts last two digits (e.g., "2026" -> "26")
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const dd = String(date.getDate()).padStart(2, '0');

        // Returns YY/MM/DD
        return `${yy}/${mm}/${dd}`;
    };

    const showInitialSkeleton = isLoading && calculationRows.length === 0 && !errorMessage;

    return (
        <AppLayout>
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Typography
                    component="h1"
                    sx={{ fontSize: 20, fontWeight: 600, color: "#18243E", mb: 2 }}
                >
                    Shift worker leave recalculation
                </Typography>

                <Box
                    sx={{
                        bgcolor: "#FFFFFF",
                        border: "1px solid #CDD3E3",
                        borderRadius: "10px",
                        p: "20px 24px",
                        mb: 2.5,
                        display: "flex",
                        alignItems: "flex-end",
                        gap: 1.75,
                        flexWrap: "wrap",
                    }}
                >
                    <Box>
                        <Typography component="label" sx={labelSx}>
                            Start date
                        </Typography>
                        <TextField
                            type="date"
                            size="small"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            // FIX HERE: Use local 'startDate' state so the input UI updates instantly as you type/pick
                            slotProps={{
                                htmlInput: {
                                    'data-date': startDate ? formatDateDisplay(startDate) : ''
                                }
                            }}
                            sx={{
                                ...inputSx,
                                minWidth: 180,
                                '& .MuiOutlinedInput-input': {
                                    ...inputSx['& .MuiOutlinedInput-input'],
                                    position: 'relative',

                                    '&[data-date=""]': {
                                        color: 'inherit',
                                    },
                                    '&:not([data-date=""])': {
                                        color: 'transparent',
                                    },

                                    '&:not([data-date=""])::before': {
                                        content: 'attr(data-date)',
                                        color: '#000000',
                                        position: 'absolute',
                                        left: '13px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none',
                                    }
                                }
                            }}
                        />
                    </Box>

                    <Box>
                        <Typography component="label" sx={labelSx}>
                            End date
                        </Typography>
                        <TextField
                            type="date"
                            size="small"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            // Passes the formatted YY/MM/DD string to the HTML data attribute safely
                            slotProps={{
                                htmlInput: {
                                    'data-date': formatDateDisplay(endDate)
                                }
                            }}
                            sx={{
                                ...inputSx,
                                minWidth: 180,
                                '& .MuiOutlinedInput-input': {
                                    ...inputSx['& .MuiOutlinedInput-input'],
                                    position: 'relative',

                                    '&[data-date=""]': {
                                        color: 'inherit',
                                    },
                                    '&:not([data-date=""])': {
                                        color: 'transparent',
                                    },

                                    '&:not([data-date=""])::before': {
                                        content: 'attr(data-date)',
                                        color: '#000000',
                                        position: 'absolute',
                                        left: '13px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none',
                                    }
                                }
                            }}
                        />
                    </Box>

                    <Box sx={{ minWidth: 260, maxWidth: 400 }}>
                        <Typography component="label" sx={labelSx}>
                            Employee choice
                        </Typography>
                        <Autocomplete
                            multiple
                            disableCloseOnSelect
                            size="small"
                            options={employeesList}
                            value={empFilter}
                            onChange={(_, newValue) => setEmpFilter(newValue)}
                            getOptionLabel={(option) => {
                                const name = [option.first_name, option.last_name].filter(Boolean).join(" ");
                                return name ? `${name} (${option.employee_id})` : option.employee_id;
                            }}
                            isOptionEqualToValue={(option, value) => option.employee_id === value.employee_id}


                            renderOption={(props, option, { selected }) => {
                                // Destructure key cleanly so React handles list item identities perfectly
                                const { key, ...liProps } = props;
                                const name = [option.first_name, option.last_name].filter(Boolean).join(" ");
                                const optionLabel = name ? `${name} (${option.employee_id})` : option.employee_id;

                                return (
                                    <li key={key} {...liProps}>
                                        <Checkbox
                                            icon={icon}
                                            checkedIcon={checkedIcon}
                                            style={{ marginRight: 8 }}
                                            checked={selected}
                                        />
                                        {optionLabel}
                                    </li>
                                );
                            }}

                            // 3. DO NOT mutate or slice up the 'params' object here
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder={empFilter.length === 0 ? "All employees" : ""}
                                    sx={{
                                        ...inputSx,
                                        "& .MuiOutlinedInput-root": {
                                            ...inputSx["& .MuiOutlinedInput-root"],
                                            py: "3px",
                                            px: "8px",
                                        }
                                    }}
                                />
                            )}
                        />
                    </Box>

                    <Box
                        sx={{
                            width: "1px",
                            height: 38,
                            bgcolor: "#E2E6F0",
                            alignSelf: "flex-end",
                            flexShrink: 0,
                            display: { xs: "none", sm: "block" },
                        }}
                    />

                    <Button
                        variant="contained"
                        disabled={processing}
                        startIcon={processing ? <CircularProgress size={16} color="inherit" /> : <PlayArrowOutlinedIcon sx={{ fontSize: 15 }} />}
                        onClick={handleTriggerCalculationClick}
                        sx={{
                            bgcolor: "#1A56DB",
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: 500,
                            textTransform: "none",
                            borderRadius: "9px",
                            px: "16px",
                            py: "9px",
                            boxShadow: "none",
                            "&:hover": { bgcolor: "#1145B5", boxShadow: "none" },
                        }}
                    >
                        {processing ? "Syncing Config..." : "Trigger calculation"}
                    </Button>
                </Box>

                <Box
                    sx={{
                        bgcolor: "#FFFFFF",
                        border: "1px solid #CDD3E3",
                        borderRadius: "10px",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        minHeight: 0,
                        overflow: "hidden",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: "20px 24px 16px",
                            flexWrap: "wrap",
                            gap: 1.25,
                            flexShrink: 0,
                        }}
                    >
                        <Box>
                            <Typography sx={{ fontSize: 20, fontWeight: 600, color: "#18243E" }}>
                                Calculation output
                            </Typography>
                            {/* <Typography sx={{ fontSize: 11.5, color: "#5A6A8A", mt: "2px" }}>
                                {(() => {
                                    const formatOptions = { month: 'short', year: 'numeric' }; // 'short' gives 'Jul', 'long' gives 'July'

                                    const start = appliedFilters.startDate
                                        ? new Intl.DateTimeFormat('en-US', formatOptions).format(new Date(appliedFilters.startDate))
                                        : "Jul 2018";

                                    const end = appliedFilters.endDate
                                        ? new Intl.DateTimeFormat('en-US', formatOptions).format(new Date(appliedFilters.endDate))
                                        : "Jun 2025";

                                    return `${start} – ${end} · Live API Feed`;
                                })()}
                            </Typography> */}
                        </Box>

                        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                            <Box sx={{ position: "relative" }}>
                                <SearchOutlinedIcon
                                    sx={{
                                        position: "absolute",
                                        left: 10,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        fontSize: 13,
                                        color: "#8A9ABB",
                                        pointerEvents: "none",
                                        zIndex: 1,
                                    }}
                                />
                                <TextField
                                    placeholder="Search employee no."
                                    size="small"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    sx={{
                                        width: 220,
                                        "& .MuiOutlinedInput-root": {
                                            pl: "32px",
                                            fontSize: 12,
                                            fontFamily: FONT,
                                            borderRadius: "9px",
                                            bgcolor: "#FFFFFF",
                                            "& fieldset": { borderColor: "#CDD3E3" },
                                            "&:hover fieldset": { borderColor: "#CDD3E3" },
                                            "&.Mui-focused fieldset": { borderColor: "#1A56DB" },
                                        },
                                        "& .MuiOutlinedInput-input": { py: "8px", px: "12px" },
                                    }}
                                />
                            </Box>

                            <Button
                                variant="outlined"
                                disabled={downloadCalResultsMutation.isPending}
                                startIcon={
                                    downloadCalResultsMutation.isPending ? (
                                        <CircularProgress size={15} sx={{ color: "#0D6E3B" }} />
                                    ) : (
                                        <FileDownloadOutlinedIcon sx={{ fontSize: 15 }} />
                                    )
                                }
                                onClick={handleDownloadExcel}
                                sx={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                    textTransform: "none",
                                    borderRadius: "9px",
                                    // px: "16px",
                                    // py: "9px",
                                    color: "#0D6E3B",
                                    borderColor: "#9EDCB8",
                                    bgcolor: "#E3F5EB",
                                    "&:hover": { bgcolor: "#d3f0e1", borderColor: "#9EDCB8" },
                                }}
                            >
                                Download Excel
                            </Button>
                        </Box>
                    </Box>

                    {showInitialSkeleton ? (
                        <TableSkeleton rows={10} />
                    ) : errorMessage ? (
                        <Box sx={{ p: 4, textAlign: "center", color: "#d32f2f", flex: 1 }}>
                            <Typography sx={{ fontFamily: FONT, fontSize: 14 }}>{errorMessage}</Typography>
                        </Box>
                    ) : (
                        <>
                            <Box
                                className="ag-theme-alpine"
                                sx={{
                                    ...calculationGridSx,
                                    borderTop: "1px solid #CDD3E3",
                                }}
                            >
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={calculationRows}
                                    columnDefs={CALCULATION_COLUMN_DEFS}
                                    context={gridContext}
                                    defaultColDef={calculationDefaultColDef}
                                    rowHeight={40}
                                    headerHeight={40}
                                    groupHeaderHeight={32}
                                    suppressCellFocus
                                    suppressPaginationPanel
                                    animateRows={false}
                                    domLayout="normal"
                                    getRowId={(params) =>
                                        String(params.data?.result_id ?? params.data?.emp_period_id ?? params.rowIndex)
                                    }
                                    overlayNoRowsTemplate='<span style="font-family: DM Sans, sans-serif; font-size: 12px; color: #5A6A8A;">No tracking records found.</span>'
                                />
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    borderTop: "1px solid #CDD3E3",
                                    px: 2,
                                    py: 1.5,
                                    flexWrap: "wrap",
                                    gap: 1,
                                    flexShrink: 0,
                                }}
                            >
                                <AgGridInfo
                                    currentPage={pagination.page ?? page}
                                    rowsPerPage={pagination.page_size ?? pageSize}
                                    totalRows={pagination.total_count ?? 0}
                                />
                                <AgGridPagination
                                    currentPage={pagination.page ?? page}
                                    totalPages={pagination.total_pages ?? 1}
                                    onPageChange={setPage}
                                    pageSize={pagination.page_size ?? pageSize}
                                    onPageSizeChange={(newPageSize) => {
                                        setPageSize(newPageSize);
                                        setPage(1);
                                    }}
                                    isLoading={isLoading}
                                />
                            </Box>
                        </>
                    )}
                </Box>

                <Dialog
                    open={calcConfirmOpen}
                    onClose={() => !processing && setCalcConfirmOpen(false)}
                    maxWidth="xs"
                    fullWidth
                    slotProps={{
                        backdrop: { sx: { bgcolor: "rgba(7, 22, 56, 0.55)" } },
                        paper: {
                            sx: {
                                borderRadius: "12px",
                                p: 3,
                                textAlign: "center",
                                boxShadow: "0 8px 32px rgba(7, 22, 56, 0.18)",
                                fontFamily: FONT,
                            },
                        },
                    }}
                >
                    <Box
                        sx={{
                            width: 52,
                            height: 52,
                            borderRadius: "50%",
                            bgcolor: "#EFF6FF",
                            border: "2px solid #1A56DB",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mx: "auto",
                            mb: 2,
                            color: "#1A56DB",
                        }}
                    >
                        <CheckCircleIcon sx={{ fontSize: 26 }} />
                    </Box>

                    <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#18243E", mb: 1 }}>
                        Run classification engine?
                    </Typography>

                    <Typography sx={{ fontSize: 12.5, color: "#5A6A8A", mb: 0.75 }}>
                        Period: {startDate} → {endDate}
                    </Typography>
                    <Typography sx={{ fontSize: 12.5, color: "#5A6A8A", mb: 0.75 }}>
                        Scope: {getCalculationScopeLabel()}
                    </Typography>
                    <Typography sx={{ fontSize: 12.5, color: "#5A6A8A", mb: 2.5 }}>
                        Calculations will be processed for terminated employees only.
                    </Typography>

                    <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5 }}>
                        <Button
                            onClick={() => setCalcConfirmOpen(false)}
                            disabled={processing}
                            variant="outlined"
                            sx={{
                                textTransform: "none",
                                fontSize: 13,
                                fontFamily: FONT,
                                borderColor: "#CDD3E3",
                                color: "#18243E",
                                borderRadius: "9px",
                                px: 2.5,
                                "&:hover": { borderColor: "#CDD3E3", bgcolor: "#F6F7FB" },
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmCalculation}
                            disabled={processing}
                            variant="contained"
                            startIcon={processing ? <CircularProgress size={16} color="inherit" /> : null}
                            sx={{
                                textTransform: "none",
                                fontSize: 13,
                                fontFamily: FONT,
                                bgcolor: "#1A56DB",
                                borderRadius: "9px",
                                px: 2.5,
                                boxShadow: "none",
                                "&:hover": { bgcolor: "#1145B5", boxShadow: "none" },
                            }}
                        >
                            {processing ? "Running…" : "Confirm"}
                        </Button>
                    </Box>
                </Dialog>
            </Box>
        </AppLayout>
    );
};

export default Page;