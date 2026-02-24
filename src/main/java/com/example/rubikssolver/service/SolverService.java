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
        List<Step> steps = new ArrayList<>();
        
        // For now, return hardcoded test moves to verify frontend-backend communication
        steps.add(new Step(
            "Rotate the Right face",
            "R",
            true,
            "R"
        ));
        
        steps.add(new Step(
            "Rotate the Up face",
            "U",
            true,
            "U"
        ));
        
        return steps;
    }
}
