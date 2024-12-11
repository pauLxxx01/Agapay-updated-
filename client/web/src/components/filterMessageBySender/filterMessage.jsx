import { useMemo } from 'react';

const useFilteredMessages = (messages, users) => {
  const filteredMessages = useMemo(() => {
    // Early return if messages or users are not available
    if (!messages || !users) return [];

    return messages
      .filter((message) =>
        users.some((user) => user._id.toString() === message.senderId.toString())
      )
      .map((message) => {
        // Find the user who sent the message
        const matchedUser = users.find(user => user._id.toString() === message.senderId.toString());
        return {
          ...matchedUser,
          createdAt: message.createdAt ? new Date(message.createdAt).toLocaleString() : null,
          messageID: message._id,
          respond: message.respond,
          emergency: message.emergency,
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort messages by createdAt in descending order
  }, [messages, users]); // Only depend on messages and users

  return filteredMessages;
};

export default useFilteredMessages;
