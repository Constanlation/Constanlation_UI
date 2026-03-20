import { redirect } from "next/navigation";

export default function PortfolioPage() {
  redirect("/profile/depositor?from=portfolio");
}
