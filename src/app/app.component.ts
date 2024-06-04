import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  title = 'multiwindow';

  @ViewChild("canvas") canvas!: ElementRef<HTMLCanvasElement>;
  private context!: CanvasRenderingContext2D;
  private key: string = "";

  async ngOnInit() {
    this.key = crypto.randomUUID();
    const arr = this.getLocations();
    arr.push({ key: this.key, x: screenX, y: screenY, w: innerWidth, h: innerHeight, time: Date.now() });
    localStorage.setItem("locations", JSON.stringify(arr));
  }

  ngAfterViewInit() {
    this.context = this.canvas.nativeElement.getContext("2d")!;
    requestAnimationFrame(this.render.bind(this));
  }

  ercanValue = 0;

  render() {
    this.context.save();
    this.canvas.nativeElement.width = innerWidth;
    this.canvas.nativeElement.height = innerHeight;
    const locations = this.getLocations();
    const loc = locations.find(val => val.key === this.key)!;
    this.updateLocation(loc);
    localStorage.setItem("locations", JSON.stringify(locations))
    this.context.fillStyle = "orange"
    const [midpointX, midpointY] = this.findMidpoints(locations);
    this.context.translate(- loc.x, - loc.y);
    //this.context.rotate(this.ercanValue++ / 180 * Math.PI);
    this.context.beginPath()
    for (let location of locations) {
      this.context.lineTo(location.x + location.w / 2, location.y + location.h / 2)
    }
    this.context.closePath()
    this.context.fill()
    this.context.stroke();
    this.context.restore();
    requestAnimationFrame(this.render.bind(this));
  }

  ngOnDestroy() {
    const arr = this.getLocations();
    localStorage.setItem("locations", JSON.stringify(arr.filter(val => val.key !== this.key)));
  }

  updateLocation(location: Loc) {
    location.x = screenX;
    location.y = screenY;
    location.w = innerWidth;
    location.h = innerHeight;
    location.time = Date.now();
  }

  findMidpoints(locations: Array<Loc>) {
    const first = locations[0];
    const second = locations[1];
    const third = locations[2];
    if (!first || !second || !third) return [0, 0];
    const center = { x: first.x + (first.x - second.x) / 2, y: first.y + (first.y - second.y) / 2 };
    return [(center.x - third.x) / 3 * 2, (center.y - third.y) / 3 * 2];
  }

  getLocations() {
    const prev = localStorage.getItem("locations");
    const arr: Array<Loc> = JSON.parse(prev ?? "[]");
    return arr.filter(loc => loc.time + 1000 > Date.now());
  }
}

type Loc = { key: string, x: number, y: number, w: number, h: number, time: number }