# Supabase Schema

## swivel_profile
Profile information for a user.

| Column | Type | Notes |
|---|---|---|
| id | int8 | Primary key |
| created_at | timestamptz | |
| user_id | uuid | FK → auth.users.id |
| elo_rating | int4 | Elo rating for matchmaking |
| username | varchar | Display name |

## swivel_match
Tracks details about a match.

| Column | Type | Notes |
|---|---|---|
| id | int8 | Primary key |
| created_at | timestamptz | |
| number_of_players | int4 | Number of players in the match |
| player_one_id | int8 | FK → swivel_profile.id |
| player_two_id | int8 | FK → swivel_profile.id |

## swivel_match_move
Ordered log of moves within a match. Each row represents one action taken by a player during their turn. A full turn consists of up to 3 moves: move token, place peg, rotate tile.

| Column | Type | Notes |
|---|---|---|
| id | int8 | Primary key |
| swivel_match_id | int8 | FK → swivel_match.id |
| tile | int4 | Tile number involved in the move |
| side | int4 | Side of the tile involved in the move |
| rotate | varchar | `l` = counter-clockwise, `r` = clockwise |

## swivel_queue
Coordinates matchmaking. Users enter the queue and are paired when enough players with compatible elo ratings are waiting.

| Column | Type | Notes |
|---|---|---|
| id | int8 | Primary key |
| created_at | timestamptz | |
| user_id | uuid | FK → auth.users.id |
| desired_number_of_players | int4 | Number of players needed to start the match |
| elo_rating | int4 | Elo rating snapshot at time of queuing |
