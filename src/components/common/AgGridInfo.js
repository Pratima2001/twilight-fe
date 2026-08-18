import { Box, Typography } from '@mui/material';

const AgGridInfo = ({ currentPage, rowsPerPage, totalRows }) => {
  const startRow = (currentPage - 1) * rowsPerPage + 1;
  const endRow = Math.min(currentPage * rowsPerPage, totalRows);
  
  return (
    <Box>
      <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
        Showing {totalRows === 0 ? 0 : startRow} to {endRow} of{" "}
        <span style={{ fontWeight: 600 }}>{totalRows} entries</span>
      </Typography>
    </Box>
  );
};

export default AgGridInfo;
