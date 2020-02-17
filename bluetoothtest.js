import React from 'react';
import { Button, NativeModules, NativeEventEmitter, View, Alert } from 'react-native';

import BleManager from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export class BlueToothTest extends React.Component{

    constructor() { 
        super();
        this.state = {
            is_scanning: true
        }
        this.gearVR = null;
    }

    componentDidMount() {
        BleManager.start({showAlert: true})
        .then(() => {
            console.log('Module initialized');
        });

        // Discovering peripherals (Must be Gear VR Controller)
        bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', (peripheral) => {
            if (this.gearVR == null && peripheral.name == 'Gear VR Controller(D5F9)') {
                this.gearVR = peripheral;
            }
        });

        // When scanning is finished
        bleManagerEmitter.addListener(
            'BleManagerStopScan',
            () => {
                console.log('scan stopped');
            }
        );

        // Listener for whenever new values for a given characteristic
        bleManagerEmitter.addListener(
            'BleManagerDidUpdateValueForCharacteristic',
            ({ value, peripheral, characteristic, service }) => {
                newBuff = new Uint8Array(value)

                // Print Bool for whether the trigger is pressed our not
                console.log(Boolean(newBuff[58] & (1 << 0)))

                // console.log(newBuff[57])
                // const data = bytesToString(value);
                // console.log(`Recieved ${data} for characteristic ${characteristic}`);
            }
        );

        // Hack to reconnect remote when it disconnects after about 5 seconds
        bleManagerEmitter.addListener(
            'BleManagerDisconnectPeripheral',
            (() => this.newConnect())
        );
    }

    startScan() {
        this.setState({
            is_scanning: true
        });

        BleManager.scan([], 3, true)
        .then(() => { 
            console.log('scan started');
        });
    }
    
    // Connect to the gearVR and start notifications to start reading sensor values
    newConnect() {
        BleManager.connect(this.gearVR.id).then(() => {
            BleManager.retrieveServices(this.gearVR.id).then((peripheralInfo) => {
                var service = '4f63756c-7573-2054-6872-65656d6f7465';
                var notify = 'c8c51726-81bc-483b-a052-f7a14ea3d281';
                var characteristic = 'c8c51726-81bc-483b-a052-f7a14ea3d282';

                BleManager.startNotification(this.gearVR.id, service, notify).then(() => {
                    console.log('Started notification on ' + this.gearVR.id);   
                    // Write [1, 0] and [4, 0] to begin reading values
                    BleManager.write(this.gearVR.id, service, characteristic, [1, 0]).then(() => {
                        BleManager.write(this.gearVR.id, service, characteristic, [4, 0]).then(() => {
                            console.log('Write: ');
                        });
                    });
                }).catch((error) => {
                    console.log('Notification error', error);
                });
            }).catch((error) => {
                console.log(error);
            });
          }).catch((error) => {
            console.log('Connection error', error);
          });
    }

    render() {
        const btnScanTitle = 'Scan Bluetooth (' + (this.state.is_scanning ? 'on' : 'off') + ')';
        return (
            <View style={{margin: 10}}>
            <Button title={btnScanTitle} onPress={() => this.startScan() } />        
            <Button title={'CONNECT'} onPress={() => this.newConnect() } />
          </View>
        );
    }
}