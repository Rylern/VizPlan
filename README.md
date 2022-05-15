# VIZPLAN: A Platform for assessing Indicator Variability Over Time



**Features**

- Interactive map with pins for each available area.
- Open an area to view its indicators status.
- Filter on performance.
- Compare an area against other areas, years, or both.
- Zooming and panning the diagram.
- Manage areas with a CSV file.
- Rank areas based on their similarities with a reference area.
- Cluster areas based on their similarities.
- Define new indicators.



## Setup

* Install [Node.js](https://nodejs.org/en/) along with NPM or Yarn.
* Install the modules and build the server:
  * With NPM:

    * `npm install`
    * `npm run build`

  * With YARN:
    * `yarn`
    * `yarn build`

* The project will be built into the `build` folder.
* The server can be launched with `node build/server.js`.
* Go to `http://localhost:9000/`.



## Development

* **DevServer**

  * ```
    npm run devserver
    yarn devserver
    ```

  * Used for front-end development (map, diagrams, rankings). The DevServer reloads the page when a front-end file is edited.

  * The source files are located in the `src` folder.

  * Exposes DevServer on the network as it listens on: 0.0.0.0, remove host line in webpack.config.js for localhost only.

  * It is not possible to test the back-end part with this mode.

* **DevServer-back**

  * ```
    npm run devserver-back
    yarn devserver-back
    ```

  * Used for back-end development (add and remove cities). The DevServer reloads the page when a back-end file is edited.

  * The source files are located in the `server` folder.

  * Changes on front-end files are not taken into account until this script is restarted.