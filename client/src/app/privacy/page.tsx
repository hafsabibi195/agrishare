import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Privacy policy"
      intro="What information AgriShare collects and how it is used."
      sections={[
        ["Information we collect", "Your name, email, phone number and, when you allow it, your location so we can show equipment near your fields."],
        ["How it is used", "Owner contact numbers are shown on listings so farmers can call them. Location is used only to match you with nearby equipment."],
        ["Sharing", "We do not sell your personal information. Listing details you publish are visible to other AgriShare users."],
        ["Your choices", "You can stop sharing your location at any time from your browser settings and contact us to update or remove your account."]
      ]}
    />
  );
}
