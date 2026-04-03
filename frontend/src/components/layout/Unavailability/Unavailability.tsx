import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Collapse,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useUnavailability } from '../../../hooks/useUnavailability/useUnavailability';
import { validateUnavailabilityDates } from '../../../utils/Unavailability/unavailability.utils';

export const UnavailabilitySection = () => {
  const {
    dates,
    error,
    success,
    openModal,
    unavailabilities,
    loadingList,
    setStartDate,
    setEndDate,
    handleConfirm,
    handleShowList,
    handleCloseModal,
  } = useUnavailability();

  return (
    <Box sx={{ mt: 2, mb: 1, p: 2, borderTop: '2px solid #1e2a44' }}>
      <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
        Définir une indisponibilité :
      </Typography>

      <Collapse in={!!error || success}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Indisponibilité enregistrée !
          </Alert>
        )}
      </Collapse>

      <Grid container spacing={1} alignItems="center">
        <Grid item xs={3} display="flex" justifyContent="center">
          <CalendarMonthIcon sx={{ fontSize: 60, color: '#333' }} />
        </Grid>

        <Grid item xs={9}>
          <Box
            sx={{ bgcolor: '#1e2a44', p: 2, borderRadius: 2, color: 'white' }}
          >
            <Box
              sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1.5 }}
            >
              <Typography sx={{ minWidth: 40, fontWeight: 'bold' }}>
                Du :
              </Typography>
              <TextField
                type="date"
                size="small"
                fullWidth
                value={dates.startDate}
                sx={{ bgcolor: 'white', borderRadius: 1 }}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography sx={{ minWidth: 40, fontWeight: 'bold' }}>
                Au :
              </Typography>
              <TextField
                type="date"
                size="small"
                fullWidth
                value={dates.endDate}
                sx={{ bgcolor: 'white', borderRadius: 1 }}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mt: 2,
                pl: '56px',
              }}
            >
              <Button
                variant="contained"
                size="small"
                onClick={handleShowList}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  bgcolor: 'white',
                  color: '#1e2a44',
                  fontWeight: 'bold',
                  textTransform: 'none',
                }}
              >
                Voir mes indisponibilités
              </Button>

              <Button
                variant="contained"
                size="small"
                onClick={handleConfirm}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  bgcolor: 'white',
                  color: '#1e2a44',
                  fontWeight: 'bold',
                  textTransform: 'none',
                }}
              >
                Confirmer
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 'bold', color: '#1e2a44' }}>
          Mes Indisponibilités
        </DialogTitle>

        <DialogContent dividers>
          {loadingList ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress size={24} />
            </Box>
          ) : unavailabilities.length > 0 ? (
            <List>
              {unavailabilities.map((item, index) => (
                <Box key={`${item.startDate}-${item.endDate}-${index}`}>
                  <ListItem>
                    <ListItemText
                      primary={`Du ${validateUnavailabilityDates({ startDate: item.startDate, endDate: '' })}`}
                      secondary={`Au ${validateUnavailabilityDates({ startDate: '', endDate: item.endDate })}`}
                    />
                  </ListItem>
                  {index < unavailabilities.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              p={2}
            >
              Aucune indisponibilité enregistrée.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
