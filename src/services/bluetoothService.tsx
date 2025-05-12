import { Platform, PermissionsAndroid } from 'react-native';
import { BleManager, Device, State as BLEState } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { connected } from 'process';

class BluetoothService {
    manager: BleManager;
    deviceMap: Map<string, Device>;

    constructor() {
        this.manager = new BleManager();
        this.deviceMap = new Map();
    }

    async requestPermissions() {
        if( Platform.OS === 'ios') { //iOS 13+ handles permissions automatically
            return true;
        }

        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                {
                    title: 'Bluetooth Scan Permission',
                    message: 'This app needs access to your Bluetooth to scan for devices.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );

            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                console.warn('Bluetooth scan permission denied');
            }
        }
    }

    async startScan(onDeviceFound: (device: Device) => void) {
        const state = await this.manager.state();

        if (state !== BLEState.PoweredOn) {
            console.warn('Bluetooth is not powered on');
            return;
        }

        const hasPermission = await this.requestPermissions();
        if (!hasPermission) {
            console.warn('Bluetooth permission not granted');
            return;
        }

        // Stops scanning if start scan is called
        this.manager.stopDeviceScan();

        this.manager.startDeviceScan(
            null,
            { allowDuplicates: false },
            (error, device) => {
                if (error) {
                    console.error('Error during Bluetooth scan:', error);
                    return;
                }

                if (device && !this.deviceMap.has(device.id)) {
                    this.deviceMap.set(device.id, device);
                    onDeviceFound(device);
                }
            }
        );
    }

    async stopScan() {
        this.manager.stopDeviceScan();
    }

    async connectToDevice(deviceID: string): Promise<Device | null> {
        const device = this.deviceMap.get(deviceID);

        if (!device) {
            console.warn(`Device with ID ${deviceID} not found`);
            return null;
        }

        const connectedDevice = await device.connect();
        await connectedDevice.discoverAllServicesAndCharacteristics();
        return connectedDevice;
    }

    async disconnectFromDevice(deviceID: string) {
        const device = this.deviceMap.get(deviceID);

        if (!device) {
            console.warn(`Device with ID ${deviceID} not found`);
            return;
        }

        await device.cancelConnection();
    }

    async readCharacteristic(
        deviceID: string, 
        serviceUUID: string, 
        characteristicUUID: string
    ): 
    Promise<Buffer | null> {
        const device = this.deviceMap.get(deviceID);
        
        if(!device) {
            console.warn(`Device with ID ${deviceID} not found`);
            return null;
        }

        const characteristic = await device.readCharacteristicForService(
            serviceUUID,
            characteristicUUID
        );

        if(characteristic.value) {
            const buffer = Buffer.from(characteristic.value, 'base64');
            return buffer;
        }

        return null;
    }

    async writeCharacteristic(
        deviceID: string, 
        serviceUUID: string, 
        characteristicUUID: string, 
        data: Buffer
    ): Promise<void> {
        const device = this.deviceMap.get(deviceID);

        if (!device) {
            console.warn(`Device with ID ${deviceID} not found`);
            return;
        }

        const base64Data = data.toString('base64');
        await device.writeCharacteristicWithResponseForService(
            serviceUUID,
            characteristicUUID,
            base64Data
        );
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
        this.stopScan
        this.manager.destroy();
    }
}

export default new BluetoothService();