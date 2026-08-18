"use client";

import { Box, Button, Tooltip } from "@mui/material";

const tooltipSlotProps = {
  popper: {
    sx: { zIndex: 1600 },
  },
};

/**
 * Tooltip wrapper for upload action buttons. Disabled buttons do not receive
 * pointer events, so the child is wrapped and pointer events are routed to the span.
 */
const MasterDataActionTooltipButton = ({
  tooltip,
  disabled = false,
  sx,
  ...buttonProps
}) => (
  <Tooltip title={tooltip} arrow describeChild slotProps={tooltipSlotProps}>
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        cursor: disabled ? "not-allowed" : "inherit",
      }}
    >
      <Button
        disabled={disabled}
        sx={{
          ...sx,
          ...(disabled && { pointerEvents: "none" }),
        }}
        {...buttonProps}
      />
    </Box>
  </Tooltip>
);

export default MasterDataActionTooltipButton;
