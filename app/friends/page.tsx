'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { FriendList } from '@/components/social/friends/FriendList';
import { AddFriendModal } from '@/components/social/friends/AddFriendModal';
import { useSocialContext } from '@/components/social/SocialProvider';
import { useAuth } from '@/components/AuthProvider';

export default function FriendsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { friends, presence, invites } = useSocialContext();
  const [showAdd, setShowAdd] = useState(false);

  if (!user) {
    router.replace('/signin');
    return null;
  }

  const username = (user.user_metadata?.username as string | undefined)
    ?? user.email?.split('@')[0]
    ?? 'User';
  const avatar = (user.user_metadata?.avatar as string | null) ?? null;

  return (
    <div className="min-h-screen page-bg">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-app">
            Friends
          </h1>
          <p className="text-sm text-muted mt-1">
            Add friends and invite them to workout together.
          </p>
        </div>

        <FriendList
          friends={friends.friends}
          pendingReceived={friends.pendingReceived}
          pendingSent={friends.pendingSent}
          presenceMap={presence.presenceMap}
          onAccept={async (id) => { await friends.acceptRequest(id); }}
          onRemove={async (id) => { await friends.removeFriend(id); }}
          onAddFriend={() => setShowAdd(true)}
        />

        {showAdd && (
          <AddFriendModal
            onSearch={friends.searchUsers}
            onSendRequest={async (userId) => friends.sendRequest(userId)}
            onClose={() => setShowAdd(false)}
          />
        )}
      </div>
    </div>
  );
}
