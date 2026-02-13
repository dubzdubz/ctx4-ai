"use client"

import Link from "next/link"
import type { ComponentProps } from "react"
import { Button } from "@/components/ui/button"

type LinkButtonProps = ComponentProps<typeof Button> & {
  href: string
  target?: string
  rel?: string
}

export function LinkButton({
  href,
  variant = "default",
  children,
  target,
  rel,
  ...props
}: LinkButtonProps) {
  return (
    <Button
      render={<Link href={href} target={target} rel={rel} />}
      nativeButton={false}
      variant={variant}
      {...props}
    >
      {children}
    </Button>
  )
}
