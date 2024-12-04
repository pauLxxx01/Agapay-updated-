import { View, Text, TextInput, StyleSheet } from "react-native";
import React from "react";

const InputBox = ({
  styleInputBox,
  autoComplete,
  keyboardType,
  secureTextEntry = false,
  value,
  setValue,
  placeholder,
}) => {
  return (
    <View>
      <TextInput
        style={styleInputBox}
        autoCorrect={false}
        placeholder={placeholder}
        keyboardType={keyboardType}
        autoComplete={autoComplete}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={(text) => setValue(text)}
        
      />
    </View>
  );
};

export default InputBox;