import React from 'react';
import { Container, Typography, Box, Stack, Button } from '@mui/material';

interface ConfirmationSectionProps {
  title: string;
  data?: string;
  onConfirm: () => void;
  onDecline: () => void;
}

const ConfirmationSection: React.FC<ConfirmationSectionProps> = ({
  title,
  data,
  onConfirm,
  onDecline,
}) => {
  return (
    <>
      <section>
        {data && (
          <Container>
            <Typography variant="body1">{title}</Typography>
            <Box
              component="pre"
              padding={1}
              textAlign={'left'}
              borderRadius={'5px'}
              whiteSpace={'pre-wrap'}
              sx={{
                wordBreak: 'break-word',
              }}
            >
              {data}
            </Box>
            <Stack justifyContent={'center'} direction={'row'} spacing={3}>
              <Button variant="outlined" color="primary" onClick={onConfirm}>
                Confirm
              </Button>
              <Button variant="outlined" color="secondary" onClick={onDecline}>
                Decline
              </Button>
            </Stack>
          </Container>
        )}
      </section>
    </>
  );
};

export default ConfirmationSection;
