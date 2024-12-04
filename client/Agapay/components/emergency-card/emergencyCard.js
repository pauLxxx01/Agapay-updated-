import {
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  ImageBackground,
  View,
} from "react-native";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");


const emergencyCard = ({ type, img, title, openModal }) => (
  <TouchableOpacity style={styles.gridItem} onPress={() => openModal(type)}>
    <View
      style={{
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ImageBackground source={img} style={[styles.bg]} />
      <View style={styles.textContainer}>
        <Text style={styles.gridText}>{title}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default emergencyCard;

const styles = StyleSheet.create({
  gridItem: {
    width: width * 0.4,
    maxWidth: width * 0.4,
    height: height * 0.14,
    backgroundColor: "#FFF",
    borderColor: "#FFF",
    borderWidth: 4,
    borderRadius: width * 0.05,
    elevation: 10,
  },
  bg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
    
    zIndex: -1,
    opacity: 0.2,
  },
  gridIcon: {
    zIndex: 2,
    opacity: 1,
    maxWidth: width * 0.15,
    maxHeight: width * 0.15,
  },
  textContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  gridText: {
    zIndex: 10,
    fontSize: width * 0.05,
    fontWeight: "900",
    color: "maroon",
    textAlign: "center",
  },
});
