import express from "express";
const router = express.Router();
export default router;

import {
  getTracks,
  getTrackById,
  getPlaylistsByTrackAndUser,
} from "#db/queries/tracks";
import requireUser from "#middleware/requireUser";

router.route("/").get(async (req, res) => {
  const tracks = await getTracks();
  res.send(tracks);
});

router.route("/:id").get(async (req, res) => {
  const track = await getTrackById(req.params.id);
  if (!track) return res.status(404).send("Track not found.");
  res.send(track);
});

// 🔒GET /tracks/:id/playlists sends all playlists owned by the user that contain this track
router.route("/:id/playlists").get(requireUser, async (req, res) => {
  const track = await getTrackById(req.params.id);
  if (!track) return res.status(404).send("Track not found.");

  const playlists = await getPlaylistsByTrackAndUser(
    req.params.id,
    req.user.id
  );
  res.send(playlists);
});
