# Smash Up Table

A browser version of AEG's Smash Up for you and your friends: 90 factions, titans, Madness, monsters and treasure, a searchable faction picker, expert-level computer opponents, a snake draft, live online rooms, and async games you play at your own pace. Personal, non-commercial use only. Smash Up and all card art belong to Alderac Entertainment Group; art is loaded from the Smash Up wiki images shipped in `atlas/`.

Hot-seat play (everyone on one screen, with or without computer players) works as soon as the site is up. **Online rooms need a free Firebase project** (about 10 minutes, one time). Follow both parts below.

## Part 1 — Put the site on GitHub Pages

1. Create a new **public** repository on GitHub (for example `smash-up`).
2. On the repository page choose **Add file → Upload files**, drag in **everything inside this folder** (`index.html`, `config.js`, `firebase-shim.js`, `meta.json`, `atlas.json`, `covers.webp`, the `atlas` folder, `firestore.rules`, `.nojekyll`, this README) and commit. If the browser struggles with the many images, upload `atlas` in a second batch, or use GitHub Desktop / `git push`.
3. Go to **Settings → Pages**, set **Source: Deploy from a branch**, branch **main**, folder **/ (root)**, Save.
4. After a minute the site is live at `https://YOUR-NAME.github.io/REPO-NAME/`.

## Part 2 — Turn on online rooms (Firebase, free Spark plan)

1. Go to <https://console.firebase.google.com> → **Add project** (name it anything, you can turn Analytics off).
2. In the project: **Build → Authentication → Get started → Sign-in method → Anonymous → Enable → Save.**
3. **Build → Firestore Database → Create database** → pick any location → start in **production mode**.
4. In Firestore, open the **Rules** tab, replace everything with the contents of `firestore.rules`, and **Publish**.
5. **Project settings (gear icon) → General → Your apps → `</>` (Web)** → register an app (skip Hosting). Copy the `firebaseConfig` values it shows.
6. Open `config.js` in your repository (pencil icon), paste each value over the matching `PASTE_…` placeholder, and commit. Wait about a minute for Pages to redeploy.
7. Open your site on two devices → **Create a room** on one, **Join** with the 4-letter code on the other. The host's browser runs the game, so the host should keep the tab open.

If online play shows an error, the message names what is wrong (usually a config value or Anonymous sign-in not enabled). In the browser console, a "Missing or insufficient permissions" error means the rules in step 4 were not published.

## Async games

Choose **Async games → Start an async game** on the home screen. Friends join from **My games** with the 4-letter code (any time before you start), pick factions or run a snake draft, and the creator starts the game. After that nobody has to stay online: whoever the game is waiting on opens it, makes their move, and closes the tab. **My games** lists your games, marks the ones waiting on you, and the tab title shows how many (for example "(2) Smash Up Table").

- Computer players move from the browser of whoever moved last; if that tab closes mid-way, any other player who has the game open takes over after about 15 seconds.
- **Undo** takes back your last play as long as no other person has moved since.
- **Seat key:** Firebase knows each player by their browser. To carry on from another phone or computer, tap **Seat key** in the game, then on the new device join with the game code and enter that key.
- Uses the same Firebase project and the same rules as live rooms (everything lives under `rooms/`), so nothing new to set up.
- Try not to update `index.html` while an async game is half-way through: a rules change can stop old games from rebuilding. The game shows a warning if it was started on a different version.

## Good to know

- The Firebase web config in `config.js` is meant to be public. The rules above let anyone who opens your site create and join rooms, which is fine for a friends-only game; don't share the link widely.
- The free plan allows tens of thousands of reads and writes per day, plenty for several games a day. Old rooms stay in the database; delete the `rooms` collection in the console whenever you like.
- Marvel/Disney: Avengers, Kree, The Lion King and Wreck-It Ralph are playable and marked **WIP but playable** (card text paraphrased from the wiki, no card art). The other 12 Marvel/Disney factions are listed as "Coming soon".
- Every base from every set is in the base pool in every game.
- Some cards are approximations of the printed rules; they are documented in the project notes.
