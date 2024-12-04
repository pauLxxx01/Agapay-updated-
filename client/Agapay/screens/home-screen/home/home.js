import React, { useState, useContext, useRef, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Dimensions,
  Animated,
  PanResponder,
  Platform,
  StatusBar,
  RefreshControl,
} from "react-native";
import { AuthContext } from "../../../context/authContext";
//static data
import { menuItems, emergencies, infoCardData } from "../../../infoData/data";

//components
import EmergencyCard from "./../../../components/emergency-card/emergencyCard";
import MenuList from "../../../components/side-menu-list/icon";
import InfoCard from "../../../components/emergency-card/infoCard";

//dimension
const { width, height } = Dimensions.get("window");
import {
  getFullScreenHeight,
  statusBarSize,
} from "./../../../components/getFullScreen";
console.log("Constants: ", Constants.statusBarHeight);
const statusBarHeight =
  Platform.OS === "ios" ? Constants.statusBarHeight : StatusBar.currentHeight;

import Constants from "expo-constants";

export default function Homepage({ navigation }) {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-250)).current;
  const [emergencyImg, setEmergencyImg] = useState(null);

  //user info
  const [state] = useContext(AuthContext);
  const horizontalScrollRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);

  console.log("state: ",state);

  // Function to handle refresh
  const onRefresh = async () => {
    setRefreshing(true);

    try {
      // Simulate a network request or data update
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      Animated.timing(sidebarAnim, {
        toValue: -250,
        duration: 300,
        useNativeDriver: true,
      }).start();
      // Reset the scroll position to the start after refreshing
      horizontalScrollRef.current?.scrollTo({ x: 0, animated: true });
      setRefreshing(false);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        gestureState.dx < -20 && menuVisible;
    
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx < 0) {
          Animated.timing(sidebarAnim, {
            toValue: Math.max(gestureState.dx, -150),
            duration: 0,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -100) {
          toggleMenu();
        } else {
          Animated.timing(sidebarAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
    Animated.timing(sidebarAnim, {
      toValue: menuVisible ? -250 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const openModal = (alertType) => {
    setSelectedAlert(alertType);
  };
  const closeModal = () => setSelectedAlert(null);

  const handleConfirm = (selectedAlert) => {
    closeModal();
    const matchingEmergency = emergencies.find(
      (emergency) => emergency.type === selectedAlert
    );
    console.log("selected alert: " + selectedAlert)

    if (matchingEmergency) {
      setEmergencyImg(matchingEmergency.img);
      navigation.navigate("Progress", {
        ...matchingEmergency.reminder,
        name: selectedAlert,
        img: matchingEmergency.img,
      });
    } else {
      console.error("Error: Selected alert does not match any emergency type.");
    }
  };

  return (
    <SafeAreaView style={styles.container} {...panResponder.panHandlers}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View
          style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}
        >
          <View style={styles.logo}>
            <Text style={styles.logoText}>AGAPAY</Text>
          </View>
          {/* Menu bar list */}
          {menuItems.map((item, index) => (
            <MenuList
              key={index}
              toNavigate={item.toNavigate}
              name={item.name}
              text={item.text}
              navigation={navigation}
            />
          ))}
        </Animated.View>
        {/* Modal for Exit Confirmation */}

        {menuVisible && (
          <TouchableOpacity
            style={styles.overlay}
            onPress={toggleMenu}
            activeOpacity={1}
          />
        )}

        <View style={styles.mainContent}>
          <View style={styles.headerContainer}>
            <View style={styles.header}>
              {/* menu bar */}
              <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
                <Text style={styles.menuText}>☰</Text>
              </TouchableOpacity>
              {/* Greetings for user */}
              <View style={styles.headerContent}>
                <Text style={styles.greeting}>{state.user.account_id}</Text>
                <Text style={styles.subGreeting}>
                  I am ready to help you, ka - AGAPAY!
                </Text>
              </View>
              {/* <Image source={require('../../../assets/anna.png')} style={styles.profileImage} /> */}
            </View>

            {/*  info card list */}
            <ScrollView
              horizontal
              ref={horizontalScrollRef}
              showsHorizontalScrollIndicator={false}
              style={styles.upperScrollView}
              contentContainerStyle={styles.upperScrollContent}
              scrollEventThrottle={0}
            >
              {infoCardData.map((card, index) => (
                <InfoCard
                  key={index}
                  title={card.title}
                  source={card.source}
                  description={card.description}
                />
              ))}
            </ScrollView>
          </View>

          {/* emergency card list */}
          <View style={styles.bottomSection}>
            <Text style={styles.sectionTitle}>HOW CAN I HELP YOU?</Text>
            <View style={styles.grid}>
              {emergencies.map((item) => (
                <EmergencyCard key={item.id} {...item} openModal={openModal} />
              ))}
            </View>
          </View>

          {/* modal confirmation to navigate */}
          {selectedAlert && (
            <Modal
              animationType="fade"
              transparent={true}
              visible={selectedAlert !== null}
              onRequestClose={closeModal}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalText}>
                    Do you really want to send an SOS alert under{" "}
                    {selectedAlert}?
                  </Text>
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => handleConfirm(selectedAlert)}
                    >
                      <Text style={styles.buttonText}>YES</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => closeModal()}
                    >
                      <Text style={styles.buttonText}>NO</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  marqueeContainer: {
    overflow: "hidden",
    width: "100%", // Adjust based on your layout
  },
  marquee: {
    fontSize: 24,
    whiteSpace: "nowrap", // Prevent line breaks
  },
  card: {
    width: 200, // Width of your InfoCard
    marginRight: 10, // Space between cards
  },
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    height: getFullScreenHeight(),
    width: "60%",
    backgroundColor: "#800000",
    paddingVertical: 20,
    paddingHorizontal: 10,
    zIndex: 50,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  toggleBtn: {
    backgroundColor: "transparent",
    padding: 10,
  },
  logo: {
    marginVertical: 50,
    alignItems: "center",
  },
  logoText: {
    marginTop: 30,
    color: "#fff",
    fontSize: 35,
    fontWeight: "bold",
  },
  menu: {
    flex: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingLeft: 5,
  },
  menuTextText: {
    color: "#fff",
    fontSize: 20,
    marginLeft: 10,
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  headerContainer: {
    backgroundColor: "#8B0000",
    borderBottomLeftRadius: width * 0,
    height: getFullScreenHeight() * 0.38,
    paddingTop: statusBarSize(),
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.02,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: {
    fontSize: width * 0.06,
    color: "#FFF",
  },
  headerContent: {
    flex: 1,
    marginLeft: width * 0.02,
  },
  profileImage: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.075,
  },
  greeting: {
    color: "#FFF",
    fontSize: width * 0.055,
    fontWeight: "bold",
  },
  subGreeting: {
    color: "#FFF",
    fontSize: width * 0.035,
  },
  upperScrollContent: {
    gap: width * 0.03,
    paddingTop: height * 0.03,
    // paddingLeft: width * 0.14,
    // paddingRight: width * 0.04,
    paddingHorizontal: width * 0.07,
  },

  bottomSection: {
  
    height: getFullScreenHeight() * 0.62,
  },
  sectionTitle: {
    paddingVertical: 16,
    fontSize: width * 0.05,
    fontWeight: "bold",
    textAlign: "center",
    color: "maroon",
  },
  grid: {
    height: getFullScreenHeight() * 0.52, // Adjust this value if necessary to fit two rows
    zIndex: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: width * 0.05,
    justifyContent: "center",
    alignItems: "center", // Center items vertically within the grid
    maxHeight: getFullScreenHeight() * 0.52, // Ensure it doesn't exceed the height
    overflow: "hidden",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: width * 0.8,
    backgroundColor: "white",
    borderRadius: 10,
    padding: height * 0.03,
    alignItems: "center",
  },
  modalText: {
    fontSize: width * 0.045,
    textAlign: "center",
    marginBottom: height * 0.02,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    backgroundColor: "#7E0000",
    padding: height * 0.01,
    borderRadius: 10,
    width: "45%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: width * 0.04,
  },
});
