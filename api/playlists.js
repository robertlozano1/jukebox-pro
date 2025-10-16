import express from "express";
const router = express.Router();
export default router;

import {
  createPlaylist,
  getPlaylistById,
  getPlaylistsByUserId,
  getPlaylistWithTracks,
} from "#db/queries/playlists";
import { createPlaylistTrack } from "#db/queries/playlists_tracks";
import { getTracksByPlaylistId } from "#db/queries/tracks";
import requireUser from "#middleware/requireUser";

// All /playlists routes require the user to be logged in
router.use(requireUser);

router
  .route("/")
  .get(async (req, res) => {
    // GET /playlists sends array of all playlists owned by the user
    const playlists = await getPlaylistsByUserId(req.user.id);
    res.send(playlists);
  })
  .post(async (req, res) => {
    if (!req.body) return res.status(400).send("Request body is required.");

    const { name, description } = req.body;
    if (!name || !description)
      return res.status(400).send("Request body requires: name, description");

    // POST /playlists creates a new playlist owned by the user
    const playlist = await createPlaylist(name, description, req.user.id);
    res.status(201).send(playlist);
  });

router.param("id", async (req, res, next, id) => {
  const playlist = await getPlaylistById(id);
  if (!playlist) return res.status(404).send("Playlist not found.");

  // Check if user owns this playlist
  if (playlist.user_id !== req.user.id) {
    return res.status(403).send("Access denied. You do not own this playlist.");
  }

  req.playlist = playlist;
  next();
});

// GET /playlists/:id sends specific playlist, including all tracks
router.route("/:id").get(async (req, res) => {
  const playlistWithTracks = await getPlaylistWithTracks(req.playlist.id);
  res.send(playlistWithTracks);
});

router
  .route("/:id/tracks")
  // GET /playlists/:id/tracks sends 403 error if the user does not own the playlist
  .get(async (req, res) => {
    const tracks = await getTracksByPlaylistId(req.playlist.id);
    res.send(tracks);
  })
  .post(async (req, res) => {
    if (!req.body) return res.status(400).send("Request body is required.");

    const { trackId } = req.body;
    if (!trackId) return res.status(400).send("Request body requires: trackId");

    const playlistTrack = await createPlaylistTrack(req.playlist.id, trackId);
    res.status(201).send(playlistTrack);
  });
