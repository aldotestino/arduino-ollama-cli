import { Board, Led } from 'johnny-five';

class LedController {
  private board: Board;
  private led: Led;
  private pin: number;

  constructor(pin) {
    this.pin = pin;
  }

  async initialize() {
    return new Promise<void>(resolve => {
      this.board = new Board({ debug: false, repl: false });
      this.board.on('ready', () => {
        this.led = new Led(this.pin);
        resolve();
      });
    });
  }

  onCommand(command: 'on' | 'off' | 'toggle' | 'state') {
    return command === 'on' ? this.turnOn()
      : command === 'off' ? this.turnOff()
        : command === 'toggle' ? this.toggle()
          : this.getState();
  }

  turnOn() {
    this.led.on();
    return true;
  }

  turnOff() {
    this.led.off();
    return false;
  }

  toggle() {
    this.led.toggle();
    return this.led.isOn;
  }

  getState() {
    return this.led.isOn;
  }
}

export default LedController;