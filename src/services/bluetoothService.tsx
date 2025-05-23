import React, { useState, useEffect, useRef } from 'react';
import { BleManager, Device, Subscription } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const manager = new BleManager();

const DEVICE_NAME = 'ESP32-Calder'; 
const STORAGE_KEY = 'connectedDevices';
const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000; // 1 second

const bluetoothService = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<Device[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const disconnectionSubscriptions = useRef<{[key: string]: Subscription}>({});
  const reconnectAttempts = useRef<{[key: string]: number}>({});
  const reconnectTimers = useRef<{[key: string]: NodeJS.Timeout}>({});
  const isReconnecting = useRef<{[key: string]: boolean}>({});

  // Check for permissions on Android mainly as iOS handles it differently
  // and requires no explicit permission request
  const checkBluetoothPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        {
          title: 'Bluetooth Permission',
          message: 'This app needs access to your Bluetooth.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
    
    } else {
      setHasPermission(true);
    }
    
    return hasPermission;
  };

  const startScanning = async () => {
    if (!hasPermission) {
      const permissionGranted = await checkBluetoothPermission();
      if (!permissionGranted) {
        console.log('No permission to scan for Bluetooth devices');
        return;
      }
    }

    setIsScanning(true);
    
    // When it starts scanning it clears all the discovered devices
    // to avoid duplicates
    setDevices([]);
    
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Scan error:', error);
        setIsScanning(false);
        return;
      }

      if (device) {
        // Check if the device is already connected or discovered and if it matches the device name
        if (device.name === DEVICE_NAME && !devices.some(d => d.id === device.id) && 
          !connectedDevices.some(d => d.id === device.id)) {
          console.log('Found Device:', device.name);

          setDevices(prevDevices => {
            if (!prevDevices.some(d => d.id === device.id)) {
              return [...prevDevices, device];
            }
            return prevDevices;
          });
        }
        
      }
    });

    // Stop scanning after 15 seconds
    setTimeout(() => {
      stopScanning();
    }, 5000);
  };

  // Stop scanning for devices
  const stopScanning = () => {
    if (isScanning) {
      manager.stopDeviceScan();
      setIsScanning(false);
      console.log('Scanning stopped');
    }
  };

  // Monitor device for disconnection events
  const setupDisconnectionListener = (device: Device) => {
    // Remove existing subscription if it exists
    if (disconnectionSubscriptions.current[device.id]) {
      disconnectionSubscriptions.current[device.id].remove();
      delete disconnectionSubscriptions.current[device.id];
    }

    // Create new subscription
    const subscription = device.onDisconnected((error, disconnectedDevice) => {
      console.log(`Device ${disconnectedDevice?.name || disconnectedDevice?.id} disconnected`, error ? `with error: ${error.message}` : '');
      
      // Update state to reflect device disconnection
      setConnectedDevices(prev => prev.filter(d => d.id !== device.id));
      
      // Only attempt to reconnect if this wasn't a manual disconnection
      if (isReconnecting.current[device.id] !== false) {
        handleDeviceDisconnection(device.id);
      }
    });

    // Store subscription for later cleanup
    disconnectionSubscriptions.current[device.id] = subscription;
    
    // Reset reconnection flag
    isReconnecting.current[device.id] = true;
    
    return subscription;
  };

  // Handle reconnection with exponential backoff
  const handleDeviceDisconnection = async (deviceId: string) => {
    // Check if device was bonded
    const bondedDevices = await getBondedDevices();
    const bondedDevice = bondedDevices.find((d: {id: string}) => d.id === deviceId);
    
    if (!bondedDevice) {
      console.log(`Device ${deviceId} was not bonded, skipping reconnection`);
      return;
    }
    
    // Check if we should try to reconnect
    const attempts = reconnectAttempts.current[deviceId] || 0;
    if (attempts >= MAX_RECONNECT_ATTEMPTS) {
      console.log(`Max reconnection attempts reached for device ${deviceId}`);
      reconnectAttempts.current[deviceId] = 0;
      return;
    }
    
    // Calculate next delay with exponential backoff
    const delay = INITIAL_RECONNECT_DELAY * Math.pow(2, attempts);
    console.log(`Reconnecting to device ${bondedDevice.name || deviceId} in ${delay}ms (attempt ${attempts + 1}/${MAX_RECONNECT_ATTEMPTS})`);
    
    // Clear any existing reconnection timer
    if (reconnectTimers.current[deviceId]) {
      clearTimeout(reconnectTimers.current[deviceId]);
    }
    
    // Set up new reconnection timer
    reconnectTimers.current[deviceId] = setTimeout(async () => {
      try {
        console.log(`Attempting to reconnect to device ${bondedDevice.name || deviceId}`);
        
        // Try to reconnect
        const device = await manager.connectToDevice(deviceId, {
          autoConnect: true,
          timeout: 10000, // 10 second timeout for reconnection
        });
        
        await device.discoverAllServicesAndCharacteristics();
        
        // Reset reconnect attempts on success
        reconnectAttempts.current[deviceId] = 0;
        
        // Set up a new disconnection listener
        setupDisconnectionListener(device);
        
        // Update UI
        setConnectedDevices(prev => {
          if (!prev.some(d => d.id === device.id)) {
            return [...prev, device];
          }
          return prev;
        });
        
        console.log(`Successfully reconnected to: ${device.name || device.id}`);
      } catch (error) {
        console.log(`Failed to reconnect to ${bondedDevice.name || deviceId}:`, error);
        
        // Increment reconnection attempts
        reconnectAttempts.current[deviceId] = (reconnectAttempts.current[deviceId] || 0) + 1;
        
        // Try again
        handleDeviceDisconnection(deviceId);
      }
    }, delay);
  };

  // Connect to a device
  const connectToDevice = async (device: Device) => {
    try {
      stopScanning();
      console.log('Connecting to device:', device.name || device.id);
      
      const connectedDevice = await device.connect();
      console.log('Connected to device:', connectedDevice.name || connectedDevice.id);
      
      await connectedDevice.discoverAllServicesAndCharacteristics();
      console.log('Discovered services and characteristics');
      
      // Set up disconnection listener
      setupDisconnectionListener(connectedDevice);
      
      // Reset reconnection attempts
      reconnectAttempts.current[device.id] = 0;
      
      setConnectedDevices(prevDevices => [...prevDevices, connectedDevice]);
      
      // Save device to AsyncStorage for future automatic reconnection
      await saveBondedDevice(connectedDevice);
      
      return connectedDevice;
    } catch (error) {
      console.error('Error connecting to device:', error);
      return null;
    }
  };

  // Save device info to AsyncStorage
  const saveBondedDevice = async (device: Device) => {
    try {
      // Get existing bonded devices
      const existingDevicesJSON = await AsyncStorage.getItem(STORAGE_KEY);
      const existingDevices = existingDevicesJSON ? JSON.parse(existingDevicesJSON) : [];
      
      // Extract serializable data from device
      const deviceInfo = {
        id: device.id,
        name: device.name,
        localName: device.localName,
        rssi: device.rssi,
        manufacturerData: device.manufacturerData,
        bondedTime: new Date().toISOString(),
      };
      
      // Update or add device to bonded devices list
      const updatedDevices = existingDevices.some((d: {id: string}) => d.id === deviceInfo.id)
        ? existingDevices.map((d: {id: string}) => d.id === deviceInfo.id ? deviceInfo : d)
        : [...existingDevices, deviceInfo];
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDevices));
      console.log('Device bonded and saved to storage:', device.name || device.id);
    } catch (error) {
      console.error('Error saving bonded device:', error);
    }
  };

  // Remove a device from bonded devices
  const removeBondedDevice = async (deviceId: string) => {
    try {
      const existingDevicesJSON = await AsyncStorage.getItem(STORAGE_KEY);
      if (!existingDevicesJSON) return;
      
      const existingDevices = JSON.parse(existingDevicesJSON);
      const updatedDevices = existingDevices.filter((d: {id: string}) => d.id !== deviceId);
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDevices));
      console.log('Device removed from bonded devices:', deviceId);
    } catch (error) {
      console.error('Error removing bonded device:', error);
    }
  };

  // Get list of bonded devices from storage
  const getBondedDevices = async () => {
    try {
      const bondedDevicesJSON = await AsyncStorage.getItem(STORAGE_KEY);
      return bondedDevicesJSON ? JSON.parse(bondedDevicesJSON) : [];
    } catch (error) {
      console.error('Error getting bonded devices:', error);
      return [];
    }
  };

  // Load and connect to previously bonded devices
  const loadBondedDevices = async () => {
    try {
      const bondedDevices = await getBondedDevices();
      console.log('Found previously bonded devices:', bondedDevices);
      
      for (const deviceInfo of bondedDevices) {
        try {
          console.log(`Attempting to reconnect to: ${deviceInfo.name || deviceInfo.id}`);
          
          const connectedDevice = await manager.connectToDevice(deviceInfo.id, {
            autoConnect: true,
            timeout: 5000, // 5 seconds timeout
          });
          
          await connectedDevice.discoverAllServicesAndCharacteristics();
          
          // Set up disconnection listener
          setupDisconnectionListener(connectedDevice);
          
          // Reset reconnection attempts
          reconnectAttempts.current[deviceInfo.id] = 0;
          
          setConnectedDevices(prev => [...prev, connectedDevice]);
          console.log(`Successfully reconnected to: ${deviceInfo.name || deviceInfo.id}`);
        } catch (error) {
          console.log(`Failed to reconnect to ${deviceInfo.name || deviceInfo.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error loading bonded devices:', error);
    }
  };

  // Disconnect from a device
  const disconnectFromDevice = async (deviceId: string, removeBond = false) => {
    try {
      // Set flag to prevent automatic reconnection
      isReconnecting.current[deviceId] = false;
      
      // Clear any pending reconnection attempts
      if (reconnectTimers.current[deviceId]) {
        clearTimeout(reconnectTimers.current[deviceId]);
        delete reconnectTimers.current[deviceId];
      }
      
      // Remove the disconnection listener if exists
      if (disconnectionSubscriptions.current[deviceId]) {
        disconnectionSubscriptions.current[deviceId].remove();
        delete disconnectionSubscriptions.current[deviceId];
      }
      
      await manager.cancelDeviceConnection(deviceId);
      setConnectedDevices(prev => prev.filter(d => d.id !== deviceId));
      
      if (removeBond) {
        await removeBondedDevice(deviceId);
      }
      
      console.log('Disconnected from device:', deviceId);
    } catch (error) {
      console.error('Error disconnecting from device:', error);
    }
  };

  // Read characteristic from a device
  const readCharacteristic = async (
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string
  ) => {
    try {
      const device = connectedDevices.find(d => d.id === deviceId);
      if (!device) {
        throw new Error('Device not found');
      }
      
      const characteristic = await device.readCharacteristicForService(
        serviceUUID,
        characteristicUUID
      );
      
      console.log('Read characteristic value:', characteristic.value);
      return characteristic.value; // Base64 encoded value
    } catch (error) {
      console.error('Error reading characteristic:', error);
      throw error;
    }
  };

  // Write to a characteristic
  const writeCharacteristic = async (
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string,
    value: string, // Base64 encoded value
    withResponse = true
  ) => {
    try {
      const device = connectedDevices.find(d => d.id === deviceId);
      if (!device) {
        throw new Error('Device not found');
      }
      
      if (withResponse) {
        await device.writeCharacteristicWithResponseForService(
          serviceUUID,
          characteristicUUID,
          value
        );
      } else {
        await device.writeCharacteristicWithoutResponseForService(
          serviceUUID,
          characteristicUUID,
          value
        );
      }
      
      console.log('Write to characteristic successful');
    } catch (error) {
      console.error('Error writing to characteristic:', error);
      throw error;
    }
  };

  // Subscribe to notifications from a characteristic
  const subscribeToCharacteristic = (
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string,
    listener: (value: string | null, error?: Error) => void
  ) => {
    try {
      const device = connectedDevices.find(d => d.id === deviceId);
      if (!device) {
        throw new Error('Device not found');
      }
      
      const subscription = device.monitorCharacteristicForService(
        serviceUUID,
        characteristicUUID,
        (error, characteristic) => {
          if (error) {
            listener(null, error);
            return;
          }
          
          if (characteristic && characteristic.value) {
            listener(characteristic.value);
          }
        }
      );
      
      return subscription; // Return subscription to unsubscribe later
    } catch (error) {
      console.error('Error subscribing to characteristic:', error);
      throw error;
    }
  };

  // Discover services and characteristics of a device and log them
  const discoverServicesAndCharacteristics = async (deviceId: string) => {
    try {
      const device = connectedDevices.find(d => d.id === deviceId);
      if (!device) {
        throw new Error('Device not found');
      }
      
      const services = await device.services();
      console.log(`Services for device ${device.name || device.id}:`);
      
      for (const service of services) {
        console.log(`- Service: ${service.uuid}`);
        
        const characteristics = await service.characteristics();
        for (const characteristic of characteristics) {
          console.log(`  - Characteristic: ${characteristic.uuid}`);
          console.log(`    Properties: ${JSON.stringify({
            isReadable: characteristic.isReadable,
            isWritableWithResponse: characteristic.isWritableWithResponse,
            isWritableWithoutResponse: characteristic.isWritableWithoutResponse,
            isNotifiable: characteristic.isNotifiable,
            isIndicatable: characteristic.isIndicatable,
          })}`);
        }
      }
      
      return services;
    } catch (error) {
      console.error('Error discovering services and characteristics:', error);
      throw error;
    }
  };

  // Initialize Bluetooth service when component mounts
  useEffect(() => {
    const initialize = async () => {
      await checkBluetoothPermission();
      if (hasPermission) {
        await loadBondedDevices();
      }
    };
    
    initialize();
    
    // Clean up when component unmounts
    return () => {
      stopScanning();
      
      // Clear all disconnection subscriptions
      Object.values(disconnectionSubscriptions.current).forEach(subscription => {
        subscription.remove();
      });
      disconnectionSubscriptions.current = {};
      
      // Clear all reconnection timers
      Object.values(reconnectTimers.current).forEach(timer => {
        clearTimeout(timer);
      });
      reconnectTimers.current = {};
      
      // Disconnect from all devices
      connectedDevices.forEach(device => {
        manager.cancelDeviceConnection(device.id)
          .catch(error => console.log(`Error disconnecting from ${device.id}:`, error));
      });
    };
  }, [hasPermission]);

  // Return all functions and state for components to use
  return {
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
    saveBondedDevice,
    removeBondedDevice
  };
};

export default bluetoothService;