import app from 'app;
import serverless from "serverless-http";

const expressHandler = serverless(app);
export { expressHandler };
