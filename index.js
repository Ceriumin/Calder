/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/navigation/StackNavigator';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
