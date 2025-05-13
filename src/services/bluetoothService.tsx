import { Platform, PermissionsAndroid } from 'react-native';
import { BleManager, Device, State as BLEState } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

class BluetoothService {
    manager: BleManager;
    deviceMap: Map<string, Device>;
    isInitialized: boolean = false;

    constructor() {
        this.manager = new BleManager();
        this.deviceMap = new Map();
        this.isInitialized = true;
    }

    async requestPermissions() {
        if (Platform.OS === 'ios') {
            return true;
        }

        if (Platform.OS === 'android') {
            const scanGranted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                {
                    title: 'Bluetooth Scan Permission',
                    message: 'This app needs access to your Bluetooth to scan for devices.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );
            
            const connectGranted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                {
                    title: 'Bluetooth Connect Permission',
                    message: 'This app needs access to your Bluetooth to connect to devices.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );

            return scanGranted === PermissionsAndroid.RESULTS.GRANTED && 
                   connectGranted === PermissionsAndroid.RESULTS.GRANTED;
        }
        
        return false;
    }

    async initialize() {
        if (!this.isInitialized) {
            this.manager = new BleManager();
            this.isInitialized = true;
        }
    }

    async startScan(onDeviceFound: (device: Device) => void) {
        await this.initialize();
        
        const state = await this.manager.state();

        if (state !== BLEState.PoweredOn) {
            throw new Error('Bluetooth is not powered on');
        }

        const hasPermission = await this.requestPermissions();
        if (!hasPermission) {
            throw new Error('Bluetooth permission not granted');
        }

        this.deviceMap.clear();
        
        this.stopScan();

        this.manager.startDeviceScan(
            null,
            { allowDuplicates: false },
            (error, device) => {
                if (error) {
                    console.error('Error during Bluetooth scan:', error);
                    return;
                }

                if (device && device.name) {  
                    this.deviceMap.set(device.id, device);
                    onDeviceFound(device);
                }
            }
        );
    }

    stopScan() {
        if (this.isInitialized) {
            this.manager.stopDeviceScan();
        }
    }

    async connectToDevice(deviceID: string): Promise<Device | null> {
        await this.initialize();
        
        const device = this.deviceMap.get(deviceID);

        if (!device) {
            throw new Error(`Device with ID ${deviceID} not found`);
        }

        try {
            const connectedDevice = await device.connect({ autoConnect: true });
            await connectedDevice.discoverAllServicesAndCharacteristics();
            return connectedDevice;
        } catch (error) {
            console.error('Connection error:', error);
            throw error;
        }
    }

    async disconnectFromDevice(deviceID: string) {
        if (!this.isInitialized) return;
        
        const device = this.deviceMap.get(deviceID);

        if (!device) {
            console.warn(`Device with ID ${deviceID} not found`);
            return;
        }

        try {
            await device.cancelConnection();
        } catch (error) {
            console.error('Disconnection error:', error);
        }
    }

    async readCharacteristic(
        deviceID: string, 
        serviceUUID: string, 
        characteristicUUID: string
    ): Promise<Buffer | null> {
        await this.initialize();
        
        const device = this.deviceMap.get(deviceID);
        
        if(!device) {
            throw new Error(`Device with ID ${deviceID} not found`);
        }

        try {
            const characteristic = await device.readCharacteristicForService(
                serviceUUID,
                characteristicUUID
            );

            if(characteristic.value) {
                return Buffer.from(characteristic.value, 'base64');
            }
            return null;
        } catch (error) {
            console.error('Read characteristic error:', error);
            throw error;
        }
    }

    async writeCharacteristic(
        deviceID: string, 
        serviceUUID: string, 
        characteristicUUID: string, 
        data: Buffer
    ): Promise<void> {
        await this.initialize();
        
        const device = this.deviceMap.get(deviceID);

        if (!device) {
            throw new Error(`Device with ID ${deviceID} not found`);
        }

        try {
            const base64Data = data.toString('base64');
            await device.writeCharacteristicWithResponseForService(
                serviceUUID,
                characteristicUUID,
                base64Data
            );
        } catch (error) {
            console.error('Write characteristic error:', error);
            throw error;
        }
    }

    monitorCharacteristic(
        deviceID: string,
        serviceUUID: string,
        characteristicUUID: string,
        listener: (value: string) => void
    ) {
        const device = this.deviceMap.get(deviceID);

        if(!device) { throw new Error(`Device with ID ${deviceID} not found`); }

        return device.monitorCharacteristicForService(
            serviceUUID,
            characteristicUUID,
            (error, characteristic) => {
                if (error) {
                    console.error('Error monitoring characteristic:', error);
                    return;
                }

                if (characteristic && characteristic.value) {
                    const buffer = Buffer.from(characteristic.value, 'base64');
                    listener(buffer.toString());
                }
            }
        );
    }

    destroy() {
        if (this.isInitialized) {
            this.stopScan();
            this.manager.destroy();
            this.isInitialized = false;
        }
    }
}

export default new BluetoothService();