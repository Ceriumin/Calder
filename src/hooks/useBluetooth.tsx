import { useState, useEffect, useCallback, useRef } from 'react';
import { Device } from 'react-native-ble-plx';
import { AppState } from 'react-native';
import bluetoothService from '@/services/bluetoothService';

const useBluetooth = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [devices, setDevices] = useState<Device[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [connectedDevices, setConnectedDevices] = useState<Device[]>([]);
    const appState = useRef(AppState.currentState);
    const lastConnectedDeviceIds = useRef<string[]>([]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                if (lastConnectedDeviceIds.current.length > 0) {
                    lastConnectedDeviceIds.current.forEach(deviceId => {
                        const isAlreadyConnected = connectedDevices.some(device => device.id === deviceId);
                        if (!isAlreadyConnected) {
                            connectToDevice(deviceId)
                                .catch(err => console.log(`Auto-reconnect failed for ${deviceId}:`, err));
                        }
                    });
                }
            } else if (nextAppState.match(/inactive|background/) && appState.current === 'active') {
                if (connectedDevices.length > 0) {
                    lastConnectedDeviceIds.current = connectedDevices.map(device => device.id);
                }
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [connectedDevices]);

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
            
            if (device) {
                setConnectedDevices(prevDevices => {
                    const exists = prevDevices.some(d => d.id === device.id);
                    if (!exists) {
                        return [...prevDevices, device];
                    }
                    return prevDevices;
                });
                
                if (!lastConnectedDeviceIds.current.includes(deviceID)) {
                    lastConnectedDeviceIds.current.push(deviceID);
                }
            }
            
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
            
            setConnectedDevices(prevDevices => 
                prevDevices.filter(device => device.id !== deviceID)
            );
            
            lastConnectedDeviceIds.current = lastConnectedDeviceIds.current.filter(id => id !== deviceID);
            
            return true;
        } catch (err: any) {
            setError('Error disconnecting from device: ' + err.message);
            return false;
        }
    }, []);

    // Disconnect all devices
    const disconnectAllDevices = useCallback(async () => {
        setError(null);
        
        try {
            const devicesToDisconnect = [...connectedDevices];
            
            for (const device of devicesToDisconnect) {
                await bluetoothService.disconnectFromDevice(device.id);
            }
            
            setConnectedDevices([]);
            lastConnectedDeviceIds.current = [];
            
            return true;
        } catch (err: any) {
            setError('Error disconnecting devices: ' + err.message);
            return false;
        }
    }, [connectedDevices]);

    useEffect(() => {
        return () => {
            stopScan();
            connectedDevices.forEach(device => {
                bluetoothService.disconnectFromDevice(device.id)
                    .catch(console.error);
            });
        };
    }, [connectedDevices, stopScan]);

    return {
        isScanning,
        devices,
        connectedDevices,
        error,
        startScan,
        stopScan,
        connectToDevice,
        disconnectFromDevice,
        disconnectAllDevices,
    };
};

export default useBluetooth;