import express, {
    Request,
    Response,
    Application,
    NextFunction
} from 'express';
import { Unit, MetricsLogger, Configuration } from 'aws-embedded-metrics';
import { v4 as uuidv4 } from 'uuid';
import { LocalEnvironment } from "aws-embedded-metrics/lib/environment/LocalEnvironment";
import { MetricsContext } from "aws-embedded-metrics/lib/logger/MetricsContext";
import { APP_NAME } from "../../cdk/configuration";

const app:Application = express();
const PORT = process.env.PORT || 8000;
const ENV = process.env.ENV || 'staging';

Configuration.serviceName = `${APP_NAME}`;
Configuration.serviceType = 'ECSTask';

const getDurationInMilliseconds = (start: [number, number]) => {
    const NS_PER_SEC = 1e9;
    const NS_TO_MS = 1e6;
    const diff = process.hrtime(start);

    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS
};

app.use((req: Request, res: Response, next: NextFunction) => {
    const context = MetricsContext.empty();
    const resolveEnvironment = async() => new LocalEnvironment();
    const metrics = new MetricsLogger(resolveEnvironment, context);
    req.metrics = metrics;
    const startTime = process.hrtime();
    const envString = process.env.NODE_ENV;
    if (!envString) {
        next();
        return;
    }
    metrics.setDimensions({
        service: `NOCKService-${envString}`,
        path: req.path,
    });
    metrics.setNamespace('NOCK');
    metrics.setProperty('method', req.method);
    metrics.setProperty('path', req.path);
    let requestId = req.headers['x-nock-request-id'];
    if (!requestId) {
        requestId = uuidv4();
    }
    metrics.setProperty('requestId', requestId);

    res.on('finish', () => {
        metrics.putMetric('latency', getDurationInMilliseconds(startTime), Unit.Milliseconds);
        metrics.putMetric('requestCount', 1, Unit.Count);
        if (res.statusCode >= 400 && res.statusCode < 500 ) {
            metrics.putMetric('4XX', 1, Unit.Count);
        }
        if (res.statusCode >= 500 ) {
            metrics.putMetric('5XX', 1, Unit.Count);
        }
        metrics.flush().catch((e) => console.log('error flushing metrics', e));
    });

    next();
});

// Do not delete this endpoint or put it under auth. This is the health check.
app.get("/", (req:Request, res:Response):void => {
    res.send(`<h3>App is working. This is ${ENV} env</h3><span>09072022T0837</span>`);
});

app.listen(PORT, ():void => {
    console.log(`Server Running on port ${PORT}`);
});