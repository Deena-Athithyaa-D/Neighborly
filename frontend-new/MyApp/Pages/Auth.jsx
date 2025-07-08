import React, { useEffect, useState } from "react";
import { Button, Text, View, StyleSheet, Alert } from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as Crypto from "expo-crypto";
import { jwtDecode } from "jwt-decode";
import * as SecureStore from "expo-secure-store";
import config from "./auth0-configuration";

WebBrowser.maybeCompleteAuthSession();

export default function Auth({ navigation }) {
  const [userInfo, setUserInfo] = useState(null);
  const [nonce, setNonce] = useState("");
  const [uuid, setUuid] = useState("");

  useEffect(() => {
    const generateNonce = async () => {
      const newNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Math.random().toString()
      );
      setNonce(newNonce);
    };
    generateNonce();
  }, []);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: config.clientId,
      redirectUri: AuthSession.makeRedirectUri({
        useProxy: true,
        native: config.redirectUri,
      }),
      scopes: ["openid", "profile", "email"],
      responseType: "id_token token",
      extraParams: {
        audience: config.audience,
        nonce: nonce,
      },
    },
    {
      authorizationEndpoint: `https://${config.domain}/authorize`,
      tokenEndpoint: `https://${config.domain}/oauth/token`,
    }
  );

  const sendIdTokenToBackend = async (idToken) => {
    console.log("🪪 Sending ID Token to backend:", idToken);
    try {
      const response = await fetch(
        "https://neighborly-jek2.onrender.com/api/auth/auth0/",

        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id_token: idToken }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const receivedUuid = data.uuid;

      console.log("✅ Received UUID from backend:", receivedUuid);
      setUuid(receivedUuid);
      await SecureStore.setItemAsync("uuid", receivedUuid);

      return receivedUuid;
    } catch (error) {
      console.error("❌ Error sending ID token to backend:", error);
      throw error;
    }
  };

  const checkUserProfile = async (userId) => {
    try {
      const response = await fetch(
        `https://neighborly-jek2.onrender.com//api/get_profile/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(`🔍 Checking profile: ${response.status}`);

      if (response.status === 404) {
        return { status: 404 };
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { status: 200, data };
    } catch (error) {
      console.error("❌ Error checking user profile:", error);
      throw error;
    }
  };

  useEffect(() => {
    const handleAuthResponse = async () => {
      if (response?.type === "success") {
        const params = response.url
          .split("#")[1]
          .split("&")
          .reduce((acc, pair) => {
            const [key, value] = pair.split("=");
            acc[key] = decodeURIComponent(value);
            return acc;
          }, {});

        if (params.id_token && params.access_token) {
          const decoded = jwtDecode(params.id_token);
          console.log("📥 Decoded ID Token Payload:", decoded);

          if (decoded.nonce !== nonce) {
            Alert.alert("Error", "Invalid authentication response");
            return;
          }

          try {
            const uuid = await sendIdTokenToBackend(params.id_token);
            setUserInfo(decoded);

            const profileResult = await checkUserProfile(uuid);

            if (profileResult.status === 404) {
              navigation.replace("Profile");
            } else {
              Alert.alert("Success", `Welcome ${decoded.name}`);
              navigation.replace("Communities");
            }
          } catch (error) {
            Alert.alert("Error", "Failed to communicate with backend");
          }
        }
      } else if (response?.type === "error") {
        Alert.alert("Error", response.error.message);
      }
    };

    handleAuthResponse();
  }, [response]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login with Auth0</Text>
      {userInfo ? (
        <>
          <Text style={styles.info}>Welcome, {userInfo.name}</Text>
          <Text style={styles.token}>UUID: {uuid}</Text>
        </>
      ) : (
        <Button
          disabled={!request || !nonce}
          title="Log In"
          onPress={() => promptAsync()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 22, marginBottom: 20 },
  info: { fontSize: 18, color: "green", marginTop: 20 },
  token: { fontSize: 14, color: "gray", marginTop: 10 },
});
