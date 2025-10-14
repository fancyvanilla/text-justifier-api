import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import router from './routes/router';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const app = express();

app.use(express.text({ type: 'text/plain' }));
app.use(bodyParser.json());
app.use(cors());

app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
