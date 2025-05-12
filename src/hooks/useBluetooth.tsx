import { useState, useEffect, useCallback, useRef } from 'react';
import { Device } from 'react-native-ble-plx';
import { AppState } from 'react-native';
import bluetoothService from '@/services/bluetoothService';

const useBluetooth = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [devices, setDevices] = useState<Device[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
    const appState = useRef(AppState.currentState);
    const lastConnectedDeviceId = useRef<string | null>(null);

    // Handle app state changes
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                // App has come to the foreground - reinitialize if needed
                if (lastConnectedDeviceId.current && !connectedDevice) {
                    // Try to reconnect to the last device
                    connectToDevice(lastConnectedDeviceId.current)
                        .catch(err => console.log('Auto-reconnect failed:', err));
                }
            } else if (nextAppState.match(/inactive|background/) && appState.current === 'active') {
                // App is going to background - save connection state
                if (connectedDevice) {
                    lastConnectedDeviceId.current = connectedDevice.id;
                }
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [connectedDevice]);

    const startScan = useCallback(async () => {
        setError(null);
        setDevices([]);

        try {
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

        try {
            const device = await bluetoothService.connectToDevice(deviceID);
            setConnectedDevice(device);
            lastConnectedDeviceId.current = deviceID;
            return device;
        } catch (err: any) {
            setError('Error connecting to device: ' + err.message);
            return null;
        }
    }, []);

    const disconnectFromDevice = useCallback(async (deviceID: string) => {
        setError(null);

        try {
            await bluetoothService.disconnectFromDevice(deviceID);
            setConnectedDevice(null);
            lastConnectedDeviceId.current = null;
            return true;
        } catch (err: any) {
            setError('Error disconnecting from device: ' + err.message);
            return false;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopScan();
            if (connectedDevice) {
                bluetoothService.disconnectFromDevice(connectedDevice.id)
                    .catch(console.error);
            }
        };
    }, [connectedDevice, stopScan]);

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