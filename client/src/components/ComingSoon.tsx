import React from 'react';
import { Typography, Box } from '@mui/material';

interface ComingSoonProps {
  title: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title }) => {
  return (
    <Box sx={{ padding: 4, textAlign: 'center' }}>
      <Typography variant="h4">{title} - Coming Soon</Typography>
      <Typography variant="body1">This feature is under development. Check back soon!</Typography>
    </Box>
  );
};

export default ComingSoon; 