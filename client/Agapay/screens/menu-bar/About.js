import React, { useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  ScrollView,
  Animated,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const { width, height } = Dimensions.get("window");

const About = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
    >
      <View style={styles.bgContainer}>
        <ImageBackground
          source={require("../../assets/agapay/background/agapaybg.jpg")}
          style={styles.background}
        >
          {/* Animated Logo */}
          <Animated.Image
            source={require("../../assets/agapay/logo/logo.png")}
            style={[
              styles.logo,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
            accessibilityLabel="AGAPAY Logo"
          />

          <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <Text style={styles.text}>
              AGAPAY is a comprehensive emergency and disaster response system
              designed for both web and mobile platforms. It provides real-time
              alerts, crucial information, and resources during emergencies,
              ensuring swift and efficient response efforts. With features like
              GPS tracking, communication tools, and access to emergency
              services, AGAPAY empowers individuals and communities to stay safe
              and connected during crises. Developed with user-friendly
              interfaces and robust backend infrastructure, AGAPAY aims to
              enhance disaster preparedness and resilience at every university.
              Let’s create a safer and more resilient future with us, KA-AGAPAY.
            </Text>
          </Animated.View>
        </ImageBackground>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  bgContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  background: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },

  logo: {
    width: width * 0.7,
    height: width * 0.7,
    resizeMode: "contain",
  },
  container: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: "white",
    elevation: 2,
    marginBottom: 16,
    width: "90%",
  },
  text: {
    fontSize: width * 0.045,
    fontWeight: "400",
    textAlign: "justify",
    lineHeight: 24,
    color: "black",
    paddingVertical: 8,
    paddingHorizontal: 8,
    letterSpacing: 0.5,
 
  },
  scrollView: {
    flexGrow: 1, // Ensures the ScrollView takes up the full height if there's not enough content
  },
});

export default About;
