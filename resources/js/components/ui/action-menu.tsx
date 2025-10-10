import * as React from "react"
import { Link } from "@inertiajs/react"
import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu"

type ActionItem = {
  label: string
  href?: string
  onClick?: (e: React.MouseEvent | Event) => void
  variant?: "default" | "destructive"
  disabled?: boolean
}

export interface ActionMenuProps {
  items: ActionItem[]
  align?: "start" | "center" | "end"
  /** Optional aria-label for the trigger button */
  label?: string
  /** Optional className to style the trigger button wrapper */
  className?: string
}

/**
 * Small reusable action menu for tables. Replaces inline buttons with a compact ⋮ menu.
 */
export function ActionMenu({ items, align = "end", label = "Open actions", className }: ActionMenuProps) {
  // Stop propagation helper to avoid triggering row click navigation
  const stop = (e: React.SyntheticEvent | Event) => {
    e.stopPropagation?.()
  }

  return (
    <div className={className} onClick={stop}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={label}
            className="h-8 w-8 p-0"
          >
            {/* Use literal three vertical dots as requested */}
            <span aria-hidden>⋮</span>
            <span className="sr-only">{label}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} sideOffset={6}>
          {items.map((item, idx) => {
            if (item.href) {
              return (
                <DropdownMenuItem
                  key={idx}
                  data-variant={item.variant}
                  onSelect={(e) => {
                    // prevent Radix from stopping navigation; Link will handle
                    // but still avoid bubbling to the row
                    e.preventDefault()
                  }}
                  disabled={item.disabled}
                  asChild
                >
                  <Link href={item.href} onClick={(e) => e.stopPropagation()}>{item.label}</Link>
                </DropdownMenuItem>
              )
            }
            return (
              <DropdownMenuItem
                key={idx}
                data-variant={item.variant}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  item.onClick?.(e)
                }}
                disabled={item.disabled}
              >
                {item.label}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default ActionMenu
