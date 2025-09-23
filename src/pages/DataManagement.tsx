import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Stack,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  School,
  SwapHoriz,
  PublishedWithChanges,
  Refresh,
  Download,
  Upload,
  Settings,
} from '@mui/icons-material';
import GraduationRequirement from './GraduationRequirement';

type SectionCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  rightActions?: React.ReactNode;
};

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  icon,
  children,
  rightActions,
}) => {
  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        background: 'white',
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'grey.50',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider />

      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>{children}</Box>
      </CardContent>
    </Card>
  );
};

const DataManagement: React.FC = () => {
  return (
    <Box
      sx={{
        p: 3,
        pt: 10,
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0f2ff 0%, #f3e8ff 100%)',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          borderRadius: 3,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Grid container spacing={3}>
            {/* 학번별 졸업 요건 */}
            <Grid item xs={12}>
              <SectionCard
                title="학번별 졸업 요건"
                description="학번(입학년도)별 졸업 기준과 세부 요건을 관리합니다."
                icon={<School fontSize="small" />}
              >
                <GraduationRequirement />
              </SectionCard>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default DataManagement;