process.env.ORGANIZATIONS_TABLE = 'organizations';
process.env.ORGANIZATIONS_STATUS_INDEX = 'status';
process.env.EVENTS_TABLE = 'events';
process.env.EVENTS_START_TIME_INDEX = 'start_time';
process.env.IS_OFFLINE = 'true';

import { app } from './app';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.info(`Env: ${process.env.NODE_ENV}`);
  // eslint-disable-next-line no-console
  console.info(`Open in your browser http://localhost:${PORT}`);
});
