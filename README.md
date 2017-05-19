# Shin KGS

An unofficial JavaScript client for [KGS Go Server](http://www.gokgs.com/).

Available at https://shin.gokgs.com/

<img src="https://s3.amazonaws.com/shinkgs.com/assets/screenshot-ios-safari.png" alt="Screenshot - iOS Safari" width="375" height="667">

## Goals

* First-class web and mobile experience
* Retain community vibe of KGS
* Start small, release early
* Work towards native versions (Electron, React Native, Cordova)
* [Bus factor](https://en.wikipedia.org/wiki/Bus_factor) > 1

## Progress

- [x] Game lists
- [x] Game spectating and chat
- [x] Room chat
- [x] User chat (direct messaging)
- [x] View and edit user details
- [x] Submit challenge proposal (no negotiating)
- [ ] Create challenge
- [ ] Negotiate challenge
- [ ] Automatch
- [x] Basic game playing
- [ ] Full-featured game playing (fine-tuned UI, rengo, simul)
- [ ] Review tools
- [ ] Admin/moderation tools
- [ ] Everything else

More detail: [Version 1 Milestone](https://github.com/jkk/shinkgs/milestone/1)

## Contributing

Contributions welcome. Please check the [Version 1 Milestone](https://github.com/jkk/shinkgs/milestone/1) and [Issues](https://github.com/jkk/shinkgs/issues) to help coordinate efforts. Feel free to create an issue if there isn't one already for what you have in mind.

Issues with the ["difficulty: starter"](https://github.com/jkk/shinkgs/issues?q=is%3Aopen+is%3Aissue+label%3A%22difficulty%3A+starter%22) label are good tasks to get started on. Reach out if you need any guidance!

## Code Overview

This project uses JavaScript, React, and ES6+ with [Flow](https://flow.org/) types. [VS Code](https://code.visualstudio.com/) (with eslint and flow extensions added) is a great editor for this setup.

State is managed with a Redux-like pattern: there is a single, primary source of truth for app state, plus a bit of component-local state. Messages describing actions are dispatched, which handlers then process to produce the next app state. Unlike typical Redux, no implicit context is used. Everything is passed down through props.

## Development Setup

You'll need [Node.js](https://nodejs.org/en/) and [Yarn](https://yarnpkg.com/en/).

To install and start a local dev server, run:

```
yarn
yarn start
```

Note: the dev server will use HTTPS, which is required to interact with the KGS API. You will have to trust the self-signed certificate.

Requests are sent to the official KGS API by default. To use a custom API endpoint:

```
REACT_APP_API_URL=https://example.com/api/access yarn start
```

(Note: Safari does not allow cookies from unvisited third-party domains, so in development mode requests will be proxied through a local server.)

If you don't have eslint or flow in your editor, you can check for errors with:

```
yarn lint
```

## Deploying the Web App

The easiest way to deploy the app is to use the [▲now service](https://zeit.co/now):

```
yarn global add now
yarn deploy-now
```

This builds the app then pushes it out to the cloud with a unique URL.

## Running an API Server

This project depends on the new JSON-based KGS API.

The official API is available at https://www.gokgs.com/json/. Obsolete older versions are (at least for now) [available for download](https://www.gokgs.com/help/protocol.html).

There's a `Dockerfile` in the `kgs-api` directory that makes running the older API on your local machine easy. To use it, install [Docker](https://www.docker.com/), then:

```
cd kgs-api
docker build -t kgs-api .
docker run -p 8080:8080 kgs-api
```

This will start a server at http://localhost:8080

To deploy to [now.sh](https://zeit.co/now) using their `Dockerfile` support:

```
now kgs-api
```

## References

* [KGS API Docs](https://www.gokgs.com/json/protocol.html)
* [KGS API Download](https://www.gokgs.com/help/protocol.html)
* [KGS Client Coding Google Group](https://groups.google.com/forum/#!forum/kgs-client-coding)

## Similar Projects

* [Go Universe](https://github.com/IlyaKirillov/GoUniverse)
* [KGS Leben](https://github.com/stephenmartindale/kgs-leben)
