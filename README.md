# 3D Interactive Engine Simulation

A high-fidelity, interactive 3D simulation of various internal combustion and electric engines, built with React, Three.js (React Three Fiber), and TypeScript.

![Engine Simulation Screenshot](./public/screenshot.png) *Add a screenshot here later*

## Features

### 🏎️ Engine Types
*   **4-Stroke Piston Engine (Otto Cycle):** detailed simulation of the intake, compression, power, and exhaust strokes with realistic thermodynamics.
*   **Wankel Rotary Engine:** accurate mathematical model of the epitrochoid housing and Reuleaux triangle rotor geometry.
*   **V8 Engine (Crossplane):** 8-cylinder configuration with a realistic 1-8-4-3-6-5-7-2 firing order and inertial force calculations.
*   **Electric Motor (3-Phase AC/IPM):** simulation of Field Oriented Control (FOC), flux vectors, and thermal heating.

### 🔬 Physics & "PhD Mode"
This isn't just an animation; it's a physics simulation running at 60Hz.
*   **Thermodynamics:** Adiabatic compression, Wiebe function combustion heat release, and variable specific heat ratio ($\gamma$).
*   **Fluid Dynamics:** Volumetric efficiency modeling based on piston speed and choking limits.
*   **Electromagnetism:** Real-time calculation of $I_d/I_q$ currents, Back EMF, and stator resistance thermal degradation.
*   **Telemetry:** Live graphs for PV Loops (Pressure-Volume), Torque, Temperature, and Vector Scopes.

### 🛠️ Tech Stack
*   **Frontend:** React 18, Vite
*   **3D Graphics:** Three.js, @react-three/fiber, @react-three/drei
*   **Styling:** Tailwind CSS
*   **Audio:** Web Audio API (Procedural engine sound synthesis)

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/3d-engine-sim.git
    cd 3d-engine-sim
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  Open `http://localhost:5173` in your browser.

## Controls
*   **Engine Switcher:** Toggle between Piston, Rotary, Electric, and V8 modes top-left.
*   **RPM Slider:** Drag to rev the engine.
*   **Pause/Manual:** Pause the simulation to manually scrub through the engine cycle (great for learning valve timing).
*   **Telemetry:** Click the "Heartbeat" icon top-right to view live physics data.
*   **Visibility:** Toggle the "Visible" eye icon to show/hide the engine block/housing.

## License
MIT
