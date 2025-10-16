import db from "#db/client";

export async function createPlaylist(name, description, userId) {
  const sql = `
  INSERT INTO playlists
    (name, description, user_id)
  VALUES
    ($1, $2, $3)
  RETURNING *
  `;
  const {
    rows: [playlist],
  } = await db.query(sql, [name, description, userId]);
  return playlist;
}

export async function getPlaylists() {
  const sql = `
  SELECT *
  FROM playlists
  `;
  const { rows: playlists } = await db.query(sql);
  return playlists;
}

export async function getPlaylistById(id) {
  const sql = `
  SELECT *
  FROM playlists
  WHERE id = $1
  `;
  const {
    rows: [playlist],
  } = await db.query(sql, [id]);
  return playlist;
}

export async function getPlaylistsByUserId(userId) {
  const sql = `
  SELECT *
  FROM playlists
  WHERE user_id = $1
  `;
  const { rows: playlists } = await db.query(sql, [userId]);
  return playlists;
}

export async function getPlaylistWithTracks(id) {
  // Get playlist info
  const playlistSql = `
  SELECT *
  FROM playlists
  WHERE id = $1
  `;
  const {
    rows: [playlist],
  } = await db.query(playlistSql, [id]);

  if (!playlist) return null;

  // Get tracks for this playlist
  const tracksSql = `
  SELECT tracks.*
  FROM tracks
  JOIN playlists_tracks ON playlists_tracks.track_id = tracks.id
  WHERE playlists_tracks.playlist_id = $1
  `;
  const { rows: tracks } = await db.query(tracksSql, [id]);

  return {
    ...playlist,
    tracks,
  };
}
