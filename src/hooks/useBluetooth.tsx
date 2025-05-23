import React from 'react';
import bluetoothService from '../services/bluetoothService';

export const useBluetooth = () => {
  const {
    devices,
    connectedDevices,
    isScanning,
    hasPermission,
    checkBluetoothPermission,
    startScanning,
    stopScanning,
    connectToDevice,
    disconnectFromDevice,
    loadBondedDevices,
    readCharacteristic,
    writeCharacteristic,
    subscribeToCharacteristic,
    discoverServicesAndCharacteristics,
    getBondedDevices,
    removeBondedDevice,
  } = bluetoothService();

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const handleError = (error: string) => {
    setError(error);
    setIsLoading(false);
  };

  const handleLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const handlePermissionCheck = async () => {
    try {
      await checkBluetoothPermission();
    } catch (error) {
      handleError('Failed to check Bluetooth permission');
    }
  };

  const handleStartScanning = async () => {
    try {
      handleLoading(true);
      await startScanning();
    } catch (error) {
      handleError('Failed to start scanning');
    } finally {
      handleLoading(false);
    }
  };

  const handleStopScanning = async () => {
    try {
      handleLoading(true);
      await stopScanning();
    } catch (error) {
      handleError('Failed to stop scanning');
    } finally {
      handleLoading(false);
    }
  };

  const handleConnectToDevice = async (deviceId: string) => {
    try {
      handleLoading(true);
      const device = devices.find((device: any) => device.id === deviceId);
      if (!device) {
        throw new Error('Device not found');
      }
      const result = await connectToDevice(device);
      
      if (!result) {
        throw new Error('Failed to connect to device');
      }
      
      return result;
    } catch (error) {
      handleError('Failed to connect to device');
      return null;
    } finally {
      handleLoading(false);
    }
  };

  const handleDisconnectFromDevice = async (deviceId: string, removeBond = false) => {
    try {
      handleLoading(true);
      await disconnectFromDevice(deviceId, removeBond);
    } catch (error) {
      handleError('Failed to disconnect from device');
    } finally {
      handleLoading(false);
    }
  };

  const handleLoadBondedDevices = async () => {
    try {
      handleLoading(true);
      await loadBondedDevices();
    } catch (error) {
      handleError('Failed to load bonded devices');
    } finally {
      handleLoading(false);
    }
  };

  const handleReadCharacteristic = async (deviceId: string, serviceUUID: string, characteristicUUID: string) => {
    try {
      handleLoading(true);
      return await readCharacteristic(deviceId, serviceUUID, characteristicUUID);
    } catch (error) {
      handleError('Failed to read characteristic');
      return null;
    } finally {
      handleLoading(false);
    }
  };

  const handleWriteCharacteristic = async (deviceId: string, serviceUUID: string, characteristicUUID: string, value: string) => {
    try {
      handleLoading(true);
      await writeCharacteristic(deviceId, serviceUUID, characteristicUUID, value);
      return true;
    } catch (error) {
      handleError('Failed to write characteristic');
      return false;
    } finally {
      handleLoading(false);
    }
  };

  const handleSubscribeToCharacteristic = async (deviceId: string, serviceUUID: string, characteristicUUID: string, callback: (value: any) => void) => {
    try {
      handleLoading(true);
      await subscribeToCharacteristic(deviceId, serviceUUID, characteristicUUID, callback);
      return true;
    } catch (error) {
      handleError('Failed to subscribe to characteristic');
      return false;
    } finally {
      handleLoading(false);
    }
  };

  const handleDiscoverServices = async (deviceId: string) => {
    try {
      handleLoading(true);
      return await discoverServicesAndCharacteristics(deviceId);
    } catch (error) {
      handleError('Failed to discover services');
      return null;
    } finally {
      handleLoading(false);
    }
  };

  const handleGetBondedDevices = async () => {
    try {
      handleLoading(true);
      return await getBondedDevices();
    } catch (error) {
      handleError('Failed to get bonded devices');
      return [];
    } finally {
      handleLoading(false);
    }
  };

  const handleRemoveBond = async (deviceId: string) => {
    try {
      handleLoading(true);
      await disconnectFromDevice(deviceId, true);
    } catch (error) {
      handleError('Failed to remove bond');
    }
  };

  return {
    devices,
    connectedDevices,
    isScanning,
    hasPermission,
    isLoading,
    error,
    removeBondedDevice: handleRemoveBond,
    checkPermission: handlePermissionCheck,
    startScanning: handleStartScanning,
    stopScanning: handleStopScanning,
    connectToDevice: handleConnectToDevice,
    disconnectFromDevice: handleDisconnectFromDevice,
    loadBondedDevices: handleLoadBondedDevices,
    readCharacteristic: handleReadCharacteristic,
    writeCharacteristic: handleWriteCharacteristic,
    subscribeToCharacteristic: handleSubscribeToCharacteristic,
    discoverServices: handleDiscoverServices,
    getBondedDevices: handleGetBondedDevices,
    clearError: () => setError(null),
  };
};