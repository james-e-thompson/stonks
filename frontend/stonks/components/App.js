import React from 'react';
import {
  Text,
  SafeAreaView,
  Alert,
  PermissionsAndroid,
  View,
  Button,
} from 'react-native';
import {useState, useEffect} from 'react';
import firebase from '../Firebase.js';
import Subscription from './Subscription.js';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import AddSubscriptionForm from './AddSubscriptionForm.js';

const API_URL = 'https://17362718.xyz';

PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  return null;
});

const getOrCreateUser = async deviceToken => {
  try {
    const {data} = await axios.get(
      `${API_URL}/users?deviceToken=${deviceToken}`,
    );
    return data.id;
  } catch (error) {
    if (error.response.status === 404) {
      const postResponse = await axios.post(`${API_URL}/users`, {deviceToken});
      return postResponse.data.id;
    }
  }
};

const updateToken = async (userId, newToken) => {
  return await axios.patch(`${API_URL}/users/${userId}`, {
    deviceToken: newToken,
  });
};

const getSubscriptions = async userId => {
  const response = await axios.get(`${API_URL}/users/${userId}/subscriptions`);
  return response.data;
};

export default function App() {
  const [userId, setUserId] = useState(null);
  const [subscriptions, setSubscriptions] = useState(null);
  const [formShown, setFormShown] = useState(false);
  const handleAddSubscription = async newSubscription => {
    setFormShown(false);
    const {data: subscription} = await axios.post(
      `${API_URL}/users/${userId}/subscriptions`,
      newSubscription,
    );
    setSubscriptions(existingSubscriptions => [
      ...existingSubscriptions,
      subscription,
    ]);
    setFormShown(false);
  };
  useEffect(() => {
    (async () => {
      const deviceToken = await messaging().getToken();
      const receivedId = await getOrCreateUser(deviceToken);
      setUserId(receivedId);
    })();
    return messaging().onTokenRefresh(deviceToken => {
      updateToken(userId, deviceToken);
    });
  }, [userId]);
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert(remoteMessage.notification.title);
    });
    return unsubscribe;
  });
  useEffect(() => {
    if (userId) {
      (async () => {
        const receivedSubscriptions = await getSubscriptions(userId);
        setSubscriptions(receivedSubscriptions);
      })();
    }
  }, [userId]);
  return (
    <SafeAreaView>
      {formShown || (subscriptions && subscriptions.length === 0) ? (
        <AddSubscriptionForm onAddSubscription={handleAddSubscription} />
      ) : (
        <View>
          {subscriptions ? (
            <>
              {subscriptions.map(subscription => (
                <Subscription
                  key={subscription.id}
                  subscription={subscription}
                />
              ))}
              <Button
                title="Add Tracker"
                onPress={() => {
                  setFormShown(true);
                }}
              />
            </>
          ) : (
            <Text>Loading...</Text>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
