import axios from 'axios';

export const sendSMSTaqnyat = async (text: {
  recipient: number;
  code: string;
}): Promise<void> => {
  const data = {
    recipients: [text.recipient],
    body: `${text.code} :مرحبا بكم في متاجر صاري رمز الدخول هو`,
    sender: 'SarriTech',
    deleteId: 3242424,
  };

  const headers = {
    Authorization: `Bearer ${process.env.TAQNYAT_API_KEY}`,
    'Content-Type': 'application/json',
  };

  await axios.post('https://api.taqnyat.sa/v1/messages', data, { headers });
};
