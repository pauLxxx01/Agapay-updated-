import LottieView from "lottie-react-native";
import { View, StyleSheet } from "react-native";
const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("../../assets/loading/loading.json")}
        autoPlay
        loop
        style={styles.animation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  animation: {
    width: 150,
    height: 150,
  },
});

export default LoadingScreen;
