export interface IContact extends Document {
  name: string;
  phone: string;
  message: string;
  email: string;
  contactType: 'complaints' | 'suggestions' | 'customerService';
  isOpened: boolean;
}
