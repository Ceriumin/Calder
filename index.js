/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/navigation/StackNavigator';
import {name as appName} from './app.json';
import { Amplify } from 'aws-amplify';
import awsconfig from '/amplifyconfiguration.json';

Amplify.configure(awsconfig);
AppRegistry.registerComponent(appName, () => App);
