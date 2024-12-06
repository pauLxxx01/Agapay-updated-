import { Dimensions, Platform, StatusBar } from "react-native";
import { Constants } from 'expo-constants';



const getFullScreenHeight = () => {
  const fullScreenHeight = Dimensions.get("screen").height;
  return fullScreenHeight;
};

const statusBarSize = () => {
  const statusBarHeight =
   Platform.OS === "iOS" ? Constants.statusBarHeight : StatusBar.currentHeight;
  return statusBarHeight;
};


export { getFullScreenHeight, statusBarSize };
