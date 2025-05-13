export type Message = {
    id: string;
    sender: string;
    content: string;
    isOwnMessage: boolean; // Indicates if the message is sent by the current user, not part of database schema
  }