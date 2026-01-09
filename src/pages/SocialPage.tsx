
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp } from 'lucide-react';
import { Card, CardBody } from '@/components/Card';
import { Input } from '@/components/ui/input';
import Avatar from '@/components/Avatar';
import RankBadge from '@/components/RankBadge';
import FollowersInlineList from '@/components/social/FollowersInlineList';
import { useRankings } from '@/hooks/useRankings';
import { useUserStats } from '@/hooks/useUserStats';
import { useFollowersList } from '@/hooks/useFollowersList';
import { useAuth } from '@/contexts/AuthContext';
import { useCoachAssignment } from '@/hooks/useCoachAssignment';

const SocialPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const { coachId } = useCoachAssignment();
  const { rankings, isLoading, error } = useRankings(100, coachId); // Límite de 100 usuarios
  const { user } = useAuth();
  const { stats } = useUserStats(user?.id);
  const { followers, following, isLoading: followersLoading } = useFollowersList(user?.id);
  const navigate = useNavigate();



  // Filter users based on search query - search in both username and full_name
  const filteredUsers = rankings.filter(rankingUser => {
    const query = searchQuery.toLowerCase();
    const username = rankingUser.username?.toLowerCase() || '';
    return username.includes(query);
  });

  const topUsers = rankings.slice(0, 100); // Mostrar hasta 100 usuarios

  const handleUserClick = (userId: string) => {
    navigate(`/public-profile/${userId}`);
  };

  const handleFollowersClick = () => {
    setShowFollowing(false);
    setShowFollowers(true);
  };

  const handleFollowingClick = () => {
    setShowFollowers(false);
    setShowFollowing(true);
  };

  const handleHideLists = () => {
    setShowFollowers(false);
    setShowFollowing(false);
  };

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-6">Social</h1>
        <div className="text-center py-8 text-red-500">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-4 max-w-md mx-auto" style={{ paddingTop: 'calc(max(var(--safe-area-inset-top), 50px) + 1.5rem)' }}>
      <h1 className="text-xl font-bold mb-6">Social</h1>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar usuarios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div
          className="cursor-pointer"
          onClick={handleFollowersClick}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardBody className="text-center py-4">
              <div className="text-2xl font-bold">{stats?.followers_count || 0}</div>
              <div className="text-xs text-muted-foreground">Seguidores</div>
            </CardBody>
          </Card>
        </div>

        <div
          className="cursor-pointer"
          onClick={handleFollowingClick}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardBody className="text-center py-4">
              <div className="text-2xl font-bold">{stats?.following_count || 0}</div>
              <div className="text-xs text-muted-foreground">Siguiendo</div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Inline Followers/Following Lists */}
      {showFollowers && (
        <div className="mb-6">
          <FollowersInlineList
            followers={followers}
            title="Seguidores"
            isLoading={followersLoading}
          />
          <button
            onClick={handleHideLists}
            className="w-full mt-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Ocultar
          </button>
        </div>
      )}

      {showFollowing && (
        <div className="mb-6">
          <FollowersInlineList
            followers={following}
            title="Siguiendo"
            isLoading={followersLoading}
          />
          <button
            onClick={handleHideLists}
            className="w-full mt-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Ocultar
          </button>
        </div>
      )}

      {/* Top Users */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Top Usuarios</h3>
            <span className="text-xs text-muted-foreground">({Math.min(rankings.length, 100)})</span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="flex-1">
                    <div className="w-24 h-3 bg-muted rounded mb-1" />
                    <div className="w-16 h-2 bg-muted rounded" />
                  </div>
                  <div className="w-12 h-6 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : topUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No hay usuarios disponibles
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto hide-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
              {topUsers.map((rankingUser, index) => (
                <div
                  key={rankingUser.user_id}
                  className="flex items-center gap-3 cursor-pointer hover:bg-muted/20 rounded-lg p-2 -m-2 transition-colors active:bg-muted/30"
                  onClick={() => handleUserClick(rankingUser.user_id)}
                >
                  <div className="flex items-center gap-2 min-w-[32px]">
                    <span className="text-sm font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                  </div>

                  <Avatar
                    name={rankingUser.username}
                    size="sm"
                    src={rankingUser.avatar_url}
                  />

                  <div className="flex-1">
                    <p className="font-medium text-sm">{rankingUser.username}</p>
                    <RankBadge level={rankingUser.current_level} size="sm" showLevelWithRank={true} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Search Results */}
      {searchQuery && (
        <Card>
          <CardBody>
            <h3 className="font-semibold mb-4">
              Resultados de búsqueda ({filteredUsers.length})
            </h3>

            {filteredUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No se encontraron usuarios con "{searchQuery}"
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto hide-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
                {filteredUsers.map((rankingUser) => (
                  <div
                    key={rankingUser.user_id}
                    className="flex items-center gap-3 cursor-pointer hover:bg-muted/20 rounded-lg p-2 -m-2 transition-colors active:bg-muted/30"
                    onClick={() => handleUserClick(rankingUser.user_id)}
                  >
                    <Avatar
                      name={rankingUser.username}
                      size="sm"
                      src={rankingUser.avatar_url}
                    />

                    <div className="flex-1">
                      <p className="font-medium text-sm">{rankingUser.username}</p>
                      <div className="flex items-center gap-2">
                        <RankBadge level={rankingUser.current_level} size="sm" showLevelWithRank={true} />
                        <span className="text-xs text-muted-foreground">
                          {rankingUser.current_streak} días racha
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default SocialPage;
