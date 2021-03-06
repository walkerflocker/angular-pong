import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  @Input() public gameWidth: number;
  @Input() public gameHeight: number;

  @Input() public gameStartSubject: Subject<any>;

  public leftPaddleTop: number;
  public rightPaddleTop: number;
  public leftScore: number;
  public rightScore: number;


  public ballTop: number;
  public ballLeft: number;

  private gameInterval;
  private decrementTimeout;
  private disableMouse: boolean;
  private θ: number;
  private pi: number;
  private velocity: number;
  private alreadyInZone = false;
  public timer: number;
  private level: number;

  constructor() {
    this.pi = Math.PI;
  }

  ngOnInit() {
    this.resetGame();
    this.resetScores();
  }

  private resetGame() {
    this.leftPaddleTop = this.gameHeight / 2 - 60;
    this.rightPaddleTop = this.gameHeight / 2 - 60;
    this.ballTop = this.gameHeight / 2 - 40;
    this.ballLeft = 30;
    clearTimeout(this.decrementTimeout);
    clearTimeout(this.gameInterval);
    this.timer = 0;
    this.disableMouse = true;
  }
  private resetScores() {
    this.rightScore = 0;
    this.leftScore = 0;
  }

  public onMouseMove(event: MouseEvent) {
    if (!this.disableMouse) {
      this.rightPaddleTop = Math.min(Math.max(event.clientY, 100), 430) - 100;
    }
  }

  private start(level) {
    clearTimeout(this.decrementTimeout);
    this.velocity = 10 + level * level;
    this.θ = (Math.random() * (Math.random() > 0.5 ? -this.pi : this.pi)) / 12 + this.pi / 6;
    this.gameInterval = setInterval(() => {
      this.updateBall();
      this.updateAi();
      this.checkForCollision();
    }, 20);
  }
  private updateBall() {
    this.ballLeft += Math.cos(this.θ) * this.velocity;
    this.ballTop += Math.sin(this.θ) * this.velocity;
  }
  private checkForCollision() {
    if (this.ballTop > this.gameHeight - 20 || this.ballTop < 0) {
      this.θ = -this.θ;
    } else if (this.ballLeft > this.gameWidth - 50 &&
               this.rightPaddleTop + 60 > this.ballTop &&
               this.rightPaddleTop <= this.ballTop + 20 &&
               !this.alreadyInZone) {
      this.velocity = this.velocity > 0 ? -this.velocity : this.velocity;
      this.θ = -this.θ;
      this.alreadyInZone = true;
      if (this.rightPaddleTop + 45 <= this.ballTop || this.rightPaddleTop + 15 >= this.ballTop + 20) {
        if (this.θ > 0) {
          this.θ += (this.pi / 3 - this.θ) / 2;  // limit to 60 degrees
        } else {
          this.θ -= (this.pi / 3 - this.θ) / 2;
        }
      } else {
         this.θ =  6 * this.θ / 7;
      }
    } else if (this.ballLeft < 30 &&
               this.leftPaddleTop + 60 >= this.ballTop &&
               this.leftPaddleTop <= this.ballTop + 20 &&
               !this.alreadyInZone) {
      this.velocity = -this.velocity;
      this.θ = -this.θ;
      this.alreadyInZone = true;
      if (this.leftPaddleTop + 45 <= this.ballTop || this.leftPaddleTop + 15 >= this.ballTop + 20) {
        if (this.θ > 0) {
          this.θ += (this.pi / 3 - this.θ) / 2;  // limit to 60 degrees
        } else {
          this.θ -= (this.pi / 3 - this.θ) / 2;
        }
      } else {
         this.θ =  6 * this.θ / 7;
      }
    } else if (this.ballLeft > this.gameWidth - 20 || this.ballLeft < 0) {
      clearTimeout(this.gameInterval);
      if (this.ballLeft < 0) {
        this.rightScore ++;
      } else {
        this.leftScore ++;
      }
      setTimeout(() => {
        this.resetGame();
        if (this.rightScore < 11 && this.leftScore < 11) {
          this.decrementTimer(3);
        }
      }, 500);
    } else {
      this.alreadyInZone = false;
    }
  }
  private updateAi() {
    if (this.ballLeft < this.gameWidth * (this.level > 2 ? 0.6 : 0.5) && this.velocity < 0) {
      if (this.leftPaddleTop + 60 < this.ballTop + 20) {
        this.leftPaddleTop += 4 + this.level * 3;
      } else if (this.leftPaddleTop > this.ballTop) {
        this.leftPaddleTop -= 4 + this.level * 3;
      }
    }
  }
  public onNewGameClicked(level: number) {
      this.level = level;
      this.resetScores();
      this.resetGame();
      this.decrementTimer(3);
  }
  private decrementTimer(timer: number) {
    this.disableMouse = false;
    this.timer = timer;
    if (this.timer > 0) {
      this.decrementTimeout = setTimeout(() => {
        this.decrementTimer(timer - 1);
      }, 1000);
    } else {
      this.start(this.level);
    }
  }

}
