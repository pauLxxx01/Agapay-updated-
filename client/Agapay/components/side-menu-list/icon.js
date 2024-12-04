import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/FontAwesome"; // Assuming you're using FontAwesome icons
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const MenuList = ({ toNavigate, name, navigation, text }) => {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => navigation.navigate(toNavigate)}
    >
      <Icon name={name} size={22} color="#fff" />
      <Text style={styles.menuText}>{text}</Text>
    </TouchableOpacity>
  );
};

export default MenuList;

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingLeft: 5,
  },
  menuText: {
    color: "#fff",
    fontSize: width * 0.04,
    marginLeft: 10,
  },
});
