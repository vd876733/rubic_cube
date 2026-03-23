package com.example.rubikssolver.service;

import com.example.rubikssolver.model.Step;
import cs.min2phase.Search;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SolverService {
    
    /**
     * Generate a solution for the given cube state.
     * 
     * @param cubeState a 54-character string representing the cube state
     * @return a list of steps to solve the cube
     */
    public List<Step> getSolution(String cubeState) {
        // sanity check the input
        if (cubeState == null || cubeState.length() != 54) {
            throw new IllegalArgumentException("cubeState must be a 54-character string");
        }

        // Initialize the min2phase solver
        Search.init();

        // Solve the cube
        String solution = new Search().solve(cubeState);

        if (solution.startsWith("Error")) {
            throw new IllegalArgumentException("Invalid cube state: " + solution);
        }

        // Parse the solution string into steps
        List<Step> steps = new ArrayList<>();
        String[] moves = solution.split(" ");

        for (String move : moves) {
            if (move.isEmpty()) continue;
            steps.add(parseMove(move));
        }

        return steps;
    }

    private Step parseMove(String move) {
        char face = move.charAt(0);
        boolean isPrime = move.contains("'");
        boolean isDouble = move.contains("2");

        String rotationAxis;
        double rotationAmount;
        int faceIndex;

        switch (face) {
            case 'U':
                rotationAxis = "y";
                rotationAmount = isPrime ? -Math.PI / 2 : isDouble ? Math.PI : Math.PI / 2;
                faceIndex = 0;
                break;
            case 'D':
                rotationAxis = "y";
                rotationAmount = isPrime ? Math.PI / 2 : isDouble ? Math.PI : -Math.PI / 2;
                faceIndex = 3;
                break;
            case 'R':
                rotationAxis = "x";
                rotationAmount = isPrime ? -Math.PI / 2 : isDouble ? Math.PI : Math.PI / 2;
                faceIndex = 1;
                break;
            case 'L':
                rotationAxis = "x";
                rotationAmount = isPrime ? Math.PI / 2 : isDouble ? Math.PI : -Math.PI / 2;
                faceIndex = 4;
                break;
            case 'F':
                rotationAxis = "z";
                rotationAmount = isPrime ? -Math.PI / 2 : isDouble ? Math.PI : Math.PI / 2;
                faceIndex = 2;
                break;
            case 'B':
                rotationAxis = "z";
                rotationAmount = isPrime ? Math.PI / 2 : isDouble ? Math.PI : -Math.PI / 2;
                faceIndex = 5;
                break;
            default:
                throw new IllegalArgumentException("Unknown move: " + move);
        }

        return new Step(move, rotationAxis, rotationAmount, faceIndex);
    }
}
