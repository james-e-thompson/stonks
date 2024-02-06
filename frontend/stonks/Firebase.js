import firebase from '@react-native-firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyAStr2z6593kfhEIDmB9u-rVVxYZkR-OXs',
  authDomain: 'stonks-e7689.firebaseapp.com',
  projectId: 'stonks-e7689',
  storageBucket: 'stonks-e7689.appspot.com',
  messagingSenderId: '956483255363',
  appId: '1:956483255363:android:be2f3016b8afe4425568f6',
  databaseURL: 'https://stonks-e7689.firebaseio.com',
};

let app;
if (firebase.apps.length === 0) {
  app = firebase.initializeApp(firebaseConfig);
} else {
  app = firebase.app();
}

export default firebase;
