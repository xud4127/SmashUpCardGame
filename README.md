# Smash Up Table

A browser version of AEG's Smash Up for you and your friends: 90 factions, titans, Madness, monsters and treasure, a searchable faction picker, expert-level computer opponents, a snake draft, and online games you play at your own pace. Personal, non-commercial use only. Smash Up and all card art belong to Alderac Entertainment Group; art is loaded from the Smash Up wiki images shipped in `atlas/`.

Hot-seat play (everyone on one screen, with or without computer players) works as soon as the site is up. **Online games need a free Firebase project** (about 10 minutes, one time). Follow both parts below.

## Part 1 — Put the site on GitHub Pages

1. Create a new **public** repository on GitHub (for example `smash-up`).
2. On the repository page choose **Add file → Upload files**, drag in **everything inside this folder** (`index.html`, `config.js`, `firebase-shim.js`, `meta.json`, `atlas.json`, `covers.webp`, the `atlas` folder, `firestore.rules`, `.nojekyll`, this README) and commit. If the browser struggles with the many images, upload `atlas` in a second batch, or use GitHub Desktop / `git push`.
3. Go to **Settings → Pages**, set **Source: Deploy from a branch**, branch **main**, folder **/ (root)**, Save.
4. After a minute the site is live at `https://YOUR-NAME.github.io/REPO-NAME/`.

## Part 2 — Turn on online games (Firebase, free Spark plan)

1. Go to <https://console.firebase.google.com> → **Add project** (name it anything, you can turn Analytics off).
2. In the project: **Build → Authentication → Get started → Sign-in method → Anonymous → Enable → Save.** Then **Add new provider → Email/Password → Enable** (only the first switch) **→ Save** — this is what player accounts use.
3. **Build → Firestore Database → Create database** → pick any location → start in **production mode**.
4. In Firestore, open the **Rules** tab, replace everything with the contents of `firestore.rules`, and **Publish**.
5. **Project settings (gear icon) → General → Your apps → `</>` (Web)** → register an app (skip Hosting). Copy the `firebaseConfig` values it shows.
6. Open `config.js` in your repository (pencil icon), paste each value over the matching `PASTE_…` placeholder, and commit. Wait about a minute for Pages to redeploy.
7. Open your site on two devices → **Online → Start a game** on one, then on the other open **My games** and join with the 4-letter code.

If online play shows an error, the message names what is wrong (usually a config value or Anonymous sign-in not enabled). In the browser console, a "Missing or insufficient permissions" error means the rules in step 4 were not published.

## Online games

Choose **Online → Start a game** on the home screen. Friends join from **My games** with the 4-letter code (any time before you start), pick factions or run a snake draft, and the creator starts the game. After that nobody has to stay online: whoever the game is waiting on opens it, makes their move, and closes the tab. **My games** lists your games, marks the ones waiting on you, and the tab title shows how many (for example "(2) Smash Up Table").

- Computer players move from the browser of whoever moved last; if that tab closes mid-way, any other player who has the game open takes over after about 15 seconds.
- **Undo** takes back your last play as long as no other person has moved since.
- **Seat key:** Firebase knows each player by their browser. To carry on from another phone or computer, tap **Seat key** in the game, then on the new device join with the game code and enter that key.
- Everything lives under `rooms/` in Firestore, so the rules above cover it.
- Try not to update `index.html` while a game is half-way through: a rules change can stop old games from rebuilding. The game shows a warning if it was started on a different version.

## Player accounts

On the home screen (or **⚙ Menu** in a game), tap **Sign in or create an account**. Accounts are a username and a password (6+ characters); no email is needed.

- Signed in, **My games** follows you to any phone or computer, so seat keys aren't needed.
- Creating an account on a device you've been playing on as a guest keeps that device's games. Signing in to an existing account on a guest device moves the guest's games into the account.
- Guests can still play without an account.
- **Forgotten password:** there's no email to reset it. In the Firebase console → **Authentication → Users**, delete that user (their username shows as `name@players.example.com`); they can then create the account again with the same username. Their old games stay reachable with seat keys.
- Upload the new `firebase-shim.js` along with `index.html` — accounts live in that file.

## Good to know

- The Firebase web config in `config.js` is meant to be public. The rules above let anyone who opens your site start and join games, which is fine for a friends-only game; don't share the link widely.
- The free plan allows tens of thousands of reads and writes per day, plenty for several games a day. Old games stay in the database; delete the `rooms` collection in the console whenever you like.
- Marvel/Disney: Avengers, Kree, The Lion King and Wreck-It Ralph are playable and marked **WIP but playable** (card text paraphrased from the wiki, no card art). The other 12 Marvel/Disney factions are listed as "Coming soon".
- Every base from every set is in the base pool in every game.
- Some cards are approximations of the printed rules; they are documented in the project notes.
