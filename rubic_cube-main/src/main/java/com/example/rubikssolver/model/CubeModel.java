package com.example.rubikssolver.model;

/**
 * Represents the state of a Rubik's Cube with 54 stickers.
 * 
 * The cube state is indexed using the URFDLB (Up, Right, Front, Down, Left, Back) system:
 * - Indices 0-8:   Up face (White)
 * - Indices 9-17:  Right face (Red)
 * - Indices 18-26: Front face (Green)
 * - Indices 27-35: Down face (Yellow)
 * - Indices 36-44: Left face (Orange)
 * - Indices 45-53: Back face (Blue)
 * 
 * Each face is arranged as:
 *   0 1 2
 *   3 4 5
 *   6 7 8
 */
public class CubeModel {
    private char[] state;

    public CubeModel() {
        initialize();
    }

    /**
     * Initialize the cube to a solved state.
     * Each face has 9 stickers of the same color.
     */
    public void initialize() {
        state = new char[54];
        
        // Up face (White)
        for (int i = 0; i < 9; i++) {
            state[i] = 'W';
        }
        
        // Right face (Red)
        for (int i = 9; i < 18; i++) {
            state[i] = 'R';
        }
        
        // Front face (Green)
        for (int i = 18; i < 27; i++) {
            state[i] = 'G';
        }
        
        // Down face (Yellow)
        for (int i = 27; i < 36; i++) {
            state[i] = 'Y';
        }
        
        // Left face (Orange)
        for (int i = 36; i < 45; i++) {
            state[i] = 'O';
        }
        
        // Back face (Blue)
        for (int i = 45; i < 54; i++) {
            state[i] = 'B';
        }
    }

    /**
     * Rotate the Right (R) face clockwise.
     * This rotates the 9 stickers on the right face and shifts edges.
     */
    public void rotateRight() {
        // Rotate the Right face itself (indices 9-17)
        rotateFaceClockwise(9);

        // Save the edge stickers that will be moved
        char[] temp = new char[3];
        temp[0] = state[2];
        temp[1] = state[5];
        temp[2] = state[8];

        // Front right column -> Up right column
        state[2] = state[18 + 2];
        state[5] = state[18 + 5];
        state[8] = state[18 + 8];

        // Down right column -> Front right column
        state[18 + 2] = state[27 + 2];
        state[18 + 5] = state[27 + 5];
        state[18 + 8] = state[27 + 8];

        // Back left column (reversed) -> Down right column
        state[27 + 2] = state[45 + 6];
        state[27 + 5] = state[45 + 3];
        state[27 + 8] = state[45 + 0];

        // Up right column -> Back left column (reversed)
        state[45 + 6] = temp[0];
        state[45 + 3] = temp[1];
        state[45 + 0] = temp[2];
    }

    /**
     * Rotate the Up (U) face clockwise.
     */
    public void rotateUp() {
        // Rotate the Up face itself (indices 0-8)
        rotateFaceClockwise(0);

        // Save the top row of Front face
        char[] temp = new char[3];
        temp[0] = state[18 + 0];
        temp[1] = state[18 + 1];
        temp[2] = state[18 + 2];

        // Right top row -> Front top row
        state[18 + 0] = state[9 + 0];
        state[18 + 1] = state[9 + 1];
        state[18 + 2] = state[9 + 2];

        // Back top row -> Right top row
        state[9 + 0] = state[45 + 0];
        state[9 + 1] = state[45 + 1];
        state[9 + 2] = state[45 + 2];

        // Left top row -> Back top row
        state[45 + 0] = state[36 + 0];
        state[45 + 1] = state[36 + 1];
        state[45 + 2] = state[36 + 2];

        // Front top row -> Left top row
        state[36 + 0] = temp[0];
        state[36 + 1] = temp[1];
        state[36 + 2] = temp[2];
    }

    /**
     * Rotate a single face 90 degrees clockwise.
     * Face indices are arranged as:
     *   0 1 2
     *   3 4 5
     *   6 7 8
     * 
     * After rotation:
     *   6 3 0
     *   7 4 1
     *   8 5 2
     */
    private void rotateFaceClockwise(int faceStartIndex) {
        char[] face = new char[9];
        for (int i = 0; i < 9; i++) {
            face[i] = state[faceStartIndex + i];
        }

        // Rotate the face itself
        state[faceStartIndex + 0] = face[6];
        state[faceStartIndex + 1] = face[3];
        state[faceStartIndex + 2] = face[0];
        state[faceStartIndex + 3] = face[7];
        state[faceStartIndex + 4] = face[4];
        state[faceStartIndex + 5] = face[1];
        state[faceStartIndex + 6] = face[8];
        state[faceStartIndex + 7] = face[5];
        state[faceStartIndex + 8] = face[2];
    }

    /**
     * Get the current cube state as a string.
     */
    public String getState() {
        return new String(state);
    }

    /**
     * Set the cube state from a string.
     */
    public void setState(String newState) {
        if (newState.length() != 54) {
            throw new IllegalArgumentException("Cube state must be exactly 54 characters");
        }
        this.state = newState.toCharArray();
    }
}
