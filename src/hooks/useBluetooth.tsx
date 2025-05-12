import { useState, useEffect, useCallback } from 'react';
import { Device } from 'react-native-ble-plx';
import bluetoothService from '@/services/bluetoothService';

const ESP32_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const LED_CONTROL_CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

const useBluetooth = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [devices, setDevices] = useState<Device[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
    

    const startScan = useCallback(async () => {
        setError(null);
        setDevices([]);

        try{
            setIsScanning(true);
            await bluetoothService.startScan((device: Device) => {
                setDevices((prevDevices) => {
                    const existingDevice = prevDevices.find((d) => d.id === device.id);
                    if (!existingDevice) {
                        return [...prevDevices, device];
                    }
                    return prevDevices;
                });
            });
        } catch (err: any) {
            setError('Error starting scan: ' + err.message);
        }
    }, []);

    const stopScan = useCallback(() => {
        setIsScanning(false);
        bluetoothService.stopScan();
    }, []);

    const connectToDevice = useCallback(async (deviceID: string) => {
        setError(null);
        setConnectedDevice(null);

        try{
            const device = await bluetoothService.connectToDevice(deviceID);
            setConnectedDevice(device);

            return device;
        } catch (err: any) {
            setError('Error connecting to device: ' + err.message);
            return null;
        }
    }, []);

    const disconnectFromDevice = useCallback(async (deviceID: string) => {
        setError(null);
        setConnectedDevice(null);

        if(!connectedDevice) {
            setError('No device connected');
            return null;
        }

        try{
            const device = await bluetoothService.disconnectFromDevice(deviceID);
            setConnectedDevice(null);
            return device;
        } catch (err: any) {
            setError('Error disconnecting from device: ' + err.message);
            return null;
        }
    }, [connectedDevice]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopScan();
            if (connectedDevice) {
                bluetoothService.disconnectFromDevice(connectedDevice.id)
                    .catch(console.error);
            }
        };
    }, [connectedDevice]);

    return {
        isScanning,
        devices,
        connectedDevice,
        error,
        startScan,
        stopScan,
        disconnectFromDevice,
        connectToDevice,
    };
};

export default useBluetooth;

