import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";

const SubmitButton = ({ handleSubmit, btnTitle, loading, styleBtn, styleTxt}) => {
  return (
    <TouchableOpacity style={styleBtn} onPress={handleSubmit}>
      <Text style={styleTxt}>
        {btnTitle}
      </Text>
    </TouchableOpacity>
  );
};


export default SubmitButton;
