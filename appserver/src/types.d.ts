import { MetricsLogger } from "aws-embedded-metrics";

declare global {
    namespace Express {
        // This is one way to decorate your express Requests to support additional stuff you're gonna add
        export interface Request {
            metrics?: MetricsLogger;
        }
    }
}

export {};