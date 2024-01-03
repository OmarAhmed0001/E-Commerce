export interface SendNewsViaEmailInterface {
  email: string[];
  subject: string;
  subSubject: string;
  message: string;
}

export interface SendNewsViaSMSInterface {
  phone: string[];
  message: string;
}
