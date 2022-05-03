import { FC } from 'react';
import { User } from '../Interfaces/User';

export const UserIcon: FC<User> = ({ name }) => {
  return (
    <div className='userContainer'>
      <div>
        <h1>{name.charAt(0).toUpperCase()}</h1>
      </div>
      <span style={{ marginTop: 10 }}>{name}</span>
    </div>
  );
};
