import fs from 'fs';

const text = "hoge foo bar";

const dirpath = "./docs/news/";
const release_notes = "./docs/RELEASES.md";
const write_data = [];

const release_note_fd = fs.openSync(release_notes, "w");

fs.writeSync(release_note_fd, "# Release notes\n");

const files = fs.readdirSync(dirpath).filter((file) => {
  return file.match(/^(\d+)\.md$/);
}).sort().reverse().map((file) => {

  const date = `${file.substring(0,4)}-${file.substring(4,6)}-${file.substring(6,8)}`;
  const md = fs.readFileSync(dirpath + file, 'utf8');
  const tmp = md.split("\n");
  const title = tmp.shift();
  const body = tmp.join("\n");

  write_data.push({
    title,
    date,
    markdown: body,
  });
  fs.writeSync(release_note_fd, body);
  fs.writeSync(release_note_fd, "\n");
});
fs.closeSync(release_note_fd);

fs.writeFileSync('./src/app/admin/News/data.js', "const data = " + JSON.stringify(write_data) + ";\nexport default data;\n");
