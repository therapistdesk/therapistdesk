import { QRCodeCanvas } from "qrcode.react";

export default function ClientQR({ token }) {
  const url = `${window.location.origin}/client-access/${token}`;
//   const url = `http://192.168.X.X:5173/client-access/${token}`;
// const url = `https://your-app.onrender.com/client-access/${token}`;

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h3>Сканирайте за достъп</h3>

      <QRCodeCanvas value={url} size={200} />

      <div style={{ marginTop: 10, fontSize: 12 }}>
        {url}
      </div>
    </div>
  );
}