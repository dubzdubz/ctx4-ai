import { MagicLinkForm } from "@/components/auth/magic-link-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <MagicLinkForm />
    </div>
  )
}
