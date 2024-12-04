import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");
const SLIDE_INTERVAL = 2000; // 3 seconds interval for auto-slide

export default function SlidingImg({ navigation }) {
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    {
      key: "1",
      image: require("../../../assets/screen-page-icons/w1.png"),
      text: "Your UNIVERSITY 911, One call away and we are ready to help in any way we can",
    },
    {
      key: "2",
      image: require("../../../assets/screen-page-icons/w2.png"),
      text: "We ensure the safety and security of everyone on campus during emergencies and natural disasters",
    },
    {
      key: "3",
      image: require("../../../assets/screen-page-icons/w3.png"),
      text: "We facilitate quick and efficient communication during crises",
    },
    {
      key: "4",
      image: require("../../../assets/screen-page-icons/w4.png"),
      text: "We got you covered in any emergency inside the university",
    },
    {
      key: "5",
      image: require("../../../assets/screen-page-icons/w5.png"),
      text: "We protect the lives and well-being of the students, faculty, and staff, as well as maintain the integrity and functionality of the institution during crises.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= slides.length) {
          return 0;
        }
        return nextIndex;
      });
    }, SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: currentIndex * width,
        animated: true,
      });
    }
  }, [currentIndex]);

  return (
    <ImageBackground
      source={require("../../../assets/agapay/background/agapaybg.jpg")}
      style={styles.background}
    >
      <View style={styles.container}>
        {/* Logo Section */}
        <Image
          source={require("../../../assets/agapay/logo/logo.png")}
          style={styles.logo}
        />

        {/* Scrollable Slides */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          ref={scrollViewRef}
          style={styles.scrollView}
        >
          {slides.map((slide) => (
            <View key={slide.key} style={styles.slide}>
              <Image source={slide.image} style={styles.image} />
              <Text style={styles.text}>{slide.text}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Log In Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.buttonText}>Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 250, // Adjust the size of the logo as needed
    height: 150, // Adjust the size of the logo as needed
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: 60, // Adjust the margin to position the logo
    marginBottom: 1, // Space between logo and the slides
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: width,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  image: {
    width: 270, // Adjust the image size as needed
    height: 270, // Adjust the image size as needed
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 220,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 140, // Position near the bottom
    width: "100%",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#7E0000", // dark red background color
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
    elevation: 5, // Adds shadow on Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84, // Adds shadow on iOS
  },
  buttonText: {
    color: "#fff", // white text color
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
});
