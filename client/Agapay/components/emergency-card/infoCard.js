import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const responsiveFontSize = width * 0.04; // 4% of screen width
import getFullScreenHeight from "../getFullScreen";

const infoCard = ({ title, source, description }) => {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Image source={source} style={styles.cardImage} />
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
  );
};

export default infoCard;
const styles = StyleSheet.create({
  cardTitle: {
    fontSize: width * 0.04,
    fontWeight: "bold",
    color: "#212121",
    textAlign: "end",
  },

  infoCard: {
    maxWidth: width * 0.6,
    height: width * 0.45,

    padding: width * 0.04,
    backgroundColor: "#FFF",
    borderColor: "#FFB200",
    borderWidth: width * 0.01,

    borderRadius: 15,
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardImage: {
    width: width * 0.15,
    height: width * 0.15,
  },
  cardDescription: {
    fontSize: width * 0.03,
    textAlign: "justify",
    color: "#757575",
  },
});
