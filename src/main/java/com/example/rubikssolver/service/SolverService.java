package com.example.rubikssolver.service;

import com.example.rubikssolver.model.Step;
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
            throw new IllegalArgumentException("cubeState must be a 54‑character string");
        }

        List<Step> steps = new ArrayList<>();

        // ------------------------------------------------------------
        // stub solver logic: examine the string and produce descriptive
        // steps.  a real implementation would call a cube‑solving library
        // or algorithm; this is enough to exercise the UI/back‑end
        // integration.
        // ------------------------------------------------------------

        // example: if the very first sticker is not white, rotate U
        if (cubeState.charAt(0) != 'W') {
            steps.add(new Step(
                    "Bring white sticker into position",
                    "U",
                    true,
                    "U"
            ));
        }

        // always include a couple of fixed moves so the front end has
        // something to display
        steps.add(new Step(
                "Rotate the Right face clockwise",
                "R",
                true,
                "R"
        ));

        steps.add(new Step(
                "Perform a front double‑turn",
                "F2",
                true,
                "F"
        ));

        return steps;
    }
}
