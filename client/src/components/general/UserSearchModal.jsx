import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { startConversation } from '../../actions/chatActions';
import { useDebounce } from '../../hooks/useDebouncs';

const UserSearchModal = ({ isOpen, onClose, onNewConversationStarted }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searching, setSearching] = useState(false);

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Search users
  const searchUsers = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const user = JSON.parse(localStorage.getItem('userInfo') || '{}');

      const response = await fetch(`${API_URL}/api/v1/chat/search/?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${user?.access}`,
        },
      });

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setSearchResults(data.results || data);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search users');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const [debouncedSearch, cancelDebounce] = useDebounce(searchUsers, 500);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedUser(null); // clear selection when typing again

    if (query.trim()) {
      debouncedSearch(query);
    } else {
      setSearchResults([]);
    }
  };

  // Handle selecting a user from dropdown
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchQuery(user.username);
    setSearchResults([]); // close dropdown after selection (feels natural)
    inputRef.current?.focus();
  };

  // Start conversation
  const handleStartConversation = async () => {
    if (!selectedUser) {
      setError('Please select a user');
      return;
    }

    setSearching(true);
    setError('');

    try {
      const result = await dispatch(startConversation(selectedUser.username));

      if (onNewConversationStarted) {
        onNewConversationStarted(result.payload);
      }

      // Reset everything
      setSearchQuery('');
      setSelectedUser(null);
      setSearchResults([]);
      onClose();
    } catch (err) {
      console.log(err);
      setError('Failed to start conversation. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && 
          inputRef.current && !inputRef.current.contains(e.target)) {
        setSearchResults([]);
      }
    };

    if (searchResults.length > 0) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [searchResults.length]);

  // Reset on modal close
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUser(null);
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">

        {/* Modal Panel */}
        <div
          className="inline-block w-full max-w-md p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-light text-gray-900">Start New Chat</h3>
              <p className="text-sm text-gray-500 mt-1">
                Search by username, name, or email
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Input + Dropdown Container */}
          <div className="relative mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search users..."
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                autoFocus
              />

              {loading && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                </div>
              )}
            </div>

            {/* Dropdown Results - Absolute & High Z-Index */}
            {searchResults.length > 0 && (
              <>
                {/* Prevent backdrop clicks while dropdown open */}
                <div 
                  className="absolute inset-x-0 top-0 h-screen -z-10" 
                  onClick={(e) => e.stopPropagation()} 
                />

                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className={`px-4 py-3 cursor-pointer hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                        selectedUser?.id === user.id ? 'bg-purple-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 truncate">{user.username}</p>
                            <p className="text-sm text-gray-500 truncate">
                              {user.first_name && user.last_name
                                ? `${user.first_name} ${user.last_name}`
                                : user.email || user.first_name || 'No name'}
                            </p>
                          </div>
                        </div>
                        {user.is_online && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Online</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* No results */}
          {searchQuery.trim() && !loading && searchResults.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No users found</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Selected User Preview */}
          {selectedUser && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center text-white text-xl font-bold">
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedUser.username}</h4>
                    <p className="text-sm text-gray-600">
                      {selectedUser.first_name && selectedUser.last_name
                        ? `${selectedUser.first_name} ${selectedUser.last_name}`
                        : selectedUser.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border cursor-pointer border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleStartConversation}
              disabled={!selectedUser || searching}
              className="flex-1 px-6 py-3 bg-gradient-to-r cursor-pointer from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none font-medium"
            >
              {searching ? 'Starting...' : 'Start Chat'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;