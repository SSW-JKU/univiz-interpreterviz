# Trace-Based Bytecode Interpreter Visualization for Compiler Construction Education

The artifact contains our web-based visualization tool, designed to enhance the comprehension of bytecode generation and interpretation by providing an interactive and visually enriched learning experience.

This README provides the documentation for the artifact accompanying the paper "Trace-Based Bytecode Interpreter Visualization for Compiler Construction Education".
This markdown document can be thought of as a reduced version of `ArtifactDescription.pdf`, the official description that is part of our artifact.
`ArtifactDescription.pdf` contains more detailed descriptions, images, and a developer overview (implementation details, etc.).

## Artifact and Paper Links

* **Artifact Download:** The complete artifact package, including the visualizer source code, demo traces, the paper, and a supplementary video, can be downloaded from Zenodo: [https://doi.org/10.5281/zenodo.21353423](https://doi.org/10.5281/zenodo.21353423)
* **Live Demo:** A hosted instance of the visualization tool, pre-loaded with the demo traces described below, is available at: [https://ssw.jku.at/General/Staff/Weninger/Projects/InterpreterViz/VISSOFT25/demo](https://ssw.jku.at/General/Staff/Weninger/Projects/InterpreterViz/VISSOFT25/demo)
* **Source and Container:** The source repository is available at [https://github.com/SSW-JKU/univiz-interpreterviz](https://github.com/SSW-JKU/univiz-interpreterviz), and commits to its main branch publish the container image at [GitHub Container Registry](https://github.com/orgs/SSW-JKU/packages/container/package/univiz-interpreterviz).
* **Accepted Paper:** A copy of the accepted paper (`Paper.pdf`) is included in the root of the artifact package.
* **Supplementary Video:** A video demonstrating the tool's features (`Video.mp4`) is included in the root of the artifact package. It can also be viewed online at: [https://ssw.jku.at/General/Staff/Weninger/Projects/InterpreterViz/VISSOFT25/Video.mp4](https://ssw.jku.at/General/Staff/Weninger/Projects/InterpreterViz/VISSOFT25/Video.mp4)

## Artifact Structure

The artifact archive contains the following:

* `README.md`: This file.
* `ArtifactDescription.pdf`: The original PDF version of the detailed artifact description.
* `Paper.pdf`: The accepted conference paper.
* `Video.mp4`: A supplementary video demonstrating the tool.
* `visualizer.zip`: A compressed folder containing the complete source code for the web-based visualization tool.
* `demos.zip`: A compressed folder containing the five example trace files used to demonstrate the tool's features.
* `deploy/`: Docker Compose and Caddy examples for long-term server hosting.
* `.github/workflows/docker-image.yml`: The workflow that builds and publishes the production container image.
* `LICENSE.md`: The license file for the artifact.

### Installation and Hosting

There are three supported ways to run the visualizer: a manual Node.js/Yarn
build, a single local Docker container, or a long-running Docker Compose
deployment. Docker Compose is only needed for the third option.

#### 1. Manual Build and Run

This option requires Node.js v18+ and Yarn Classic v1.x.

1. Unpack `visualizer.zip`, open a terminal, and navigate into the extracted
   `visualizer` directory.
2. Install the locked dependencies, build the production bundle, and serve it:

   ```bash
   yarn
   yarn build
   yarn preview --host 0.0.0.0 --port 3000
   ```

Open `http://localhost:3000`. During development, `yarn dev` can be used instead;
Vite then displays its local URL, normally `http://localhost:5173`.

#### 2. Local Docker Run

This option requires Docker but does not require Docker Compose.

1. Unpack `visualizer.zip`, open a terminal, and navigate into the extracted
   `visualizer` directory.
2. Build and run one local container:

   ```bash
   docker build -t visualizer .
   docker run --rm -p 3000:3000 visualizer
   ```

Alternatively, run the published image without building it locally:

```bash
docker run --rm -p 3000:3000 ghcr.io/ssw-jku/univiz-interpreterviz:latest
```

Open `http://localhost:3000`. The production container serves the Vite bundle
through nginx and includes a health check and an `index.html` fallback for
direct links to application routes.

For either local option, load one of the example traces from `demos.zip` to test
the installation. The manual setup was tested on recent macOS, Windows, and
Linux systems with Node.js v18+ and Yarn Classic v1.22.19. The Docker setup was
tested with Docker v28.2.2.

#### 3. Long-Term Run on a Server (Docker Compose)

The supported long-running setup uses the files in [`deploy/`](deploy/):

* `interpreterviz-app` runs the public
  [`ghcr.io/ssw-jku/univiz-interpreterviz:latest`](https://github.com/orgs/SSW-JKU/packages/container/package/univiz-interpreterviz)
  image and binds it only to `127.0.0.1:3004` on the host.
* `interpreterviz-watchtower` checks every 120 seconds for a new `latest` image,
  replaces the application container, and removes the old image.
* A host-level reverse proxy such as Caddy exposes the loopback-only application
  through HTTPS.

Install Docker Engine and the Docker Compose plugin on the server, then download
and start the complete stack:

```bash
sudo mkdir -p /opt/interpreterviz
cd /opt/interpreterviz

sudo curl -fsSL -o docker-compose.yml \
  https://raw.githubusercontent.com/SSW-JKU/univiz-interpreterviz/HEAD/deploy/docker-compose.yml

sudo docker compose pull
sudo docker compose up -d --remove-orphans
sudo docker compose ps
```

The `HEAD` segment resolves to the repository's current default branch. To
apply a future Compose-file update immediately, rerun the download and the three
Docker Compose commands. Image-only updates are installed automatically by
Watchtower.

For HTTPS, add the block from [`deploy/Caddyfile.example`](deploy/Caddyfile.example)
to the host's Caddy configuration, replacing the domain if necessary:

```caddy
interpreter.univiz.org {
  reverse_proxy 127.0.0.1:3004
}
```

After DNS points the domain to the server, validate and reload Caddy:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Commits pushed to `main` or `master` trigger
[`docker-image.yml`](.github/workflows/docker-image.yml), which publishes both
the rolling and immutable image tags:

```text
ghcr.io/ssw-jku/univiz-interpreterviz:latest
ghcr.io/ssw-jku/univiz-interpreterviz:<commit-sha>
```

## Step-by-Step Instructions to Reproduce Paper Results

This section provides a guided tour through the five demonstration traces included in `demos.zip`. These examples are designed to showcase the core features of our tool and correspond directly to the concepts and figures presented in the paper.

You can follow these steps using either your local installation or the hosted **[Live Demo](https://ssw.jku.at/General/Staff/Weninger/Projects/InterpreterViz/VISSOFT25/demo)**. In the live demo, the traces are pre-loaded and can be selected directly from the start page. If using a local instance, you will need to load the corresponding trace file from `demos.zip`.

### 1. Arithmetic Operations

* **Paper Mapping:** This demo illustrates the core code and memory visualization features described in **Sections V (Code Visualization)** and **VI (Memory Visualization)** of the paper.
* **Input:** Select the **"Arithmetic"** demo trace.
* **Instructions & Expected Output:**
    1. Upon loading, you will see the high-level source code on the left and the corresponding bytecode on the right. To the far right is the memory visualization, showing regions for `Statics`, `Locals`, and the `Expression Stack`.
    2. Use the navigation controls (step forward/backward buttons or the slider) to execute the program.
    3. **Observe:** As you step through the `load`, `const`, `add`, and `mul` operations, notice how:
        * The currently executing bytecode instruction and the corresponding source code line are highlighted.
        * Values are pushed onto the expression stack.
        * Animations show values moving from `Statics` or `Locals` to the stack.
        * For arithmetic operations like `add`, two values from the stack are consumed and replaced by a single result, accompanied by a "merge" animation, as shown in Figure 1 of the paper's artifact description.

### 2. Heap Allocation

* **Paper Mapping:** This demo showcases dynamic memory allocation and pointer visualization, as detailed in **Section VI-B (Reference Types)** and **VI-D (Structured Data)**.
* **Input:** Select the **"Heap Allocation"** demo trace.
* **Instructions & Expected Output:**
    1. Step through the program until the `new` and `newarray` operations are executed.
    2. **Observe:**
        * The `Heap` memory region is populated with an object and an array.
        * Memory entries on the stack that refer to heap-allocated data (pointers) are drawn with a dashed border.
        * Hover your mouse over a reference entry on the stack. The corresponding object or array on the heap will be highlighted, making the pointer relationship clear.
        * Notice how object fields and array elements are grouped within labeled boxes (e.g., `Person`, `Person[]`), as shown in Figure 2 of the artifact description, making structured data easier to understand.

### 3. Control Flow

* **Paper Mapping:** This demo highlights the visualization of conditional jumps and complex control flow, as described in **Section V-B (Control Flow)**.
* **Input:** Select the **"Control Flow"** demo trace.
* **Instructions & Expected Output:**
    1. The program contains a complex `if-else if-else` statement.
    2. When the current instruction is a jump operation (e.g., `jeq`, `jmp`), an arrow is drawn in the code view from the jump instruction to its target destination.
    3. **Observe:** All related jump destinations for the conditional block are marked simultaneously, making it easy to see the overall structure of the control flow logic, as depicted in Figure 3 of the artifact description. This helps in understanding how high-level control structures are compiled into low-level branches.

### 4. Interpreter Error

* **Paper Mapping:** This demo shows how the tool handles and visualizes runtime errors, a feature discussed in **Section IV-C (Interpreter Errors)**.
* **Input:** Select the **"Interpreter Error"** demo trace.
* **Instructions & Expected Output:**
    1. Step through the execution trace. The program contains faulty bytecode that will cause a stack underflow.
    2. When you reach the erroneous `add` instruction, the execution will halt.
    3. **Observe:**
        * The faulty bytecode instruction is highlighted in red.
        * An error message appears in the relevant memory region (the `Expression Stack` in this case), explaining the error (e.g., "Stack underflow").
        * A hint is provided to help diagnose the issue, as shown in Figure 4 of the artifact description.
        * Crucially, you can still step backward to inspect the full execution history that led to the error, enabling effective debugging.

### 5. Reference Bytecode

* **Paper Mapping:** This final demo illustrates the comparison against a reference implementation to identify compiler bugs, a feature detailed in **Section V-C (Reference Bytecode)**.
* **Input:** Select the **"Reference Bytecode"** demo trace.
* **Instructions & Expected Output:**
    1. This trace was generated by a faulty compiler. The tool has been provided with both the faulty bytecode and the correct "reference" bytecode.
    2. In the code view, a third column, "Reference", appears next to the "Actual" bytecode.
    3. **Observe:**
        * The tool automatically highlights discrepancies between the two versions. In this demo, an incorrect `const_1` instruction is colored red because it does not match the expected `const_2` instruction in the reference code.
        * This feature, shown in Figure 5 of the artifact description, allows students to quickly pinpoint where their compiler implementation deviates from the correct one.
