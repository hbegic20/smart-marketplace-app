declare module "@mapbox/point-geometry" {
  export default class Point {
    x: number;
    y: number;
    constructor(x: number, y: number);
    clone(): Point;
    add(point: Point): Point;
    sub(point: Point): Point;
    multByPoint(point: Point): Point;
    divByPoint(point: Point): Point;
    mult(k: number): Point;
    div(k: number): Point;
    rotate(a: number): Point;
    rotateAround(a: number, p: Point): Point;
    matMult(m: number[]): Point;
    unit(): Point;
    perp(): Point;
    round(): Point;
    mag(): number;
    equals(other: Point): boolean;
    dist(point: Point): number;
    distSqr(point: Point): number;
    angle(): number;
    angleTo(point: Point): number;
    angleWith(point: Point): number;
    angleWithSep(x: number, y: number): number;
    _matMult(m: number[]): Point;
    _add(point: Point): Point;
    _sub(point: Point): Point;
    _mult(k: number): Point;
    _div(k: number): Point;
    _unit(): Point;
    _perp(): Point;
    _rotate(a: number): Point;
    _rotateAround(a: number, p: Point): Point;
    _round(): Point;
  }
}
