import React from 'react';
import { Modal as PaperModal, type ModalProps } from 'react-native-paper';

export const Modal: React.FC<ModalProps> = (props) => {
  return <PaperModal {...props} />;
};
