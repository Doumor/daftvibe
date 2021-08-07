import * as React from 'react';
import { StyleSheet, Button, View } from 'react-native';
//import { Ionicons } from 'react-native-vector-icons';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';


function App() {
  return (
    <div>
      <Tabs>
        <TabList>
          <Tab>Search</Tab>
          <Tab>IPFS</Tab>
        </TabList>
        <TabPanel>
          <h2>Any content 1</h2>
          <div className="sds">
            <button>Left button</button>
            <button>Right button</button>
          </div>
        </TabPanel>
        <TabPanel>
          <h2>Any content 2</h2>
        </TabPanel>
      </Tabs>
    </div>
  );
}
const styles = StyleSheet.create({
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
});
export default App;
