import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/reset-password-form";

export const metadata: Metadata = { title: "Reset password", robots: { index: false, follow: false } };

export default function ResetPasswordPage() {
  return <main className="inner-page admin-page"><div className="section-shell reset-layout"><div className="page-intro"><p className="eyebrow">Portfolio admin</p><h1>Reset your password.</h1><p>Use the secure recovery link from your email, then choose a new password for the portfolio studio.</p></div><ResetPasswordForm /></div></main>;
}
