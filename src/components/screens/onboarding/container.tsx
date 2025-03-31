import { CloseOutlined } from '@mui/icons-material';
import { Box, Grid, IconButton, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface IOnboardingContainerProps {
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

const OnboardingContainer = ({ title, children, footer }: IOnboardingContainerProps) => {
  const navigate = useNavigate();

  return (
    <Box
      component="div"
      height="100%"
      width="100%"
      display="flex"
      flexDirection="column"
      padding={2}
      textAlign="left"
    >
      <Box component="div" display="flex" justifyContent="space-between">
        <Box component="div" display="flex" flexDirection="column" gap="2px">
          <Typography variant="h6">Setup</Typography>
          <Typography variant="subtitle1" color="grey">
            {title}
          </Typography>
        </Box>

        <Grid item flexBasis={'50px'} flexGrow={0} padding={'0 10px'}>
          <IconButton size="small" color="primary" onClick={() => navigate('/')}>
            <CloseOutlined />
          </IconButton>
        </Grid>
      </Box>
      <Box width="100%" bgcolor="grey" minHeight="1px" height="1px" marginY={1} />

      <Box
        component="div"
        height="100%"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <Box component="div" display="flex">
          {children}
        </Box>

        <Box component="div" display="flex" width="100%">
          {footer}
        </Box>
      </Box>
    </Box>
  );
};

export default OnboardingContainer;
