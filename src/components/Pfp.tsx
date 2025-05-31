import React, { useEffect, useState } from "react";
import { Avatar } from "@rneui/base";
import { downloadPfp } from "../helper/bucketHelper"; // Adjust the import path as necessary
import { StyleProp, ViewStyle } from "react-native";

interface PfpProps {
  email: string;
  name: string;
  style?: StyleProp<ViewStyle>; // Accept a style prop
  size?: number;
}

export const Pfp = ({ email, name, style, size = 40 }: PfpProps) => {
  const [pfpUrl, setPfpUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchPfp = async () => {
      try {
        const url = await downloadPfp(email);
        setPfpUrl(url);
        console.log("Profile picture URL:", url);
      } catch (error) {
        console.error("Error downloading profile picture:", error);
      }
    };

    fetchPfp();

    // Cleanup the temporary URL when the component unmounts
    return () => {
      if (pfpUrl) {
        URL.revokeObjectURL(pfpUrl);
      }
    };
  }, [email]);

  if (pfpUrl && pfpUrl !== "default") {
    // Render Avatar with the profile picture
    return (
      <Avatar
        size={size || 50} // Default size if not provided
        rounded
        source={{ uri: pfpUrl }}
        containerStyle={[{ backgroundColor: "#fff" }, style]} 
      />
    );
  } else {
    // Render Avatar with the first letter of the username
    return (
      <Avatar
        size={size || 50}
        rounded
        title={name && name.length > 0 ? name[0].toUpperCase() : '?'} // First letter of the username or fallback
        containerStyle={[{ backgroundColor: "#ccc" }, style]} 
        titleStyle={{
          color: "#fff",
          fontWeight: "bold",
          fontSize: size * 0.9, 
        }}
      />
    );
  }
};