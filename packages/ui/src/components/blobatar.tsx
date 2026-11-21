import * as React from "react"
import { Blobatar as Generated } from "@blobatar/react"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { cn } from "cn"

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

type GeneratedOptions = DistributiveOmit<React.ComponentProps<typeof Generated>, "name">

export type BlobatarProps = React.ComponentProps<typeof Avatar> & {
  /**
   * Name, display name, email, or id — any string; the same string always renders the same blobatar.
   */
  name: string
  /** A real profile image when available. Blobatar is the fallback. */
  src?: string
  alt?: string
  /** Extra options: { animate: 'hover' | 'idle' | 'spin' } */
  blobatar?: GeneratedOptions
}

export function Blobatar({ name, src, alt, blobatar, className, ...props }: BlobatarProps) {
  return (
    <Avatar className={cn("overflow-hidden", className)} {...props}>
      {src ? <AvatarImage src={src} alt={alt ?? name} /> : null}
      <AvatarFallback className="bg-transparent size-full p-0 flex items-center justify-center">
        <Generated {...blobatar} name={name} className="size-full" />
      </AvatarFallback>
    </Avatar>
  )
}
