import React from 'react';
import { Card as PaperCard } from 'react-native-paper';

type CardProps = React.ComponentProps<typeof PaperCard>;

export const Card: React.FC<CardProps> = (props) => {
  return <PaperCard {...props} />;
};
