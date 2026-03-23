package com.example.rubikssolver.model;

public record Step(
    String move,
    String rotationAxis,
    Double rotationAmount,
    Integer faceIndex
) {}

    @Override
    public String toString() {
        return "Step{" +
                "instruction='" + instruction + '\'' +
                ", move='" + move + '\'' +
                ", isClockwise=" + isClockwise +
                ", faceToBlink='" + faceToBlink + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Step step = (Step) o;

        if (isClockwise != step.isClockwise) return false;
        if (instruction != null ? !instruction.equals(step.instruction) : step.instruction != null) return false;
        if (move != null ? !move.equals(step.move) : step.move != null) return false;
        return faceToBlink != null ? faceToBlink.equals(step.faceToBlink) : step.faceToBlink == null;
    }

    @Override
    public int hashCode() {
        int result = instruction != null ? instruction.hashCode() : 0;
        result = 31 * result + (move != null ? move.hashCode() : 0);
        result = 31 * result + (isClockwise ? 1 : 0);
        result = 31 * result + (faceToBlink != null ? faceToBlink.hashCode() : 0);
        return result;
    }
}
