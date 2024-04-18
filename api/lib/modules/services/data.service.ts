import DataModel from '../schemas/data.schema';
import {IData, Query} from "../models/data.model";

export default class DataService {

    public async get(deviceId: number): Promise<any> {
        try {
            const latestEntry = await DataModel.find({ deviceId }).limit(1).sort({ $natural: -1 });
            return latestEntry[0];
        } catch (error) {
            throw new Error(`Błąd podczas pobierania danych dla urządzenia ${deviceId}: ${error.message}`);
        }
    }
    public async createData(dataParams: {
        temperature: any;
        humidity: any;
        pressure: any;
        deviceId: string;
        readingDate: DateConstructor
    }) {
        try {
            const dataModel = new DataModel(dataParams);
            await dataModel.save();
        } catch (error) {
            console.error('Wystąpił błąd podczas tworzenia danych:', error);
            throw new Error('Wystąpił błąd podczas tworzenia danych');
        }
    }
    public async getAllNewest(): Promise<any[]> {
        const latestData: any[] = [];

        await Promise.all(
            Array.from({ length: 17 }, async (_, i) => {
                try {
                    const latestEntry = await DataModel.find({ deviceId: i }, { __v: 0, _id: 0 }).limit(1).sort({ $natural: -1 });
                    if (latestEntry.length) {
                        latestData.push(latestEntry[0]);
                    } else {
                        latestData.push({ deviceId: i });
                    }
                } catch (error) {
                    console.error(`Błąd podczas pobierania danych dla urządzenia ${i + 1}: ${error.message}`);
                    latestData.push({});
                }
            })
        );

        return latestData;
    }
    public async deleteData(id: number): Promise<void> {
        try {
            await DataModel.deleteMany({ deviceId: id });
        } catch (error) {
            throw new Error(`Błąd podczas usuwania danych dla urządzenia ${id}: ${error.message}`);
        }
    }
    public async query(deviceID: string) {
        try {
            const data = await DataModel.find({deviceId: deviceID}, { __v: 0, _id: 0 });
            return data;
        } catch (error) {
            throw new Error(`Query failed: ${error}`);
        }
    }
}
