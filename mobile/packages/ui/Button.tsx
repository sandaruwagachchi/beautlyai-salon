import React from 'react';
import { Button as PaperButton, type ButtonProps } from 'react-native-paper';

export const Button: React.FC<ButtonProps> = (props) => {
  return <PaperButton {...props} />;
};
