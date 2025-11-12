import { Redirect } from "expo-router";

export default function StartApp() {
  // 🚀 Démarrage direct sur le mode borne tactile
  return <Redirect href="/kiosk" />;
}
