import { signOut } from "@/actions/auth";
import useSupabaseUser from "@/hooks/useSupabaseUser";
import { DropdownItemProps } from "@/types/component";
import { cn } from "@/utils/helpers";
import { Logout, User } from "@/utils/icons";
import { useRouter } from "@bprogress/next/app";
import {
  addToast,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Spinner,
} from "@heroui/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import NetflixAvatar from "../other/NetflixAvatar";

interface UserProfileButtonProps {
  /** Where the account menu opens — the desktop rail anchors it to the right. */
  placement?: "bottom-end" | "right-end";
  /** `lg` renders the round avatar used by the floating rail. */
  size?: "sm" | "lg";
}

const UserProfileButton: React.FC<UserProfileButtonProps> = ({
  placement = "bottom-end",
  size = "sm",
}) => {
  const router = useRouter();
  const [logout, setLogout] = useState(false);
  const { data: user } = useSupabaseUser();
  const large = size === "lg";

  const guest = !user;

  const rawName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "User";

  const displayName = rawName.replace(/_/g, " ").trim();

  const ITEMS: DropdownItemProps[] = useMemo(
    () => [
      ...(guest
        ? [
            {
              label: "Sign In",
              href: "/auth",
              icon: <User />,
            },
          ]
        : [
            {
              label: displayName,
              description: user?.email || undefined,
              icon: <User className="text-zinc-400" />,
              showDivider: true,
              isReadOnly: true,
              className: "font-semibold text-white cursor-default select-none",
            },
            {
              label: "Logout",
              onClick: async () => {
                if (logout) return;
                setLogout(true);
                const { success, message } = await signOut();
                addToast({
                  title: message,
                  color: success ? "primary" : "danger",
                });
                if (!success) {
                  return setLogout(false);
                }
                return router.push("/auth");
              },
              icon: logout ? <Spinner size="sm" color="danger" /> : <Logout />,
              color: "danger" as const,
              className: "text-danger",
            },
          ]),
    ],
    [guest, displayName, user?.email, logout, router],
  );

  const ProfileButton = (
    <Button
      title={user?.username || "Sign In"}
      variant="light"
      isIconOnly
      size="sm"
      className={cn(
        "p-0 bg-transparent hover:bg-white/10 transition-all flex items-center justify-center focus:outline-none cursor-pointer",
        large ? "size-11 min-w-11 rounded-full" : "size-8 min-w-8 rounded-xs",
      )}
      aria-label={user?.username ? `Profile for ${user.username}` : "Sign In"}
    >
      {guest ? (
        <div
          className={cn(
            "flex items-center justify-center border border-white/20 bg-white/10 text-white/90 transition-all hover:border-white/40 hover:bg-white/20 hover:text-white shadow-xs",
            large ? "size-9 rounded-full" : "size-7 rounded-xs",
          )}
        >
          <User className={large ? "size-4" : "size-3.5"} />
        </div>
      ) : (
        <NetflixAvatar
          size={large ? 36 : 28}
          className={cn(
            "ring-1 ring-white/30 transition-all hover:scale-105 hover:ring-white/70 shadow-xs",
            large ? "size-9 rounded-full" : "size-7 rounded-xs",
          )}
        />
      )}
    </Button>
  );

  return (
    <Dropdown placement={placement} showArrow closeOnSelect={false}>
      <DropdownTrigger>{ProfileButton}</DropdownTrigger>
      <DropdownMenu
        aria-label="User profile dropdown"
        variant="flat"
        className="min-w-[140px]"
        disabledKeys={logout ? ITEMS.map((i) => i.label) : undefined}
      >
        {ITEMS.map(({ label, icon, href, onClick, ...props }) => (
          <DropdownItem
            key={label}
            startContent={icon}
            as={href ? Link : undefined}
            href={href}
            onPress={onClick}
            {...props}
          >
            {label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default UserProfileButton;
