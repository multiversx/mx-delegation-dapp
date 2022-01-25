import * as React from 'react';

interface CardType {
  label: string;
  key: string;
  data: {
    value: string;
    percentage?: string;
  };
}

const Card: React.FC<CardType> = ({ label, data }) => (
  <div key={label} style={{ flexGrow: 1 }} className='card p-3 ml-4 grow'>
    <span>{label}</span>

    <span className='mt-3'>{data.value}</span>

    {data.percentage && <span className='mt-3'>{data.percentage}</span>}
  </div>
);

export default Card;
