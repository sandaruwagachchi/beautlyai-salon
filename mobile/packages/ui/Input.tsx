import React from 'react';
import { TextInput, type TextInputProps } from 'react-native-paper';

export const Input: React.FC<TextInputProps> = (props) => {
  return <TextInput {...props} />;
};
