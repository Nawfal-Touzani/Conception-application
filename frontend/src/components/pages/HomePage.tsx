import { Container, Typography } from '@mui/material';

const HomePage = () => {

  return (
    <Container component="main" sx={{ mt: 8, mb: 2, flex: '1' }} maxWidth="sm">
      <Typography variant="h2" component="h1" gutterBottom>
        My HomePage
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        Because we love JS, you can also click on the header to stop / start the
        music ; )
      </Typography>
    </Container>
  );
};

export default HomePage;
