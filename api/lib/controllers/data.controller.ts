import Controller from '../interfaces/controller.interface';
import { Request, Response, NextFunction, Router } from 'express';
import {checkIdParam} from "../middlewares/deviceIdParam.middleware";
import DataService from "../modules/services/data.service";

let testArr = [4,5,6,3,5,3,7,5,13,5,6,4,3,6,3,6];
class DataController implements Controller {
    public path = '/api/data';
    public router = Router();
    private dataService = new DataService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/latest`, this.getLatestReadingsFromAllDevices);
        this.router.post(`${this.path}/:id`, checkIdParam, this.addData);
        this.router.get(`${this.path}/:id`, checkIdParam,  this.getAllDeviceData);
        this.router.get(`${this.path}/:id/latest`, checkIdParam,  this.findLatestById);
        this.router.get(`${this.path}/:id/:num`,checkIdParam, this.findByRange);
        this.router.delete(`${this.path}/all`, this.deleteAll);
        this.router.delete(`${this.path}/:id`,checkIdParam, this.deleteById);

        this.router.get(`${this.path}/:id/newest`, checkIdParam, this.getNewestData);
        this.router.get(`${this.path}/newest/all`, this.getAllNewestData);
        this.router.delete(`${this.path}/:id/delete`, checkIdParam, this.deleteDeviceData);
    }

    private getAllDeviceData = async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;
        const allData = await this.dataService.query(id);
        response.status(200).json(allData);
    };
    private addData= async (request: Request, response: Response, next: NextFunction) => {
        const {elem} = request.body;
        const {id} = request.params

        const data = {
            temperature: elem[0].value,
            pressure: elem[1].value,
            humidity: elem[2].value,
            deviceId: id,
            readingDate : Date
        }
        try {

            await this.dataService.createData(data);
            response.status(200).json(data);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response.status(400).json({ error: 'Invalid input data.' });
        }

    }

    private getLatestReadingsFromAllDevices = async (request: Request, response: Response, next: NextFunction) => {
        response.status(200).json(testArr);
    }
    private findById = async (request: Request, response: Response, next: NextFunction) => {
        const {id} = request.params;
        response.status(200).json(testArr[Number(id)]);
    }
    private findLatestById = async (request: Request, response: Response, next: NextFunction) => {
        let maxVal = testArr[0] || -Infinity;

        testArr.forEach(v => {
            if (maxVal < v) maxVal = v;
        })

        response.status(200).json(maxVal)
    }
    private findByRange = async (request: Request, response: Response, next: NextFunction) => {
        const {id, num} = request.params;
        const data = testArr.slice(Number(id)-1, Number(id)-1 + Number(num))

        response.status(200).json(data)
    }
    private deleteAll = async (request: Request, response: Response, next: NextFunction) => {
        testArr = [];
        response.status(200).json(testArr);
    }
    private deleteById = async (request: Request, response: Response, next: NextFunction) => {
        const {id} = request.params;
        const elem = testArr[Number(id)-1];
        testArr.splice(Number(id)-1, 1);
        response.status(200).json(elem);
    }
    private getNewestData = async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;
        try {
            const newestData = await this.dataService.get(Number(id));
            response.status(200).json(newestData);
        } catch (error) {
            console.error(`Problem z uzyskaniem danych urządzenia ${id}: ${error.message}`);
            response.status(500).json({ error: 'Błąd serwera.' });
        }
    }

    private getAllNewestData = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const allNewestData = await this.dataService.getAllNewest();
            response.status(200).json(allNewestData);
        } catch (error) {
            console.error(`Problem z uzyskaniem danych: ${error.message}`);
            response.status(500).json({ error: 'Błąd serwera.' });
        }
    }

    private deleteDeviceData = async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;
        try {
            await this.dataService.deleteData(Number(id));
            response.status(200).json({ message: `Data for device ${id} deleted successfully.` });
        } catch (error) {
            console.error(`Error while deleting data for device ${id}: ${error.message}`);
            response.status(500).json({ error: 'Internal server error.' });
        }
    }
}

export default DataController;
