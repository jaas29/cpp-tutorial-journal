# C++ Tutorial — José Araya, Fall 2026

Tutorial with Prof. Roy, biweekly Wednesdays. This repository is the record of the work:
lessons, reference sheets, learning records, a video log, and a dated journal.

## → Read it here: https://jaas29.github.io/cpp-tutorial-journal/

The lessons are web pages with a stylesheet and interactive recall quizzes, so they are meant
to be read at that link rather than as files in this repository.

## What is in here

| Path | What it is |
|---|---|
| `journal/` | Dated entries, one per working session: what I built, what broke, what I learned |
| `lessons/` | The lessons, worked through in order. Every command shown has been run on this machine |
| `reference/` | Sheets I keep next to me while coding. Written to print well |
| `learning-records/` | One file per thing that cost real time to figure out, with the evidence that settled it |
| `videos.html` | What I have watched, when, and what it was good for |
| `MISSION.md` | The tutorial proposal: goals, projects, checkpoints, scope |
| `RESOURCES.md` | The vetted reading and viewing list |

## The code

The C++ itself lives in its own repositories:

- **[p1-containers](https://github.com/jaas29/p1-containers)** — Project 1, the graded
  deliverable. `vector` and `unordered_map` from scratch.
- **[mystl](https://github.com/jaas29/mystl)** — scratch. Following along with video tutorials,
  breaking things on purpose. Not submitted, not graded.

## Maintaining this

After a working session: add `journal/YYYY-MM-DD.html`, log any video in `videos.html`, then

```bash
bin/build-index.sh   # regenerates the link lists in index.html and journal/index.html
git add -A && git commit && git push
```

`private/` is git-ignored and backed up separately. A pre-commit hook rejects any commit that
touches it, so it cannot reach this repository even with `git add -f`.
