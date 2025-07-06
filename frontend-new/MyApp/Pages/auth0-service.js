import React, { useEffect, useState } from "react";
import { Button, Text, View, StyleSheet, Alert } from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as Crypto from "expo-crypto";
import { jwtDecode } from "jwt-decode";
import config from "./auth0-configuration";

WebBrowser.maybeCompleteAuthSession();

export default function Auth({ navigation }) {
  const [userInfo, setUserInfo] = useState(null);
  const [nonce, setNonce] = useState("");
  const [accessToken, setAccessToken] = useState("");

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
  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true, // required for Expo Go
  });
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: config.clientId,
      redirectUri: redirectUri,
      scopes: ["openid", "profile", "email"],
      responseType: "id_token token", // Request both ID token and access token
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

  useEffect(() => {
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
        // Store access token
        setAccessToken(params.access_token);
        console.log("Access Token:", params.access_token); // Log the access token

        const decoded = jwtDecode(params.id_token);

        // Verify nonce
        if (decoded.nonce !== nonce) {
          Alert.alert("Error", "Invalid authentication response");
          return;
        }

        setUserInfo(decoded);
        Alert.alert("Success", `Welcome ${decoded.name}`);
        navigation.replace("MainTabs");
      }
    } else if (response?.type === "error") {
      Alert.alert("Error", response.error.message);
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login with Auth0</Text>
      {userInfo ? (
        <>
          <Text style={styles.info}>Welcome, {userInfo.name}</Text>
          <Text style={styles.token}>Access Token logged to console</Text>
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
