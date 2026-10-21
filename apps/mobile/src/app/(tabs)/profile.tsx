import { useSession } from "@core/providers/session-provider";
import { ROUTES } from "@core/routing/routes";
import { ConfirmSheet } from "@features/profile/components/confirm-sheet";
import { EditNameSheet } from "@features/profile/components/edit-name-sheet";
import { ProfileFooter } from "@features/profile/components/profile-footer";
import { ProfileHeader } from "@features/profile/components/profile-header";
import { useSignOut } from "@features/profile/hooks/use-sign-out";
import { CATALOGUE } from "@shared/data/catalogue";
import { useCatalogueGrid } from "@shared/hooks/use-catalogue-grid";
import { EmptyState } from "@wearly/ui-native/display";
import { ProductGrid } from "@wearly/ui-native/product-grid";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";

/**
 * Profile.
 *
 * Personal and warm rather than administrative. Identity and progress lead,
 * saved pieces are a first-class part of the screen, and the account and
 * information groups sit below the grid.
 *
 * The list stays the existing `ProductGrid` (FlashList) so the whole screen is
 * one vertical scrolling surface — the header and footer are the grid's own
 * header and footer, never a `ScrollView` wrapped around a list.
 *
 * Editing the name opens a sheet that owns its own draft and saving; this
 * screen only decides which sheet is open. Sign-out confirms first and goes
 * through Better Auth, so the server session is revoked rather than only the
 * local copy being cleared.
 */

export default function ProfileScreen() {
  const router = useRouter();
  const { state } = useSession();
  const { isSigningOut, signOut } = useSignOut();
  const [editNameOpen, setEditNameOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);

  const saved = useMemo(
    () => CATALOGUE.filter((piece) => state.favourites.includes(piece.id)),
    [state.favourites]
  );
  const { favourites, items, onFavourite } = useCatalogueGrid(saved);

  return (
    <View className="flex-1 bg-background">
      <ProductGrid
        className="flex-1 px-3"
        emptyState={
          <EmptyState
            body="Tap the heart on any piece and it will wait for you here."
            icon="heart"
            title="Nothing saved yet"
          />
        }
        favourites={favourites}
        footer={
          <ProfileFooter
            isAuthenticated={state.isAuthenticated}
            onEditName={() => setEditNameOpen(true)}
            onSignOut={() => setSignOutOpen(true)}
          />
        }
        header={<ProfileHeader onSignIn={() => router.push(ROUTES.signIn)} />}
        items={items}
        onFavourite={onFavourite}
        onOpen={(id) => router.push(ROUTES.product(id))}
      />

      <EditNameSheet
        currentName={state.name ?? ""}
        onClose={() => setEditNameOpen(false)}
        open={editNameOpen}
      />

      <ConfirmSheet
        body="You can sign back in at any time. Saved pieces stay on this device."
        confirmLabel="Sign out"
        onClose={() => setSignOutOpen(false)}
        onConfirm={async () => {
          const done = await signOut();
          if (done) {
            setSignOutOpen(false);
          }
        }}
        open={signOutOpen}
        pending={isSigningOut}
        title="Sign out?"
      />
    </View>
  );
}
