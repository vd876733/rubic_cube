package com.example.rubikssolver.controller;

import com.example.rubikssolver.model.Step;
import com.example.rubikssolver.service.SolverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CubeController {
    
    @Autowired
    private SolverService solverService;
    
    /**
     * Solve the cube given its current state.
     * 
     * @param cubeState a 54-character string representing the current cube state
     * @return a list of steps to solve the cube
     */
    @PostMapping("/solve")
    public List<Step> solve(@RequestBody String cubeState) {
        return solverService.getSolution(cubeState);
    }
}
