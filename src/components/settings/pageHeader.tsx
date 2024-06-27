import React, { ReactNode } from 'react';
import { Box, Button, Container, Stack, Typography, Divider } from '@mui/material';
import ChevronLeft from '@mui/icons-material/ChevronLeft';

interface PageHeaderProps {
  title: string;
  backButtonHandler: () => void;
  children: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, backButtonHandler, children }) => (
  <Box paddingBottom={6}>
    <Stack direction={'row'} justifyContent={'center'} position={'relative'}>
      <Box position={'absolute'} top={0} left={0}>
        <Button
          size="small"
          variant={'text'}
          startIcon={<ChevronLeft />}
          onClick={backButtonHandler}
          sx={{
            padding: '8px 10px',
          }}
        >
          Back
        </Button>
      </Box>
      <Container>
        <Typography variant="h6" margin={0} marginY={2}>
          {title}
        </Typography>
      </Container>
    </Stack>
    <Divider sx={{ marginY: 3 }} variant="middle" />
    <Container>{children}</Container>
  </Box>
);

export default PageHeader;
