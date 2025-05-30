import { useState, useEffect, useCallback } from 'react';
import { Device } from 'react-native-ble-plx';
import BluetoothService from '../services/bluetoothService';

interface BluetoothState {
  isScanning: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  device: Device | null;
  error: string | null;
  temperature: number | null;
  humidity: number | null;
}

export default function useBluetooth() {
  const [state, setState] = useState<BluetoothState>({
    isScanning: false,
    isConnecting: false,
    isConnected: false,
    device: null,
    error: null,
    temperature: null,
    humidity: null,
  });

  // Partial update function to prevent passing every state property
  const updateState = useCallback((newState: Partial<BluetoothState>) => {
    setState(prevState => ({ ...prevState, ...newState }));
  }, []);

  const startScan = useCallback(async () => {
    try {
      updateState({ isScanning: true, error: null });
      
      await BluetoothService.scanForDevices((device) => {
        updateState({ device, isScanning: false });
      });
      
      setTimeout(() => {
        setState((prevState) => {
          if (prevState.isScanning) {
            return { ...prevState, isScanning: false, error: 'No ESP32 device found' };
          }
          return prevState;
        });
      }, 5000);
    } catch (error) {
      updateState({ 
        isScanning: false, 
        error: error instanceof Error ? error.message : 'Unknown error during scan'
      });
    }
  }, [updateState]);

  const connectToDevice = useCallback(async () => {
    if (!state.device) {
      updateState({ error: 'No device to connect to' });
      return;
    }
    
    try {
      updateState({ isConnecting: true, error: null });
      await BluetoothService.connectToDevice(state.device);
      updateState({ isConnecting: false, isConnected: true });
      
      // Start monitoring temperature and humidity
      BluetoothService.monitorTemperature((temp) => {
        updateState({ temperature: temp });
      });
      
      BluetoothService.monitorHumidity((humidity) => {
        updateState({ humidity: humidity });
      });
    } catch (error) {
      updateState({ 
        isConnecting: false, 
        isConnected: false,
        error: error instanceof Error ? error.message : 'Connection failed' 
      });
    }
  }, [state.device, updateState]);

  const disconnect = useCallback(async () => {
    try {
      await BluetoothService.disconnect();
      updateState({ 
        isConnected: false, 
        device: null,
        temperature: null,
        humidity: null,
      });
    } catch (error) {
      updateState({ 
        error: error instanceof Error ? error.message : 'Disconnection failed' 
      });
    }
  }, [updateState]);

  // Clean up on unmount, which disconnects from the device
  useEffect(() => {
    return () => {
      if (state.isConnected) {
        BluetoothService.disconnect().catch(console.error);
      }
    };
  }, []);

  return {
    ...state,
    startScan,
    connectToDevice,
    disconnect,
  };
}
