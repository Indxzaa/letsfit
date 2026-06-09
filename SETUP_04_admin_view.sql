-- ============================================================
-- SETUP_04: admin_users_view
-- Run AFTER SETUP_03 (profiles table must exist)
-- ============================================================

create or replace view public.admin_users_view as
  select
    p.id,
    p.username,
    p.role,
    p.updated_at,
    coalesce((p.data->>'xp')::int, 0)                                         as xp,
    coalesce((p.data->>'fitCoins')::int, 0)                                    as fit_coins,
    coalesce((p.data->>'totalSessions')::int, 0)                               as total_sessions,
    coalesce((p.data->>'totalReps')::int, 0)                                   as total_reps,
    jsonb_array_length(coalesce(p.data->'unlockedAchievements','[]'::jsonb))   as achievement_count,
    jsonb_array_length(coalesce(p.data->'unlockedItems','[]'::jsonb))          as unlocked_items
  from public.profiles p;
