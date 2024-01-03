export interface INotification {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  sender?: string;
  receiver: string;
  link: string;
  createdAt: Date;
  updatedAt: Date;
}
