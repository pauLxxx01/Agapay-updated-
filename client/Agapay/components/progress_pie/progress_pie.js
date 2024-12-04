import * as React from "react";
import {
  Easing,
  TextInput,
  Animated,
  Text,
  View,
  StyleSheet,
} from "react-native";
import Svg, { G, Circle } from "react-native-svg";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export default function Donut({
  initialPercentage,
  radius = 40,
  strokeWidth = 10,
  duration = 500,
  color = "#800000",
  delay = 0,
  textColor,
  intervalTime = 1000,
}) {
  const [percentage, setPercentage] = React.useState(initialPercentage);
  const animated = React.useRef(new Animated.Value(0)).current;
  const rectRef = React.useRef();
  const inputRef = React.useRef();
  const circumference = 2 * Math.PI * radius;

  const animation = (toValue) => {
    return Animated.timing(animated, {
      delay,
      toValue,
      duration,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  };

  React.useEffect(() => {
    animation(percentage);

    animated.addListener((v) => {
      const strokeDashoffset = circumference - (circumference * v.value) / 100;
      if (inputRef?.current) {
        inputRef.current.setNativeProps({
          text: Math.round(v.value).toString(),
        });
      }
      if (rectRef?.current) {
        rectRef.current.setNativeProps({
          strokeDashoffset,
        });
      }
    });

    const interval = setInterval(() => {
      setPercentage((prev) => (prev >= initialPercentage ? 0 : prev + 5)); 
    }, intervalTime);

    return () => {
      clearInterval(interval);
      animated.removeAllListeners();
    };
  }, [percentage]);

  return (
    <View style={{ width: radius * 2, height: radius * 2 }}>
      <Svg
        height={radius * 2}
        width={radius * 2}
        viewBox={`0 0 ${(radius + strokeWidth) * 2} ${
          (radius + strokeWidth) * 2
        }`}
      >
        <G
          rotation="-90"
          origin={`${radius + strokeWidth}, ${radius + strokeWidth}`}
        >
          <Circle
            ref={rectRef}
            cx="50%"
            cy="50%"
            r={radius}
            strokeDashoffset={circumference}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
          />
          <Circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeOpacity=".2"
          />
        </G>
      </Svg>
      <AnimatedTextInput
        ref={inputRef}
        underlineColorAndroid="transparent"
        editable={false}
        defaultValue="0"
        style={[
          StyleSheet.absoluteFillObject,
          { fontSize: radius / 2, color: textColor ?? color },
          styles.text,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  text: { fontWeight: "900", textAlign: "center" },
});
