"use client";

import { IconDots, IconLogout, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { Thread } from "./conversation";

const item = "h-8 gap-2.5 rounded-md px-2.5 text-[13px]";

type User = {
  name: string;
  email: string;
  initials: string;
};

type Props = {
  user: User;
  threads: Thread[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onChange: (threads: Thread[]) => void;
  onSignOut: () => void;
};

export function ChatSidebar({
  user,
  threads,
  activeId,
  onSelect,
  onNew,
  onChange,
  onSignOut,
}: Props) {
  const [renameId, setRenameId] = useState<string | null>(null);
  const [name, setName] = useState("");

  const commitRename = () => {
    if (renameId && name.trim()) {
      onChange(
        threads.map((t) => (t.id === renameId ? { ...t, title: name.trim() } : t)),
      );
    }
    setRenameId(null);
  };

  return (
    <Sidebar className="border-sidebar-border" collapsible="offcanvas">
      <SidebarHeader className="gap-2 px-3 pt-3 pb-1">
        <Button className="h-8.5 rounded-lg text-[13px]" onClick={onNew}>
          <IconPlus className="size-3.5" stroke={2.2} />
          New chat
        </Button>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-3 pt-2">
        <SidebarGroup className="p-0 pb-2">
          <SidebarGroupLabel className="h-5 px-2 font-semibold text-[10px] text-muted-foreground/80 uppercase tracking-[0.08em]">
            Today
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {threads.map((t) => (
                <SidebarMenuItem key={t.id}>
                  {renameId === t.id ? (
                    <input
                      aria-label="Thread name"
                      autoFocus
                      className="h-7 w-full rounded-md border border-primary bg-background px-2 text-[13px] outline-none ring-3 ring-primary/20"
                      onBlur={commitRename}
                      onChange={(event) => setName(event.target.value)}
                      onFocus={(event) => event.target.select()}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") commitRename();
                        if (event.key === "Escape") setRenameId(null);
                      }}
                      value={name}
                    />
                  ) : (
                    <>
                      <SidebarMenuButton
                        className="h-7 px-2 text-[13px] data-active:bg-muted"
                        isActive={t.id === activeId}
                        onClick={() => onSelect(t.id)}
                      >
                        <span className="truncate">{t.title}</span>
                      </SidebarMenuButton>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <SidebarMenuAction
                              aria-label="Thread actions"
                              className="top-1! text-muted-foreground"
                              showOnHover
                            />
                          }
                        >
                          <IconDots className="size-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="w-48 rounded-xl p-1.5"
                          finalFocus={false}
                          side="bottom"
                          sideOffset={6}
                        >
                          <DropdownMenuGroup className="flex flex-col gap-0.5">
                            <DropdownMenuItem
                              className={item}
                              onClick={() => {
                                setRenameId(t.id);
                                setName(t.title);
                              }}
                            >
                              <IconPencil stroke={1.8} />
                              Rename
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator className="my-1" />
                          <DropdownMenuItem
                            className={item}
                            onClick={() =>
                              onChange(threads.filter((x) => x.id !== t.id))
                            }
                            variant="destructive"
                          >
                            <IconTrash stroke={1.8} />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border border-t p-0">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                className="flex h-14 w-full items-center gap-2.5 px-3 text-left outline-none transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 aria-expanded:bg-muted/60"
                type="button"
              />
            }
          >
            <Avatar className="size-7.5 rounded-lg">
              <AvatarFallback className="rounded-lg">{user.initials}</AvatarFallback>
            </Avatar>
            <span className="flex min-w-0 grow flex-col gap-px">
              <span className="truncate font-medium text-[13px]">{user.name}</span>
              <span className="truncate text-[11px] text-muted-foreground">
                {user.email}
              </span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className="w-[calc(var(--anchor-width)-1rem)] rounded-xl p-1.5"
            side="top"
            sideOffset={8}
          >
            <div className="flex items-center gap-2.5 px-2 pt-1.5 pb-2.5">
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg">{user.initials}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col gap-px">
                <span className="font-medium text-[13px]">{user.name}</span>
                <span className="text-[11px] text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className={item} onClick={onSignOut}>
              <IconLogout stroke={1.8} />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
