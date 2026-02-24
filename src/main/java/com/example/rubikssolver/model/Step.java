package com.example.rubikssolver.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Step {
    private String instruction;
    private String move;
    private boolean isClockwise;
    private String faceToBlink;
}
