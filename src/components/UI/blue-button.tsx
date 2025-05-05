import { ReactNode } from 'react';
import { Button } from 'react-bootstrap';

type ButtonType = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
};

const BlueButton = ({ children, onClick, className, disabled }: ButtonType) => {
  return (
    <Button
      onClick={onClick}
      style={{ backgroundColor: '#008cdd', color: '#fff' }}
      variant='outline-none'
      className={className}
      disabled={disabled}
    >
      {children}
    </Button>
  );
};

export default BlueButton;
