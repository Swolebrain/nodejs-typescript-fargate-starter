import express, {Request,Response,Application} from 'express';
const app:Application = express();
const PORT = process.env.PORT || 8000;
const ENV = process.env.ENV || 'staging';

// Do not delete this endpoint or put it under auth. This is the health check.
app.get("/", (req:Request, res:Response):void => {
    res.send(`<h3>App is working. This is ${ENV} env</h3><span>09072022T0837</span>`);
});

app.listen(PORT, ():void => {
    console.log(`Server Running on port ${PORT}`);
});