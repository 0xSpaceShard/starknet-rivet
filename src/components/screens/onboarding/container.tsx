import { Box, Typography } from '@mui/material';
import React from 'react';

interface IOnboardingContainerProps {
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

const OnboardingContainer = ({ title, children, footer }: IOnboardingContainerProps) => {
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
      <Box component="div" display="flex" flexDirection="column" gap="2px">
        <Typography variant="h6">Setup</Typography>
        <Typography variant="subtitle1" color="grey">
          {title}
        </Typography>
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
