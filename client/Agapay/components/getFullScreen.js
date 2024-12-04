import { Dimensions, Platform, StatusBar } from "react-native";
import { Constants } from 'expo-constants';

const logDeviceDimensions = (statusBarHeight, fullScreenHeight) => {
  console.log(
    `Device Dimensions: \n- Status bar Height: ${statusBarHeight}\n- Screen Height: ${
      Dimensions.get("screen").height
    }\n- Full Screen Height: ${fullScreenHeight}`
  );
};

const getFullScreenHeight = () => {
  const fullScreenHeight = Dimensions.get("screen").height;
  return fullScreenHeight;
};

const statusBarSize = () => {
  const statusBarHeight =
   Platform.OS === "ios" ? Constants.statusBarHeight : StatusBar.currentHeight;
  return statusBarHeight;
};


export { getFullScreenHeight, statusBarSize };
