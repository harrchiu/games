import React, { AllHTMLAttributes, HTMLAttributes, StyleHTMLAttributes } from 'react';
import styled from '@emotion/styled';

// allow any html styling types
const Flex = styled.div<
  {
    direction?: 'row' | 'column';
    center?: 'primary' | 'secondary' | 'both';
    gap?: number;
  } & React.HTMLProps<HTMLDivElement>
>`
  display: flex;
  flex-direction: ${(props) => props.direction || 'row'};
  justify-content: ${(props) => {
    if (props.center === 'primary') return 'center';
    if (props.center === 'both') return 'center';
    return undefined;
  }};
  align-items: ${(props) => {
    if (props.center === 'secondary') return 'center';
    if (props.center === 'both') return 'center';
    return undefined;
  }};
  gap: ${(props) => props.gap || 0}px;
`;

export default Flex;
