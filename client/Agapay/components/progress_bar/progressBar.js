import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { getFullScreenHeight } from "../getFullScreen";

// Create an animated version of Rect
const AnimatedRect = Animated.createAnimatedComponent(Rect);

const ProgressBar = ({ progress }) => {
  const [indeterminate, setIndeterminate] = useState(true);
  const [color, setColor] = useState("");
  const [animate, setAnimate] = useState(true);
  const [displayProgress, setDisplayProgress] = useState(false);

  // Animated value for the progress width
  const progressAnim = new Animated.Value(0);

  useEffect(() => {
    if (progress === "100") {
      setColor("#4caf50");
      setAnimate(false); // Disable animation when progress is 100
      setDisplayProgress(true); // Display progress instantly
    } else {
      setColor("#800000");
      setAnimate(true); // Enable animation when progress is not 100
      setDisplayProgress(false); // Hide progress until it reaches 100
    }
    const interval = setInterval(() => {
      setIndeterminate((prevState) => !prevState); // Toggle indeterminate state
    }, 3000);
    return () => clearInterval(interval);
  }, [progress]);

  useEffect(() => {
    if (animate) {
      if (!indeterminate) {
        Animated.timing(progressAnim, {
          toValue: progress / 100, // Normalize progress to a value between 0 and 1
          duration: 500, // Duration of the animation (in milliseconds)
          useNativeDriver: false, // We are animating width, not transform
        }).start();
      } else {
        // For indeterminate state, animate a "pulsing" effect
        Animated.loop(
          Animated.sequence([
            Animated.timing(progressAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: false,
            }),
            Animated.timing(progressAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: false,
            }),
          ])
        ).start();
      }
    } else {
      // When progress is 100, set progressAnim to 1 without animation
      progressAnim.setValue(1);
    }
  }, [progress, indeterminate, animate]);

  const width = getFullScreenHeight() * 0.32; // Width of the bar
  const height = 10; // Height of the bar
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width], // Interpolate to adjust the width
  });

  return (
    <View>
      <Svg height={height} width={width}>
        {/* Background bar */}
        <Rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill="#e0e0e0"
          rx={5} // Optional: for rounded corners
        />
        {/* Foreground bar (animated progress or pulsing effect) */}
        <AnimatedRect
          x="0"
          y="0"
          width={progressWidth}
          height={height}
          fill={color}
          rx={5} // Optional: for rounded corners
        />
      </Svg>
      <Text style={{ color: color, fontSize: 12, marginTop: 5 }}>
        {progress === "100"
          ? `${progress}%`
          : indeterminate
          ? "Loading..."
          : `${progress}%`}
      </Text>
    </View>
  );
};

export default ProgressBar;
