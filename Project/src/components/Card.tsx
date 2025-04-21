import { Card as BaseCard, CardProps } from '../design-system/components/Card/Card';

export const Card = ({ children, ...props }: CardProps) => {
  return (
    <BaseCard {...props} data-component-name="_card">
      {children}
    </BaseCard>
  );
};