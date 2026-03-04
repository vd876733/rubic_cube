package com.example.rubikssolver.model;

public class Step {
    private String instruction;
    private String move;
    private boolean isClockwise;
    private String faceToBlink;

    public Step() {
    }

    public Step(String instruction, String move, boolean isClockwise, String faceToBlink) {
        this.instruction = instruction;
        this.move = move;
        this.isClockwise = isClockwise;
        this.faceToBlink = faceToBlink;
    }

    public String getInstruction() {
        return instruction;
    }

    public void setInstruction(String instruction) {
        this.instruction = instruction;
    }

    public String getMove() {
        return move;
    }

    public void setMove(String move) {
        this.move = move;
    }

    public boolean isClockwise() {
        return isClockwise;
    }

    public void setClockwise(boolean clockwise) {
        isClockwise = clockwise;
    }

    public String getFaceToBlink() {
        return faceToBlink;
    }

    public void setFaceToBlink(String faceToBlink) {
        this.faceToBlink = faceToBlink;
    }

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
