import {Text, StyleSheet, View} from 'react-native';
import React from 'react';

const comparisonSymbolStyle = above => ({
  backgroundColor: above ? '#43d96c' : '#cf2735',
  borderRadius: 50,
  paddingHorizontal: 8,
  border: '1px solid black',
});

export default function Subscription({subscription}) {
  const {symbol, above, price} = subscription;
  return (
    <Text style={styles.subscriptionText}>
      {symbol}{' '}
      <View style={comparisonSymbolStyle(above)}>
        <Text style={styles.comparisonSymbolText}>{above ? '≥' : '≤'}</Text>
      </View>{' '}
      ${price}
    </Text>
  );
}

const styles = StyleSheet.create({
  subscriptionText: {
    padding: '3%',
    fontSize: 40,
    borderBottomWidth: 1,
  },
  comparisonSymbolText: {fontSize: 30},
});
