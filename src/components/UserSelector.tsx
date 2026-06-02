import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { client } from '../utils/fetchClient';
import { User } from '../types/User';

interface Props {
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  setIsLoading: (value: boolean) => void;
  setErrorMessage: (message: string) => void;
}

export const UserSelector: React.FC<Props> = ({
  selectedUser,
  setSelectedUser,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    client
      .get<User[]>('/users')
      .then(res => setUsers(res || []))
      .catch(() => {});

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);

    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleToggle = () => setIsOpen(prev => !prev);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      data-cy="UserSelector"
      className={classNames('dropdown', { 'is-active': isOpen })}
    >
      <div className="dropdown-trigger">
        <button
          type="button"
          className="button"
          aria-haspopup="true"
          aria-controls="dropdown-menu"
          onClick={handleToggle}
        >
          <span>{selectedUser ? selectedUser.name : 'Choose a user'}</span>
          <span className="icon is-small">
            <i className="fas fa-angle-down" aria-hidden="true" />
          </span>
        </button>
      </div>

      <div className="dropdown-menu" id="dropdown-menu" role="menu">
        <div className="dropdown-content">
          {users.map(user => (
            <a
              key={user.id}
              href={`#user-${user.id}`}
              className={classNames('dropdown-item', {
                'is-active': selectedUser?.id === user.id,
              })}
              onClick={e => {
                e.preventDefault();
                handleSelectUser(user);
              }}
            >
              {user.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

UserSelector.propTypes = {
  selectedUser: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }),
  setSelectedUser: PropTypes.func.isRequired,
  setIsLoading: PropTypes.func.isRequired,
  setErrorMessage: PropTypes.func.isRequired,
};
