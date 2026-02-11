"use client"

import Link from "next/link"
import type { ComponentProps } from "react"
import { Button } from "@/components/ui/button"

type LinkButtonProps = ComponentProps<typeof Button> & {
  href: string
}

export function LinkButton({ href, variant = "default", children, ...props }: LinkButtonProps) {
  return (
    <Button render={<Link href={href} />} nativeButton={false} variant={variant} {...props}>
      {children}
    </Button>
  )
}
