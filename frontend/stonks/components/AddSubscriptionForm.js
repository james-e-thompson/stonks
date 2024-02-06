import React from 'react';
import {Text, StyleSheet, TextInput, Button, SafeAreaView} from 'react-native';
import {ToggleButton} from 'react-native-paper';

const AddSubscriptionForm = ({onAddSubscription}) => {
  const [symbol, onChangeSymbol] = React.useState('');
  const [price, onChangePrice] = React.useState('');
  const [direction, setDirection] = React.useState('below');
  const handleSubmit = () => {
    onAddSubscription({symbol, price, above: direction === 'above'});
  };
  return (
    <SafeAreaView>
      <Text style={{...styles.label, ...styles.topLabel}}>Symbol</Text>
      <TextInput
        style={styles.input}
        onChangeText={onChangeSymbol}
        value={symbol}
      />
      <Text style={styles.label}>Price</Text>
      <TextInput
        style={styles.input}
        onChangeText={onChangePrice}
        value={price}
        placeholder=""
        keyboardType="numeric"
      />
      <ToggleButton.Row
        onValueChange={value => setDirection(value)}
        value={direction}
        style={styles.toggleButtons}>
        <ToggleButton icon="less-than-or-equal" value="below" />
        <ToggleButton
          icon="greater-than-or-equal"
          value="above"
          style={styles.rightToggleButton}
        />
        <Button title="Submit" onPress={handleSubmit} />
      </ToggleButton.Row>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  label: {
    height: 20,
    marginLeft: 12,
    marginRight: 12,
    paddingLeft: 10,
    paddingRight: 10,
  },
  topLabel: {
    marginTop: 10,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  toggleButtons: {
    marginLeft: 12,
  },
  rightToggleButton: {
    marginRight: 10,
  },
});

export default AddSubscriptionForm;
