import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Terms of use"
      intro="The basic rules for renting and listing farm equipment on AgriShare."
      sections={[
        ["Using AgriShare", "AgriShare connects farmers with equipment owners. Rental agreements, prices and delivery are arranged directly between the farmer and the owner."],
        ["Listings", "Owners must list equipment they own or are authorised to rent out, with an accurate description, condition, location and contact number."],
        ["Safety and condition", "Owners are responsible for keeping machinery in safe working order. Farmers should inspect equipment before use and operate it responsibly."],
        ["Accounts", "Keep your login details private. We may suspend accounts that post misleading listings or misuse the platform."]
      ]}
    />
  );
}
