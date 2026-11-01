// Stands in for yt-dlp in the tests (YTDLP_PATH): lists two videos for any channel, and "downloads" one by
// copying a test clip (FAKE_YTDLP_CLIP) and a thumbnail (FAKE_YTDLP_THUMB), with the info file yt-dlp writes.
// A channel called @blocked answers the way YouTube does when it wants the server to sign in.
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const url = args[args.length - 1];
if (args.includes('--version')) {
  console.log('2099.01.01-fake');
  process.exit(0);
}
if (args.includes('-U')) process.exit(0);
if (/@blocked/.test(url)) {
  console.error("ERROR: [youtube] abc: Sign in to confirm you're not a bot. Use --cookies-from-browser or --cookies");
  process.exit(1);
}
if (args.includes('--flat-playlist')) {
  console.log(
    JSON.stringify({
      _type: 'playlist',
      title: 'Fake Channel',
      entries: [
        { _type: 'url', id: 'AAAAAAAAAAA', title: 'First fake', duration: 4, url: 'https://www.youtube.com/watch?v=AAAAAAAAAAA' },
        { _type: 'url', id: 'BBBBBBBBBBB', title: 'Second fake', duration: 4, url: 'https://www.youtube.com/shorts/BBBBBBBBBBB' },
      ],
    }),
  );
  process.exit(0);
}
const dir = path.dirname(args[args.indexOf('-o') + 1]);
const id = new URL(url).searchParams.get('v');
console.log('[download]  50.0% of 1.00MiB at 1.00MiB/s');
console.log('[download] 100.0% of 1.00MiB in 00:01');
fs.copyFileSync(process.env.FAKE_YTDLP_CLIP, path.join(dir, 'video.mp4'));
if (process.env.FAKE_YTDLP_THUMB) fs.copyFileSync(process.env.FAKE_YTDLP_THUMB, path.join(dir, 'video.jpg'));
fs.writeFileSync(
  path.join(dir, 'video.info.json'),
  JSON.stringify({
    id,
    title: `Imported ${id}`,
    description: 'From the fake YouTube',
    tags: ['speedrun', 'fake'],
    upload_date: '20190315',
    chapters: [
      { start_time: 0, title: 'Start' },
      { start_time: 2, title: 'The end' },
    ],
  }),
);
