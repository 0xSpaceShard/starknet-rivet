import { useNavigate, Link as RouteLink } from 'react-router-dom';
import { Stack, Box, Button } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { createAccount } from '../../background/utils';

export const AppSettings = () => {
  const navigate = useNavigate();

  return (
    <section>
      <Stack direction={'row'} justifyContent={'flex-start'}>
        <Box>
          <Button
            size="small"
            variant={'text'}
            startIcon={<ChevronLeft />}
            onClick={() => navigate('/')}
            sx={{
              padding: '8px 10px',
            }}
          >
            Back
          </Button>
        </Box>
      </Stack>
      <Stack spacing={0}>
        <Box>
          <Button
            variant="text"
            component={RouteLink}
            to="/command-generator"
            fullWidth
            sx={{
              height: 48,
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            Docker Command Generator
            <Box display={'flex'} alignItems={'center'} paddingRight={2} paddingLeft={4}>
              <ChevronRight />
            </Box>
          </Button>
        </Box>
        <Box>
          <Button
            variant="text"
            component={RouteLink}
            to="/docker-register"
            fullWidth
            sx={{
              height: 48,
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            Register Running Docker
            <Box display={'flex'} alignItems={'center'} paddingRight={2} paddingLeft={4}>
              <ChevronRight />
            </Box>
          </Button>
        </Box>
        <Box>
          <Button
            variant="text"
            component={RouteLink}
            to="/block-configuration"
            fullWidth
            sx={{
              height: 48,
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            Block Configuration
            <Box display={'flex'} alignItems={'center'} paddingRight={2} paddingLeft={4}>
              <ChevronRight />
            </Box>
          </Button>
        </Box>
        <Box>
          <Button
            variant="text"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              createAccount();
            }}
            fullWidth
            sx={{
              height: 48,
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            Create Account
            <Box display={'flex'} alignItems={'center'} paddingRight={2} paddingLeft={4}>
              <ChevronRight />
            </Box>
          </Button>
        </Box>
      </Stack>
    </section>
  );
};
