"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import useAuthStore from "@/stores/useAuthStore";

// Role constants 
export const ROLES = {
  ADMIN: 6,
  USER: 7,
};

const SIDEBAR_SECTIONS = [
  {
    title: "Configuration",
    items: [
      {
        id: "rule-configuration",
        label: "Rule configuration",
        href: "/configuration/rules",
        icon: TuneOutlinedIcon,
        defaultTab: true,
        allowedRoles: [ROLES.ADMIN, ROLES.USER], 
      },
      {
        id: "audit-log",
        label: "Audit log",
        href: "/configuration/audit-log",
        icon: HistoryOutlinedIcon,
        allowedRoles: [ROLES.ADMIN], 
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        id: "user-management",
        label: "User management",
        href: "/admin/users",
        icon: PeopleOutlinedIcon,
        defaultTab: true,
        allowedRoles: [ROLES.ADMIN], 
      },
      {
        id: "data-management",
        label: "Data management",
        href: "/admin/data",
        icon: StorageOutlinedIcon,
        allowedRoles: [ROLES.ADMIN, ROLES.USER], 
      },
      {
        id: "user-calculations",
        label: "User Calculations",
        href: "/admin/calculations",
        icon: StorageOutlinedIcon,
        allowedRoles: [ROLES.ADMIN, ROLES.USER], 
      }
    ],
  },
];

/**
 * Filters sidebar items based on user's role
 * @param {Array} sections - Sidebar sections configuration
 * @param {number} roleId - Current user's role ID
 * @returns {Array} Filtered sections with only allowed items
 */
const filterSectionsByRole = (sections, roleId) => {
  if (!roleId) return [];

  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.allowedRoles || item.allowedRoles.includes(roleId)
      ),
    }))
    .filter((section) => section.items.length > 0); // Remove empty sections
};

const itemButtonSx = {
  minHeight: "auto",
  py: "10px",
  px: "16px",
  gap: "10px",
  borderRadius: 0,
  borderLeft: "3px solid transparent",
  color: "rgba(255,255,255,0.55)",
  "&:hover": {
    bgcolor: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.85)",
  },
  "&.Mui-selected": {
    bgcolor: "rgba(255,255,255,0.11)",
    borderLeftColor: "#7EABF3",
    color: "#fff",
    "&:hover": {
      bgcolor: "rgba(255,255,255,0.11)",
    },
  },
};

const SideBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const currentRoleId = useAuthStore((state) => state.currentRoleId);

  const isActive = (item) =>
    pathname === item.href || pathname.startsWith(`${item.href}/`);

  // Filter sections based on current user's role
  const visibleSections = filterSectionsByRole(SIDEBAR_SECTIONS, currentRoleId);

  return (
    <Box
      component="aside"
      sx={{
        width: 210,
        flexShrink: 0,
        bgcolor: "#0D2255",
        color: "#fff",
        py: 2,
        height: "100%",
        overflowY: "auto",
      }}
    >
      {visibleSections.map((section, sectionIndex) => (
        <Box key={section.title} sx={{ mt: sectionIndex === 0 ? 0 : 2 }}>
          <Typography
            sx={{
              px: 2,
              mb: 0.75,
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase",
            }}
          >
            {section.title}
          </Typography>

          <List disablePadding dense>
            {section.items.map((item) => {
              const Icon = item.icon;
              const selected = isActive(item);

              return (
                <ListItemButton
                  key={item.id}
                  selected={selected}
                  disableGutters
                  onClick={() => router.push(item.href)}
                  sx={itemButtonSx}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: "auto",
                      color: "inherit",
                    }}
                  >
                    <Icon sx={{ fontSize: 16 }} />
                  </ListItemIcon>

                  <ListItemText
                    primary={item.label}
                    sx={{ m: 0 }}
                    slotProps={{
                      primary: {
                        sx: {
                          fontSize: 12.5,
                          lineHeight: 1.2,
                          fontWeight: selected ? 500 : 400,
                          color: "inherit",
                        },
                      },
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      ))}
    </Box>
  );
};

export const ROLE_DEFAULT_TAB = {
  [ROLES.USER]: "rule-configuration",
  [ROLES.ADMIN]: "user-management",
};

/**
 * Gets the default landing page for a role, ensuring the user has access to it
 * @param {number} roleId - User's role ID
 * @returns {string} Default landing page path
 */
export const getDefaultLandingPageForRole = (roleId) => {
  const numericRoleId = Number(roleId);
  const desiredTabId = ROLE_DEFAULT_TAB[numericRoleId];

  // Get all items the user has access to
  const accessibleItems = SIDEBAR_SECTIONS.flatMap((section) => section.items).filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(numericRoleId)
  );

  // Try to find the desired default tab
  const sidebarItem = accessibleItems.find((item) => item.id === desiredTabId);

  // If found, return it; otherwise return first accessible item or fallback to "/"
  return sidebarItem?.href ?? accessibleItems[0]?.href ?? "/";
};

export default SideBar;
