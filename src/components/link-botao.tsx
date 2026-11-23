import Link from "next/link";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";

/** Link com aparência de botão. */
export function LinkBotao({
  href,
  ...props
}: { href: string } & Omit<ComponentProps<typeof Button>, "render" | "nativeButton">) {
  return <Button nativeButton={false} render={<Link href={href} />} {...props} />;
}
