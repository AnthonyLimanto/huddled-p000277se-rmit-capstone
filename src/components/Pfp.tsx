import React, { useEffect, useState } from "react";
import { Avatar } from "@rneui/base";
import { downloadPfp } from "../helper/bucketHelper"; // Adjust the import path as necessary

interface PfpProps {
  email: string; 
  name: string; 
}

export const Pfp = ({ email, name }: PfpProps) => {
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
        size={40}
        rounded
        source={{ uri: pfpUrl }}
        containerStyle={{
          backgroundColor: "#fff",
        }}
      />
    );
  } else {
    // Render Avatar with the first letter of the username
    return (
      <Avatar
        size={40}
        rounded
        title={name[0].toUpperCase()} 
        containerStyle={{
          backgroundColor: "#ccc",
        }}
        titleStyle={{
          color: "#fff",
          fontWeight: "bold",
        }}
      />
    );
  }
};