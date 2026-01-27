/*
  Project Gyro: "Talking In Your Sleep" - Safety Tuned Edition
  
  MAPPING (CHANNEL CONFIGURATION):
  CH 0: Eye Tilt  (70 UP, 95 MID, 120 DOWN)
  CH 1: Eye Pan   (50 LEFT [Tuned], 60 MID, 80 RIGHT)
  CH 2: L-Lid     (125 OPEN, 75 CLOSED [Tuned])
  CH 3: R-Lid     (75 OPEN, 120 CLOSED)
  CH 4: Jaw       (10 CLOSED [Tuned], 130 OPEN)
  CH 5: Neck Tilt (105 UP, 65 MID, 40 DOWN)
  CH 6: Neck Pan  (30 LEFT, 60 MID, 105 RIGHT)
*/

#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x40);

// -- HARDWARE SOFTWARE STOPS --
// Aangepaste limieten om schade te voorkomen
const int LIMIT_MIN[] = {70, 50, 75, 75, 10, 40, 30};  // Ch 1, 2 en 4 verhoogd
const int LIMIT_MAX[] = {120, 80, 125, 120, 130, 105, 105}; 

const int E_TILT_CH = 0;
const int E_PAN_CH = 1;
const int L_LID_CH = 2; 
const int R_LID_CH = 3; 
const int JAW_CH = 4;
const int N_TILT_CH = 5;
const int N_PAN_CH = 6;

unsigned long lastEyeMove = 0;

void safeSetServo(int ch, int deg) {
  if (ch < 0 || ch > 6) return; 
  int safeDeg = constrain(deg, LIMIT_MIN[ch], LIMIT_MAX[ch]);
  int pulse = map(safeDeg, 0, 180, 102, 512);
  pwm.setPWM(ch, 0, pulse);
}

void blink() {
  safeSetServo(L_LID_CH, 75);  // Nieuwe veilige sluitstand
  safeSetServo(R_LID_CH, 120); 
  delay(100);
  safeSetServo(L_LID_CH, 125); 
  safeSetServo(R_LID_CH, 75);  
}

void updateEyes(unsigned long now) {
  if (now - lastEyeMove > random(500, 2800)) {
    // Saccadic movement binnen de nieuwe veilige marges
    safeSetServo(E_PAN_CH, random(50, 75)); 
    safeSetServo(E_TILT_CH, random(85, 110));
    lastEyeMove = now;
    if (random(0, 10) > 7) blink();
  }
}

void playChorus() {
  unsigned long start = millis();
  unsigned long t = 0;
  
  while (t < 8500) {
    t = millis() - start;
    
    // -- JAW SYNC (Met nieuwe 10 graden stop) --
    int jawPos = 10; 
    if (t > 150 && t < 350) jawPos = 130;
    else if (t > 450 && t < 750) jawPos = 90;
    else if (t > 850 && t < 1000) jawPos = 130;
    else if (t > 1100 && t < 1600) jawPos = 130;
    else if (t > 2900 && t < 4600) jawPos = (sin(t * 0.02) * 35) + 95;
    else if (t > 4800 && t < 6600) jawPos = 130;
    safeSetServo(JAW_CH, jawPos);

    // -- NECK PERFORMANCE --
    float beat = abs(sin(t * (PI / 535.0)));
    int nTilt = 65 + (beat * 35); 
    int nPan = 60 + (sin(t * 0.0018) * 35); 
    
    safeSetServo(N_TILT_CH, nTilt);
    safeSetServo(N_PAN_CH, nPan);

    updateEyes(millis());
    delay(15);
  }
}

void setup() {
  Serial.begin(115200);
  Wire.begin(8, 9);
  pwm.begin();
  pwm.setPWMFreq(60);

  // -- VEILIGE OPSTART --
  safeSetServo(JAW_CH, 10);
  safeSetServo(L_LID_CH, 125);
  safeSetServo(R_LID_CH, 75);
  safeSetServo(N_TILT_CH, 65);
  safeSetServo(N_PAN_CH, 60);
  delay(1000);
}

void loop() {
  playChorus();
  
  unsigned long idleStart = millis();
  while(millis() - idleStart < 4000) {
    int breath = sin(millis() * 0.0015) * 7;
    safeSetServo(N_TILT_CH, 65 + breath);
    safeSetServo(JAW_CH, 10); // Gebruik nieuwe sluitstand
    updateEyes(millis());
    delay(20);
  }
}