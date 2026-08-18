import { Box, Button, IconButton, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import usePagination from '@mui/material/usePagination';
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const List = styled('ul')({
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  gap: '4px',
  alignItems: 'center',
});

const AgGridPagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  pageSize, 
  onPageSizeChange, 
  isLoading = false 
}) => {
  const { items } = usePagination({
    count: totalPages,
    page: currentPage,
    onChange: (event, page) => onPageChange(page),
  });

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {/* Rows per page selector */}
      {onPageSizeChange && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ fontSize: 12, color: '#6B7280' }}>Rows per page:</Box>
          <Select
            size="small"
            value={pageSize}
            onChange={(e) => onPageSizeChange(e.target.value)}
            disabled={isLoading}
            sx={{
              fontSize: 12,
              '& .MuiOutlinedInput-input': {
                py: 0.5,
                px: 1,
              },
            }}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </Box>
      )}

      {/* Pagination buttons */}
      <nav>
        <List>
          {items.map(({ page, type, selected, ...item }, index) => {
            let children = null;

            if (type === 'start-ellipsis' || type === 'end-ellipsis') {
              children = (
                <Box
                  component="span"
                  sx={{
                    px: 1,
                    color: '#6B7280',
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  …
                </Box>
              );
            } else if (type === 'page') {
              children = (
                <Button
                  size="small"
                  variant={selected ? 'contained' : 'outlined'}
                  disabled={isLoading}
                  {...item}
                  sx={{
                    minWidth: '32px',
                    height: '32px',
                    p: 0,
                    fontSize: 12,
                    borderColor: '#E5E7EB',
                    color: selected ? '#fff' : '#374151',
                    bgcolor: selected ? '#2563EB' : 'transparent',
                    '&:hover': {
                      borderColor: '#9CA3AF',
                      bgcolor: selected ? '#1D4ED8' : '#F9FAFB',
                    },
                    '&.Mui-disabled': {
                      opacity: 0.5,
                    },
                  }}
                >
                  {page}
                </Button>
              );
            } else if (type === 'previous') {
              children = (
                <IconButton
                  size="small"
                  disabled={isLoading || currentPage === 1}
                  {...item}
                  sx={{
                    border: '1px solid #E5E7EB',
                    borderRadius: '4px',
                    p: 0.5,
                    '&:disabled': { opacity: 0.5 },
                  }}
                >
                  <ChevronLeftIcon sx={{ fontSize: 18 }} />
                </IconButton>
              );
            } else if (type === 'next') {
              children = (
                <IconButton
                  size="small"
                  disabled={isLoading || currentPage >= totalPages}
                  {...item}
                  sx={{
                    border: '1px solid #E5E7EB',
                    borderRadius: '4px',
                    p: 0.5,
                    '&:disabled': { opacity: 0.5 },
                  }}
                >
                  <ChevronRightIcon sx={{ fontSize: 18 }} />
                </IconButton>
              );
            } else {
              // For 'first' and 'last' types
              children = (
                <Button
                  size="small"
                  variant="outlined"
                  disabled={isLoading}
                  {...item}
                  sx={{
                    minWidth: '60px',
                    height: '32px',
                    fontSize: 11,
                    textTransform: 'capitalize',
                    borderColor: '#E5E7EB',
                    color: '#374151',
                    '&:hover': {
                      borderColor: '#9CA3AF',
                      bgcolor: '#F9FAFB',
                    },
                    '&.Mui-disabled': {
                      opacity: 0.5,
                    },
                  }}
                >
                  {type}
                </Button>
              );
            }

            return <li key={index}>{children}</li>;
          })}
        </List>
      </nav>
    </Box>
  );
};

export default AgGridPagination;
