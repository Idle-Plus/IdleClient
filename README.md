# Idle Client

Idle Client is an unofficial third-party browser client for the game [Idle Clans](https://idleclans.com/). This project 
aims to provide an alternative way to play Idle Clans, offering additional features and quality-of-life improvements
that aren't available in the official client.

> [!IMPORTANT]
> This project is still in early development, and a lot of features and mechanics have yet to be implemented.
> Using it on the official server in its current state isn't recommended.

## Overview

The client is a React-based web application that connects to the Idle Clans server via a WebSocket relay. This relay
is necessary because the server expects a raw TCP connection, which browsers do not support directly. The project is 
still under development, with many features that have yet to be implemented.

## Features

Below is a list of currently implemented features. While it may not seem like much, some systems, like the task system, 
represent a significant portion of the game, with nine skills being fully implemented by just having basic tasks.

- Login and account page.
- System to import and work with the configData.json file.
  - Handles the data for tasks, items, upgrades, etc.
- Basic inventory management: Moving items around, equip and unequip gear.
- Basic tasks: Tasks that only consume and/or produce items.

## Project Structure

A non-exhaustive overview of the project structure.

- `idleclient/`: Core game client logic.
  - `data/`: Game data, config files, localization, atlas definitions.
  - `game/`: Game logic. *(Note: This folder is quite a mess and will likely be refactored in the future.)*
  - `network/`: Network logic.
    - `NetworkData.ts`: Automatically generated game packets and type definitions.
  - `wasm/`: WebAssembly module for the client, used when calculating experience and task times.
- `public/atlas/`: The location where the texture atlases are stored.
- `src/`: The React frontend application.

## Relay Server

The code for the relay server can be found [here](https://github.com/Idle-Plus/IdleRelay), and it mainly handles the
following:

- WebSocket connections from clients.
- TCP connections to the game servers.
- Packet serialization/deserialization.
- Re-hydration of network packets (adding default values that are stripped by the server).

For more information, visit the Idle Relay repository.

## Textures

Game items and icons are stored as texture atlases in the `public/atlas/` directory. They are created using 
[Atlaser](https://github.com/Idle-Plus/Atlaser), a tool made specifically for this project. It automatically processes
the textures: resizing and scaling images, combining them into multiple texture atlases, and generating a JSON file
that the client uses to look up individual textures.

## Contributing

Contributions are welcome and appreciated! Be it a new feature, improvements, or just bug fixes in general; your help
is encouraged. Please note that to test and run the client effectively, you will most likely need to set up and run
a local instance of the [relay](https://github.com/Idle-Plus/IdleRelay).

## FAQ

**Q**: Am I allowed to use this client? Can I get banned for using it?
<br>**A**: As far as I can tell, the client should be allowed, and you shouldn't be banned for using it. When I 
first asked Temsei about making a browser-based Idle Clans client, I got the following response: 
`Would be an interesting project for sure! Can't think of any good reasons to be against it haha go for it`.
I'm also regularly checking with Temsei about features I plan to implement, in case it's something that isn't allowed.

**Q**: Can you improve or add feature X?
<br>**A**: Maybe! If you have a feature request or suggestion, then feel free to 
[open an issue](https://github.com/Idle-Plus/IdleClient/issues) or send me a DM on Discord at `uraxys`.

## License

This project is licensed under the GNU General Public License v3.0. See the [COPYING](https://github.com/Idle-Plus/IdleClient/blob/master/COPYING) 
file for full details.
