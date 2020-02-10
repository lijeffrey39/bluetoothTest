import React from 'react';
import { Button, NativeModules, NativeEventEmitter, View, Alert } from 'react-native';
import { stringToBytes, bytesToString } from 'convert-string';

// import { BleManager } from "react-native-ble-plx"
import BleManager from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export class BlueToothTest extends React.Component{

    // state = {
    //     peripherals: new Map(),
    //   };
    constructor() { 

        super();
        this.state = {
            is_scanning: false, // whether the app is currently scanning for peripherals or not
            peripherals: null, // the peripherals detected
            connected_peripheral: null, // the currently connected peripheral
        }
        this.gearVR = [];
        this.peripherals = []; // temporary storage for the detected peripherals
        this.startScan = this.startScan.bind(this); // function for scanning for peripherals
    }

    // componentWillMount() {

    //     // initialize the BLE module
    //     BleManager.start({showAlert: true})
    //     .then(() => {
    //         console.log('Module initialized');
    //     });

    //     BleManager.checkState();
    //     this.startScan()

    //     // next: add code for checking coarse location
    // }

    componentDidMount() {
        BleManager.start({showAlert: true})
        .then(() => {
            console.log('Module initialized');
        });


        bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', (peripheral) => {
            var peripherals = this.peripherals; // get the peripherals
            // check if the peripheral already exists 
            // var el = peripherals.filter((el) => {
            //     return el.id === peripheral.id;
            // });

            // if(!el.length){
            //     peripherals.push({
            //         id: peripheral.id, // mac address of the peripheral
            //         name: peripheral.name // descriptive name given to the peripheral
            //     });
            //     this.peripherals = peripherals; // update the array of peripherals
            // }
            // console.log(peripheral.name)
            if (peripheral.name == 'Gear VR Controller(D5F9)') {
                console.log(peripheral);
                this.gearVR = peripheral;
            }
        });
        // next: add code for listening for when the peripheral scan has stopped

        bleManagerEmitter.addListener(
            'BleManagerStopScan',
            () => {
                console.log('scan stopped');
                // if(this.peripherals.length == 0){
                //     // Alert.alert('Nothing found', "Sorry, no peripherals were found");
                //     console.log("huh")
                // }
                // this.setState({
                //     is_scanning: false,
                //     peripherals: this.peripherals
                // });
            }
        );

        bleManagerEmitter.addListener(
            'BleManagerDidUpdateValueForCharacteristic',
            ({ value, peripheral, characteristic, service }) => {
                // Convert bytes array to string
                // console.log(value)
                newBuff = new Uint8Array(value)
                console.log(Boolean(newBuff[58] & (1 << 0)))
                const data = bytesToString(value);
                // console.log(`Recieved ${data} for characteristic ${characteristic}`);
            }
        );

        // bleManagerEmitter.addListener(
        //     'BleManagerDisconnectPeripheral',
        //     (() => this.newConnect())
        // );
        // next: add code for binding to Pusher events

        // this.startScan()
    }

    startScan() {
        this.peripherals = [];
        this.setState({
            is_scanning: true
        });
        
        BleManager.scan([], 3, true)
        .then(() => { 
            console.log('scan started');
        });
    }

    // connect() {
    //     peripheral_id = this.gearVR.id;
    //     BleManager.connect(peripheral_id)
    //         .then(() => {
    //         this.setState({
    //             connected_peripheral: peripheral_id
    //         });

    //         Alert.alert('Connected!', 'You are now connected to the peripheral.');

    //         // retrieve the services advertised by this peripheral
    //         BleManager.retrieveServices(peripheral_id)
    //             .then((peripheralInfo) => {
    //                 console.log('Peripheral info:', peripheralInfo);
    //             }
    //         ); 
    //         })
    //         .catch((error) => {
    //             Alert.alert("Err..", 'Something went wrong while trying to connect.');
    //         });

    //     bleManagerEmitter.addListener(
    //         'BleManagerDidUpdateValueForCharacteristic',
    //         ({ value, peripheral, characteristic, service }) => {
    //             // Convert bytes array to string
    //             const data = bytesToString(value);
    //             console.log(`Recieved ${data} for characteristic ${characteristic}`);
    //         }
    //     );
    // }

    startNotification() {
        BleManager.startNotification(this.gearVR.id, 
                                    '4f63756c-7573-2054-6872-65656d6f7465',
                                    'c8c51726-81bc-483b-a052-f7a14ea3d281')
        .then(() => {
            // Success code
            console.log('Notification started');
        })
        .catch((error) => {
            // Failure code
            console.log(error);
        });
    }

    writeNotification() {
        // const data = stringToBytes('0100');
        // console.log(data)
        // data = new Uint8Array([1, 0]);

        data = [8,0]
        BleManager.write(this.gearVR.id, 
                        '4f63756c-7573-2054-6872-65656d6f7465',
                        'c8c51726-81bc-483b-a052-f7a14ea3d282', 
                        data)
        .then(() => {
            // Success code
            console.log('Write: ' + data);
            data = [1,0]
            BleManager.write(this.gearVR.id, 
                            '4f63756c-7573-2054-6872-65656d6f7465',
                            'c8c51726-81bc-483b-a052-f7a14ea3d282', 
                            data).then(() => {
                                console.log('LSKFDJLKDSJFLJDSLKFJDS')
                                BleManager.write(this.gearVR.id, 
                                    '4f63756c-7573-2054-6872-65656d6f7465',
                                    'c8c51726-81bc-483b-a052-f7a14ea3d282', 
                                    [4, 0])
                            }).catch((error) => {
                                console.log(error)
                            })
        })
        .catch((error) => {
            // Failure code
            console.log(error);
        });
    }



    newConnect() {
        BleManager.connect(this.gearVR.id).then(() => {

            // Alert.alert('Connected!', 'You are now connected to the peripheral.');
  
            setTimeout(() => {
  
              /* Test read current RSSI value
              BleManager.retrieveServices(peripheral.id).then((peripheralData) => {
                console.log('Retrieved peripheral services', peripheralData);
                BleManager.readRSSI(peripheral.id).then((rssi) => {
                  console.log('Retrieved actual RSSI value', rssi);
                });
              });*/
  
              // Test using bleno's pizza example
              // https://github.com/sandeepmistry/bleno/tree/master/examples/pizza
              BleManager.retrieveServices(this.gearVR.id).then((peripheralInfo) => {
                console.log(peripheralInfo);
                var service = '4f63756c-7573-2054-6872-65656d6f7465';
                var notify = 'c8c51726-81bc-483b-a052-f7a14ea3d281';
                var characteristic = 'c8c51726-81bc-483b-a052-f7a14ea3d282';
  
                setTimeout(() => {
                  BleManager.startNotification(this.gearVR.id, service, notify).then(() => {
                    console.log('Started notification on ' + this.gearVR.id);
                    setTimeout(() => {
                      BleManager.write(this.gearVR.id, service, characteristic, [1, 0]).then(() => {
                        console.log('Write: ' + data);
                      });
  
                    }, 500);
                  }).catch((error) => {
                    console.log('Notification error', error);
                  });
                }, 200);
              });
  
            }, 900);
          }).catch((error) => {
            console.log('Connection error', error);
          });
    }


    // scanAndConnect() {
    //     this.manager.startDeviceScan(null, null, (error, device) => {
    //         // console.log("scanning")
    //         // console.log(device.name)
    //         if (error) {
    //             return;
    //         }

    //         if (device && device.name == 'Gear VR Controller(D5F9)') {
    //             console.log("FOUND THIS BITCH");
    //             console.log(device);

    //             this.manager.stopDeviceScan()
    //             device.connect()
    //             // .then((device) => {
    //             //     console.log(device)
    //             //     consolelog("Discovering services and characteristics")
    //             //     // return device.discoverAllServicesAndCharacteristics()
    //             // })
    //             // .then((device) => {
    //             //     console.log("Setting notifications")
    //             //     return this.setupNotifications(device)
    //             // })
    //             // .then(() => {
    //             //     console.log("Listening...")
    //             // }, (error) => {
    //             //     console.log(error.message)
    //             // })
        
    //         }
    //     });
    // }

    serviceUUID() {
        return '4f63756c-7573-2054-6872-65656d6f7465'
    }

    notifyUUID() {
        return 'c8c51726-81bc-483b-a052-f7a14ea3d281'
    }
    
    writeUUID() {
        return 'c8c51726-81bc-483b-a052-f7a14ea3d282'
    }

    // async setupNotifications(device) {
    //     console.log("FHLDSKJFL");
    //     const service = this.serviceUUID()
    //     const characteristicW = this.writeUUID()
    //     const characteristicN = this.notifyUUID()

    //     const characteristic = await device.writeCharacteristicWithResponseForService(
    //         service, characteristicW, "AQ==" /* 0x01 in hex */
    //     )

    //     device.monitorCharacteristicForService(service, characteristicN, (error, characteristic) => {
    //         if (error) {
    //             console.log(error.message);
    //             return
    //         }
    //         console.log(characteristic.uuid);
    //         console.log(characteristic.value);
    //         // this.updateValue(characteristic.uuid, characteristic.value)
    //     })
    //   }

    render() {
        const btnScanTitle = 'Scan Bluetooth (' + (this.state.is_scanning ? 'on' : 'off') + ')';
        return (
            <View style={{margin: 10}}>
            <Button title={btnScanTitle} onPress={() => this.startScan() } />        
            <Button title={'CONNECT'} onPress={() => this.newConnect() } />
            {/* <Button title={'START NOTIFICATION'} onPress={() => this.startNotification() } />
            <Button title={'WRITE NOTIFICATION'} onPress={() => this.writeNotification() } /> */}
          </View>
        );
    }
}