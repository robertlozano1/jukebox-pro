import db from "#db/client";
import bcrypt from "bcrypt";

import { createPlaylist } from "#db/queries/playlists";
import { createPlaylistTrack } from "#db/queries/playlists_tracks";
import { createTrack } from "#db/queries/tracks";
import { createUser } from "#db/queries/users";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  // Create users first with hashed passwords
  const saltRounds = 10;
  const hashedPassword1 = await bcrypt.hash("password123", saltRounds);
  const hashedPassword2 = await bcrypt.hash("securepass456", saltRounds);

  const user1 = await createUser("musiclover1", hashedPassword1);
  const user2 = await createUser("playlistpro", hashedPassword2);

  // Create tracks (we need at least 10 tracks for 2 playlists with 5+ tracks each)
  for (let i = 1; i <= 20; i++) {
    await createTrack("Track " + i, i * 50000);
  }

  // Create playlists for each user
  const playlist1 = await createPlaylist(
    "Rock Classics",
    "The best rock hits of all time",
    user1.id
  );
  const playlist2 = await createPlaylist(
    "Chill Vibes",
    "Relaxing music for any time of day",
    user1.id
  );
  const playlist3 = await createPlaylist(
    "Workout Beats",
    "High energy songs to pump you up",
    user2.id
  );
  const playlist4 = await createPlaylist(
    "Study Focus",
    "Instrumental tracks for concentration",
    user2.id
  );

  // Add tracks to playlists (at least 5 tracks per playlist)
  // User1's first playlist - tracks 1-5
  for (let i = 1; i <= 5; i++) {
    await createPlaylistTrack(playlist1.id, i);
  }

  // User1's second playlist - tracks 6-10
  for (let i = 6; i <= 10; i++) {
    await createPlaylistTrack(playlist2.id, i);
  }

  // User2's first playlist - tracks 11-15
  for (let i = 11; i <= 15; i++) {
    await createPlaylistTrack(playlist3.id, i);
  }

  // User2's second playlist - tracks 16-20
  for (let i = 16; i <= 20; i++) {
    await createPlaylistTrack(playlist4.id, i);
  }
}
