import { BleManager, Device, Subscription } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';
import base64 from 'react-native-base64';

const ESP32_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const ENV_CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a1';
const ESP32_DEVICE_NAME = 'ESP32-Calder';

interface EnvironmentReading {
  temp: number;
  humidity: number;
}

class BluetoothService {
  manager: BleManager;
  device: Device | null = null;
  tempSubscription: Subscription | null = null;
  humiditySubscription: Subscription | null = null;
  
  constructor() {
    this.manager = new BleManager();
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Bluetooth Permission',
          message: 'The app needs bluetooth permission to connect to your device',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }

  async scanForDevices(onDeviceFound: (device: Device) => void, timeoutMs = 5000): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Bluetooth permissions not granted');
      }

      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          this.manager.stopDeviceScan();
          return;
        }
        
        if (device && device.name === ESP32_DEVICE_NAME) {
          onDeviceFound(device);
        }
      });

      // Stop scan after timeout
      setTimeout(() => {
        this.manager.stopDeviceScan();
      }, timeoutMs);
    } catch (error) {
      console.error('Error starting scan:', error);
      throw error;
    }
  }

  async connectToDevice(device: Device): Promise<Device> {
    try {
      const connectedDevice = await device.connect();
      const discoveredDevice = await connectedDevice.discoverAllServicesAndCharacteristics();
      this.device = discoveredDevice;
      
      return discoveredDevice;
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.tempSubscription) {
      this.tempSubscription.remove();
      this.tempSubscription = null;
    }
    
    if (this.humiditySubscription) {
      this.humiditySubscription.remove();
      this.humiditySubscription = null;
    }
    
    if (this.device) {
      await this.device.cancelConnection();
      this.device = null;
    }
  }

  async readEnvironmentData(): Promise<EnvironmentReading[]> {
    if (!this.device) {
      throw new Error('Device not connected');
    }
    
    try {
      const characteristic = await this.device.readCharacteristicForService(
        ESP32_SERVICE_UUID,
        ENV_CHAR_UUID
      );
      
      if (characteristic.value) {
        const dataString = base64.decode(characteristic.value);
        console.log('Received data string:', dataString);
        try {
          // Parse the JSON array
          const data = JSON.parse(dataString);
          
          // Ensure we're handling the data correctly regardless of format
          if (Array.isArray(data)) {
            return data as EnvironmentReading[];
          } else if (typeof data === 'object' && data !== null) {
            // Handle case where it might be a single object
            return [data as EnvironmentReading];
          }
          return [];
        } catch (e) {
          console.error('Error parsing environment data:', e, 'Raw data:', dataString);
          return [];
        }
      }
      return [];
    } catch (error) {
      console.error('Error reading environment data:', error);
      throw error;
    }
  }

  async readTemperature(): Promise<number> {
    if (!this.device) {
      throw new Error('Device not connected');
    }
    
    try {
      const readings = await this.readEnvironmentData();
      if (readings.length > 0) {
        return readings[readings.length - 1].temp;
      }

      return 0;
    } catch (error) {
      console.error('Error reading temperature:', error);
      throw error;
    }
  }

  async readHumidity(): Promise<number> {
    if (!this.device) {
      throw new Error('Device not connected');
    }
    
    try {
      const readings = await this.readEnvironmentData();
      // Return the most recent humidity reading if available
      if (readings.length > 0) {
        return readings[readings.length - 1].humidity;
      }
      return 0;
    } catch (error) {
      console.error('Error reading humidity:', error);
      throw error;
    }
  }

  monitorEnvironmentData(onDataReceived: (readings: EnvironmentReading[]) => void): void {
    if (!this.device) {
      throw new Error('Device not connected');
    }
    
    this.tempSubscription = this.device.monitorCharacteristicForService(
      ESP32_SERVICE_UUID,
      ENV_CHAR_UUID,
      (error, characteristic) => {
        if (error) {
          console.error('Environment data monitoring error:', error);
          return;
        }
        
        if (characteristic?.value) {
          const dataString = base64.decode(characteristic.value);
          console.log('Received notification data:', dataString);
          try {
            const data = JSON.parse(dataString);
            
            if (Array.isArray(data)) {
              onDataReceived(data as EnvironmentReading[]);
            } else if (typeof data === 'object' && data !== null) {
              onDataReceived([data as EnvironmentReading]);
            } else {
              console.error('Unexpected data format:', data);
            }
          } catch (e) {
            console.error('Error parsing environment data:', e, 'Raw data:', dataString);
          }
        }
      }
    );
  }

  monitorTemperature(onReading: (temp: number) => void): void {
    this.monitorEnvironmentData((readings) => {
      if (readings.length > 0) {
        onReading(readings[readings.length - 1].temp);
      }
    });
  }

  monitorHumidity(onReading: (humidity: number) => void): void {
    this.monitorEnvironmentData((readings) => {
      if (readings.length > 0) {
        onReading(readings[readings.length - 1].humidity);
      }
    });
  }
}

export default new BluetoothService();
