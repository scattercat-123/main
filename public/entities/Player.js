export class Player {
  heightDelta = 0
  isRespawning = false
  isMoving = false
  hasJumpedOnce = false
  coyoteLapse = 0.1
  constructor(
    posX,
    posY,
    speed,
    jumpForce,
    nbLives,
    currentLevelScene,
    isInTerminalScene
  ) {
    this.isInTerminalScene = isInTerminalScene
    this.currentLevelScene = currentLevelScene
    this.initialX = posX
    this.initialY = posY
    this.makePlayer()
    this.setPlayerControls()
    this.speed = speed
    this.jumpForce = jumpForce
    this.lives = nbLives
    this.previousHeight = this.gameObj.pos.y
  }

  makePlayer(x, y) {

    this.gameObj = add([
      sprite("player", { anim: "idle" }),
      area({ shape: new Rect(vec2(0, 3), 8, 8) }),
      anchor("center"),
      pos(this.initialX, this.initialY),
      scale(4),
      body(),
      "player",
    ])
  }
  enablePassThrough() {
    this.gameObj.onBeforePhysicsResolve((collison) => {
      if (collison.target.is("passthrough") && this.gameObj.isJumping()) {
        collison.preventResolution()
      }
      if (collison.target.is("passthrough") && (isKeyDown("down") || isKeyDown("s"))) {
        collison.preventResolution();
      }
    })
  }
  enableCoinPickUp() {
    this.gameObj.onCollide("coin", (coin) => {
      this.coins++
      destroy(coin)
      play("coin")
    })
  }

  setPlayerControls() {
    onKeyDown("left", () => {
      if (this.gameObj.curAnim() !== "run") this.gameObj.play("run")
      this.gameObj.flipX = true
      if (!this.isRespawning) this.gameObj.move(-this.speed, 0)
      this.isMoving = true
    })
    onKeyDown("a", () => {
      if (this.gameObj.curAnim() !== "run") this.gameObj.play("run")
      this.gameObj.flipX = true
      if (!this.isRespawning) this.gameObj.move(-this.speed, 0)
      this.isMoving = true
    })
    onKeyDown("right", () => {
      if (this.gameObj.curAnim() !== "run") this.gameObj.play("run")
      this.gameObj.flipX = false
      if (!this.isRespawning) this.gameObj.move(+this.speed, 0)
      this.isMoving = true
    })
    onKeyDown("d", () => {
      if (this.gameObj.curAnim() !== "run") this.gameObj.play("run")
      this.gameObj.flipX = false
      if (!this.isRespawning) this.gameObj.move(+this.speed, 0)
      this.isMoving = true
    })
    let canJump = false;
    onKeyPress("t", () => {
      canJump = !canJump;
      console.log("Jumping toggled:", canJump ? "ON" : "OFF");
    });

    onKeyDown("space", () => {
      if (canJump && (!this.isRespawning)) {
        this.gameObj.jump(this.jumpForce);
      } else {
      }
    })
    onKeyDown((key) => {
      if ((key === "space" || key === "w" || key === "up") && this.gameObj.isGrounded() && (!this.isRespawning)) {
        this.hasJumpedOnce = false
        this.gameObj.jump(this.jumpForce);
        play("jump");


        if (
          !this.gameObj.isGrounded() &&
          time() - this.timeSinceLastGrounded < this.coyoteLapse &&
          !this.hasJumpedOnce
        ) {
          this.hasJumpedOnce = true
          this.gameObj.jump(this.jumpForce)
          play("jump")
        }

      }
    })
    onKeyRelease(() => {
      if (isKeyReleased("right") || isKeyReleased("left") || isKeyReleased("d") || isKeyReleased("a"))
        this.gameObj.play("idle")
      this.isMoving = false
    })
  }
  respawnPlayer() {
    if (this.lives > 0) {
      this.gameObj.pos = vec2(this.initialX, this.initialY)
      this.isRespawning = true
      setTimeout(() => this.isRespawning = false, 800)
    }
  }
  update() {
    onUpdate(() => {
      if (this.gameObj.isGrounded()) {
        this.hasJumpedOnce = false
        this.timeSinceLastGrounded = time()
      }

      this.heightDelta = this.previousHeight - this.gameObj.pos.y
      this.previousHeight = this.gameObj.pos.y
      if (this.gameObj.pos.y > 1000) {
        play("hit", { speed: 1.3 })
        this.respawnPlayer()
      }

      if (!this.isMoving && this.gameObj.curAnim() !== "idle") {
        this.gameObj.play("idle")
      }

      if (
        !this.gameObj.isGrounded() &&
        this.heightDelta > 0 &&
        this.gameObj.curAnim() !== "jump-up"
      ) {
        this.gameObj.play("jump-up")
      }

      if (
        !this.gameObj.isGrounded() &&
        this.heightDelta < 0 &&
        this.gameObj.curAnim() !== "jump-down"
      ) {
        this.gameObj.play("jump-down")
      }
    })
  }
}