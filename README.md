# 3D Particle Text Effect

A React and Three.js based project that creates stunning 3D particle text effects. This project transforms text into interactive 3D particle animations with customizable parameters.

## Prerequisites for Mac

1. Install Node.js and npm:
   - Using Homebrew (recommended):
   ```bash
   # Install Homebrew if you haven't
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Install Node.js (includes npm)
   brew install node
   ```
   
   - Or download directly from [Node.js official website](https://nodejs.org/)

2. Verify installation:
   ```bash
   node --version
   npm --version
   ```

## Installation

Clone the project and install dependencies:

```bash
npm install
```

## Running the Project

Start the development server:

```bash
npm start
```

The project will automatically open in your browser at http://localhost:3000

## Effect Parameters Configuration

You can customize the 3D effect by modifying parameters in `src/Effect3DPage.js`. Here are all available parameters and their descriptions:

```javascript
<Effect3D
  frontText="G"              // Text displayed on the front
  backText="R"              // Text displayed on the back
  canvasSize={400}          // Canvas size (pixels)
  canvasBackground="#000000" // Canvas background color
  fontSize={200}            // Font size
  fontFamily="Arial Black"   // Font family
  rotationSpeed={0.005}     // Rotation speed (higher = faster)
  particleScaleSpeed={5}    // Particle scale animation speed
  particleMinScale={0.5}    // Minimum particle scale
  particleMaxScale={1.5}    // Maximum particle scale
  particleColor={0xffffff}  // Particle color (hexadecimal)
  particleGap={12}          // Gap between particles (higher = more sparse)
/>
```

### Parameter Adjustment Guidelines

1. **Text Settings**
   - `frontText` and `backText`: Can be set to any single character
   - `fontSize`: Recommended to be 40-60% of the `canvasSize`
   - `fontFamily`: Bold fonts are recommended for better visual effect

2. **Animation Settings**
   - `rotationSpeed`: Recommended range 0.001-0.01 (higher = faster rotation)
   - `particleScaleSpeed`: Recommended range 1-10 (affects particle scale animation speed)

3. **Particle Settings**
   - `particleGap`: Lower values create denser particle distribution (recommended range: 8-20)
   - `particleMinScale` and `particleMaxScale`: Control particle size variation range (default values recommended)

4. **Canvas Settings**
   - `canvasSize`: Adjust based on display area (recommended range: 300-800)
   - `canvasBackground`: Any color can be set, dark backgrounds work best

## Important Notes

- Changes to parameters take effect immediately
- Decreasing `particleGap` increases particle count, which may affect performance
- Make gradual adjustments to achieve the best balance between visual effect and performance

## Troubleshooting

If you encounter any issues with npm dependencies:

1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

3. If you get permission errors:
   ```bash
   sudo chown -R $USER /usr/local/lib/node_modules
   ```
