import express, {Request,Response,Application} from 'express';
const app:Application = express();
const PORT = process.env.PORT || 8000;
const ENV = process.env.ENV || 'staging';

app.get("/", (req:Request, res:Response):void => {
    res.send(`I didn't choose the thug life, the thug life chose me. This is ${ENV} env`);
});

app.listen(PORT, ():void => {
    console.log(`Server Running here 👉 https://localhost:${PORT}`);
});