import React from 'react';
import { StyleSheet, Text, View, FlatList, Dimensions, TouchableHighlight } from 'react-native';
import SocketIOClient from 'socket.io-client';

const data = [
  { key: 'A' }, { key: 'B' }, { key: 'C' }, { key: 'D' }, { key: 'E' }, { key: 'F' }, { key: 'G' }, { key: 'H' },
  // { key: 'K' },
  // { key: 'L' },
];

const formatData = (data, numColumns) => {
  const numberOfFullRows = Math.floor(data.length / numColumns);

  let numberOfElementsLastRow = data.length - (numberOfFullRows * numColumns);
  while (numberOfElementsLastRow !== numColumns && numberOfElementsLastRow !== 0) {
    data.push({ key: `blank-${numberOfElementsLastRow}`, empty: true });
    numberOfElementsLastRow++;
  }

  return data;
};

const numColumns = 2;
export default class App extends React.Component {  
  
  constructor() { 
    super();
    this.socket = SocketIOClient("http://10.0.0.144:5000/test", {query: 'b64=1'});
    this.state = {
      "A": false,
      "B": false,
      "C": false,
      "D": false,
      "E": false,
      "F": false,
      "G": false,
      "H": false
    }
    this.socket.on("this data", msg => {
        this.setState(msg['data'])
    });
  }

  sendData = (key) => {
    this.setState(prevState => ({
      ...prevState,
      [key]: true
    }));
    this.state[key] = true;
    this.socket.emit('button press', this.state);
  }

  release = (key) => {
    this.setState(prevState => ({
      ...prevState,
      [key]: false
    }));
    this.state[key] = false;
    this.socket.emit('button press', this.state);
  }

  changeStyle = (key) => {
    console.log(key)
    return styles.item;
  }

  renderItem = ({ item, index }) => {
    if (item.empty === true) {
      return <View style={[styles.item, styles.itemInvisible]} />;
    }
    return (
      // <TouchableHighlight style={styles.item} 
      //   // onTouchStart={() => this.sendData(item.key)} 
      //   onPress={() => this.sendData(item.key)}
      //   onLongPress={()=>console.log("in")}
      //   onPressOut={()=>console.log("out")}
      //   >
        <View onTouchStart={() => this.sendData(item.key)} 
              onTouchEnd={() => this.release(item.key)}
              // style={styles.item}>
              style={this.state[item.key] ? styles.item : styles.itemPressed}>
          <Text style={this.state[item.key] ? styles.itemText : styles.itemTextPressed}>{item.key}</Text>
        </View>
      // </TouchableHighlight>
    );
  };

  render() {
    return (
      <FlatList
        extraData={this.state}
        data={formatData(data, numColumns)}
        style={styles.container}
        renderItem={this.renderItem}
        numColumns={numColumns}
        scrollEnabled={false}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 20,
    paddingTop: 20
  },
  item: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    margin: 1,
    height: Dimensions.get('window').width / numColumns, // approximate a square
  },
  itemPressed: {
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    margin: 1,
    height: Dimensions.get('window').width / numColumns, // approximate a square
  },
  itemInvisible: {
    backgroundColor: 'transparent',
  },
  itemText: {
    color: 'black',
  },
  itemTextPressed: {
    color: 'white',
  },
});